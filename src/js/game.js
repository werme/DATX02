'use strict';

Darwinator.GameState = function() {
  this.player   = null;
  this.enemy    = null;
  this.cursors  = null;
  this.map      = null;
  this.tileset  = null;
  this.layer    = null;
  this.fps      = null;
  this.stats    = null;
}

Darwinator.GameState.prototype = {

  create: function () {
    this.game.world.setBounds(0,0, 1280, 940);
    this.background = this.add.sprite(0,0, 'background');

    this.cursors = this.game.input.keyboard.createCursorKeys();

    this.player = new Darwinator.Player(this.game, 160, 620, 100, this.cursors);
    this.player.scale.setTo(2,2);
    this.enemy = new Darwinator.Enemy(this.game, this.player, 160, 400, 100);

    this.game.add.existing(this.enemy);
    this.game.add.existing(this.player);
    this.game.camera.follow(this.player);

    // For development only
    this.fps = this.game.add.text(16, 16, 'FPS: 0', { fontSize: '16px', fill: '#F08' });
    this.fps.fixedToCamera = true;

    this.stats = this.game.add.text(16, 40, '', { fontSize: '16px', fill: '#F08' });
    this.stats.fixedToCamera = true;

    Darwinator.Pathfinder = new EasyStar.js();
    Darwinator.Pathfinder.enableDiagonals();
    this.loadLevel();
  },

  loadLevel: function() {
    this.map = this.game.add.tilemap('level1');
    this.map.addTilesetImage('tiles', 'tiles');
    //to be changed

    Darwinator.GlobalValues.tileSize(this.map.tileWidth, this.map.tileHeight);

    this.map.setCollisionByExclusion([]);
    var indexes = Darwinator.Helpers.convertTileMap(this.map.layers[0].data);
    Darwinator.Pathfinder.setGrid(indexes);
    Darwinator.Pathfinder.setAcceptableTiles([30]);
    this.layer = this.map.createLayer('Tile Layer 1');
    this.layer.resizeWorld();
  },

  update: function () {
    this.game.physics.collide(this.player, this.layer);
    this.game.physics.collide(this.enemy, this.layer);

    // For development only
    this.fps.content = 'FPS: ' + this.game.time.fps;
    this.stats.content = 'Player stamina: ' + Math.round(this.player.currBreath) + '/' + this.player.stamina;
  },

  getTileSize: function() {
    var size = null;
    if (this.map !== null) {
      size = [];
      size[0] = this.map.tileWidth;
      size[1] = this.map.tileHeight;
    }
    return size;
  }

};
