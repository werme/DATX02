'use strict';

Darwinator.Level = function (game) {
    this.game           = game;
    this.spawnPositions = [];
    this.map            = null;
    this.enemies        = null;
    this.layer1         = null;
    this.layer2         = null;
    this.layer3         = null;

    this.loadLevel();
    this.initSpawnPosition();
    this.game.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
};

Darwinator.Level.prototype = {

    loadLevel: function () {
        this.map = new Phaser.Tilemap(this.game, 'level1');
        this.map.addTilesetImage('tiles', 'tiles');
        this.layer1 = this.map.createLayer('Tile Layer 2');
        this.layer2 = this.map.createLayer('Tile Layer 1');
        Darwinator.setTileSize(this.map.tileWidth, this.map.tileHeight);

        // TODO For debug only
        this.layer2.debug = true;

        this.map.collisionLayer = this.layer;
        this.map.setCollisionByExclusion([1, 168, 156, 157, 158, 172, 173, 174, 188, 189, 190, 205]);
        this.layer2.resizeWorld();
        this.initPathFinder();
    },

    initPathFinder: function () {
        Darwinator.Pathfinder = new EasyStar.js();
        // Darwinator.Pathfinder.enableDiagonals();
        var indexes = Darwinator.Helpers.convertTileMap(this.layer2.map.layers[0].data);
        Darwinator.Pathfinder.setGrid(indexes);
        Darwinator.Pathfinder.setAcceptableTiles([1, 168, 156, 157, 158, 172, 173, 174, 188, 189, 190, 205]);
    },

    spawnEnemies: function () {
        this.enemies = Darwinator.GeneticAlgorithm.generatePopulation(this.game, this.game.player, this.enemies, true, this.spawnPositions);
        return this.enemies;
    },

    initSpawnPosition: function () {
        var matrix = Darwinator.Helpers.convertTileMap(this.map.layers[0].data);

        for (var i = 0; i < matrix.length; i++) {
            for (var j = 0; j < matrix[i].length; j++) {
                if (matrix[i][j] === 168) {
                    this.spawnPositions.push(Darwinator.Helpers.tileToPixels(j,i));
                }
            }
        }
    },

    addTopLayer: function() {
        this.layer3 = this.map.createLayer('Tile Layer 3');
    }

};
