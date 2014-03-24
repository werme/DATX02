'use strict';

Darwinator.Level = function(game) {
  this.game 			= game;
  this.spawnPositions = [];
  this.map      		= null;
  this.enemies 		= null;
  this.loadLevel();
  this.initSpawnPosition();
  this.game.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
}

Darwinator.Level.prototype = {

  loadLevel: function () {
    this.map = this.game.add.tilemap('level1');
    this.map.addTilesetImage('GroundTiles', 'GroundTiles');
    this.map.addTilesetImage('ObjectTiles', 'ObjectTiles');
    this.map.addTilesetImage('WaterTiles', 'WaterTiles');
    this.map.createLayer('Water');
    this.map.createLayer('Ground');
    this.layer = this.map.createLayer('Collision');
    this.map.createLayer('Objects');

    Darwinator.setTileSize(this.map.tileWidth, this.map.tileHeight);

    // TODO For debug only
    //this.layer.debug = true;

    this.map.collisionLayer = this.layer;
    this.map.setCollisionByExclusion([1025], true, this.layer);
    this.layer.resizeWorld();
    this.initPathFinder();
  },

  initPathFinder: function () {
  	Darwinator.Pathfinder = new EasyStar.js();
    // Darwinator.Pathfinder.enableDiagonals();
    var indexes = Darwinator.Helpers.convertTileMap(this.layer.map.layers[0].data);
    Darwinator.Pathfinder.setGrid(indexes);
    Darwinator.Pathfinder.setAcceptableTiles([1192]);
  },

  spawnEnemies: function () {
 	  this.enemies = Darwinator.GeneticAlgorithm.generatePopulation(this.game, this.game.player, undefined, true, this.spawnPositions);
  },

  initSpawnPosition: function () {
    var matrix = Darwinator.Helpers.convertTileMap(this.map.layers[3].data);

    for (var i = 0; i < matrix.length; i++) {
      for(var j = 0; j < matrix[i].length; j++) {
        if (matrix[i][j] === 1192){
          this.spawnPositions.push(Darwinator.Helpers.tileToPixels(j,i));
        }
      }
    }
  },

  addTopLayer: function() {
    this.map.createLayer('TopLayer');
  }

}
