'use strict';

Darwinator.Helpers = {

  /**
  * Given a layer in a tileMap, returns the index of the tile in every
  * position of the layer.
  * @method Darwinator.Helpers#convertTileMap
  * @param {Array} - [layer] The layer to convert
  * @return {Array} - The converted map
  */
  convertTileLayer: function(tileLayer) {

    var array = tileLayer.layer.data;
    var indexes = new Array(array.length);

    for (var i = 0; i < indexes.length; i++) {
      indexes[i] = new Array(array[i].length);
      for(var l = 0; l < indexes[i].length; l++) {
        indexes[i][l] = !!array[l][i] ? array[l][i].index : 0;
      }
    }
    return indexes;
  },

  /**
  * Calculate what tile a specific pixel is in.
  * @method Darwinator.Helpers#pixelsToTile
  * @param {Number} - [x] The x-value of the pixel
  * @param {Number} - [y] The y-value of the pixel
  * @return {Array} - The indexes of the tile, given as [x,y]
  */
  pixelsToTile: function(x, y) {
    if (x < 0) {
      x = 0;
    }
    if (y < 0) {
      y = 0;
    }
    var pos = {
      x: Math.floor(x / Darwinator.TILE_WIDTH),
      y: Math.floor(y / Darwinator.TILE_HEIGHT)
    };

    return pos;
  },

  /**
  * Calculate the position in pixels of a tile.
  * @method Darwinator.Helpers#tileToPixels
  * @param {Number} - [x] The x-index of the tile
  * @param {Number} - [y] The y-index of the tile
  * @return {Tuple} - The pixel in the center of the tile, returned as an object with properties x,y
  */
  tileToPixels: function(xCor, yCor) {
    var tileWidth = Darwinator.TILE_WIDTH;
    var tileHeight = Darwinator.TILE_HEIGHT;
    var pos = {
      x: Math.floor(xCor * tileWidth + (tileWidth / 2)),
      y: Math.floor(yCor * tileHeight + (tileHeight / 2))
    };

    return pos;
  },

  /**
  * Calculates distance between two points. Works for both distance in pixels and distance in tiles.
  * @method Darwinator.Helpers#calculateDistance
  * @param {Array/Tuple} - [pos1] The first point, given as [x,y] or as an object with properties x,y
  * @param {Array/Tuple} - [pos2] The second point, given as [x,y] or as an object with properties x,y
  * @return {Number} The distance between the two points.
  */
  calculateDistance: function(pos1, pos2) {
    var x1 = pos1.hasOwnProperty('x') ? pos1.x : pos1[0];
    var y1 = pos1.hasOwnProperty('y') ? pos1.y : pos1[1];
    var x2 = pos2.hasOwnProperty('x') ? pos2.x : pos2[0];
    var y2 = pos2.hasOwnProperty('y') ? pos2.y : pos2[1];
    var dx = x1 - x2;
    var dy = y1 - y2;
    return Math.sqrt(dx*dx + dy*dy);
  },

  /**
  * @method Darwinator.Helpers#calculatePosition
  * @param {Number} - [x] Current x position
  * @param {Number} - [y] Current y position
  * @param {Number} - [distance] Distance to new position
  * @param {Number} - [angle] Angle between old and new position
  * @return {Object}  New position as an object with x and y properties
  */
  calculatePosition: function(x, y, distance, angle){
    var xNew = x + distance * Math.cos(angle);
    var yNew = y + distance * Math.sin(angle);
    return {x: xNew, y: yNew};
  },

  /**
  * Checks whether or not there is a collidable tile between the two targets.
  * If it's possible to draw a line between the objects without it intersecting
  * with a collidable tile, true is returned, otherwise, false.
  * @method Darwinator.Helpers#clearLineToTarget
  * @param {Obj} - The object containing the starting position
  * @param {Obj} - The object containing the ending position
  * @param {Game} - A reference to the game in which the two objects exists
  * @return {Bool}  True if a line can be drawn between the objects without intersecting
  *                 a collidable tile, otherwise false.
  */
  clearLineToTarget: function(from, to, game) {
      var rayCast = new Phaser.Line(from.x, from.y, to.x, to.y);
      return game.level.collisionLayer.getRayCastTiles(rayCast).length === 0;
  },

  /**
  * Translates an enemy group of sprites to chromosomes and fitness levels. 
  * The index of the most fit individual is also provided.
  *
  * @method Darwinator.Helpers#enemiesToChromosomes
  * @param {Phaser.Group} - A group of enemy sprites
  * @return {Array} - Chromosomes, fitnessLevels and the index of the fittest individual.
  *                     as [chromosomes, fitnessLevels, fittestIndex]
  */
  enemiesToChromosomes: function(enemyGroup, varRange){
    // Function for converting a single Phaser.Sprite into a chromosome
    var enemyToChromosome = function (enemy, varRange){
      var attrSum = enemy.attributes.strength + enemy.attributes.agility + enemy.attributes.intellect;
      var chrom = [enemy.attributes.strength, enemy.attributes.agility, enemy.attributes.intellect];
      
      // distribute remaining points
      var i = 0;
      while(attrSum++ < varRange) {
        chrom[i++ % Darwinator.NUMBER_OF_GENES]++;
      }

      return chrom;
    };

    var currentSize, population, i, enemy;
    currentSize = enemyGroup.length; //could add an extra param for this.
    population  = [];
    population.bestIndex = 0;
    for(i = 0; i < currentSize; i++){
      enemy = enemyGroup.getAt(i);
      population[i].chromosome = enemyToChromosome(enemy, varRange);
      population[i].fitness    = Darwinator.EVALUATE_ENEMY(enemy);
      if (population[i].fitness > population[population.bestIndex].fitness) {
        population.bestIndex = i;
      }
    }
    return population;
  },

    /**
  * Replaces the given group of enemy sprites to the next generation of sprites.
  *
  * @method Darwinator.GeneticAlgorithm#translatePopulation
  * @param {Array} [population] - The chromosomes of the new generation.
  * @param {Phaser.Group} [enemyGroup] - The enemy sprite group to replace.
  * @param {Phaser.Game} [game] - The game that uses the algorithm.
  * @param {Phaser.Sprite} [target] - The sprite to be attacked by the enemies.
  * @param {Array} [spawnPositions] - The positions on which the enemies are allowed to spawn.
  * @return {Phaser.Group} The new group of enemies.
  */    
  chromosomesToEnemies: function(population, game, spawnPositions){
    // FIXME possible memory leak, should call destroy but it crashes for some reason..
    //game.enemies.destroy(true);
    var enemyGroup = game.add.group();
    for(var i = 0; i < population.length; i++){
      var pos         = spawnPositions[i % spawnPositions.length];
      var strength    = population[i][0];
      var agility     = population[i][1];
      var intellect   = population[i][2];
      var enemy       = new Darwinator.Enemy(game, undefined, pos.x, pos.y, undefined, strength, agility, intellect);
      enemyGroup.add(enemy);
    }
    return enemyGroup;
  },

};
