'use strict';

Darwinator.Level = function(game) {
  this.game 			    = game;
  this.spawnPositions = [];
  this.map      		  = null;
  this.enemies 		    = null;
  this.toplayer       = null;
  this.collisionLayer = null;
  this.objectLayer    = null;
  this.spawnTiles     = 1192; // Tile ID from tilemap where we want enemies to spawn.
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
    this.collisionLayer = this.map.createLayer('Collision');
    this.objectLayer = this.map.createLayer('Objects');

    Darwinator.setTileSize(this.map.tileWidth, this.map.tileHeight);

    // TODO For debug only
    //this.collisionLayer.debug = true;

    this.map.collisionLayer = this.collisionLayer;
    this.map.setCollisionByExclusion([0], true, this.collisionLayer);
    this.collisionLayer.resizeWorld();
    this.initPathFinder();
  },

  initPathFinder: function () {
    var indexes = Darwinator.Helpers.convertTileLayer(this.collisionLayer);
    Darwinator.Pathfinder = new Darwinator.AStar(indexes, true);
  },

  spawnEnemies: function () {
    this.enemies = Darwinator.GeneticAlgorithm.generatePopulation(this.game, this.game.player, this.enemies, true, this.spawnPositions);
    return this.enemies;
  },

  initSpawnPosition: function () {
    var matrix = Darwinator.Helpers.convertTileLayer(this.objectLayer);

    for (var i = 0; i < matrix.length; i++) {
      for(var j = 0; j < matrix[i].length; j++) {
        if (matrix[i][j] === this.spawnTiles){
          this.spawnPositions.push(Darwinator.Helpers.tileToPixels(i,j));
        }
      }
    }
    console.log(this.spawnPositions);
  },

  addTopLayer: function() {
    this.toplayer = this.map.createLayer('TopLayer');
  }

}
