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
  this.health   = null;
}

Darwinator.GameState.prototype = {

  create: function () {
    this.loadLevel();
    this.game.world.setBounds(0,0, this.map.widthInPixels, this.map.heightInPixels);
    console.log(this.map);

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

    this.health = this.game.add.text(16, 64, '', {fontSize: '16px', fill: '#F08' });
    this.health.fixedToCamera = true;

    this.gameOver = this.game.add.text(this.game.width / 2, this.game.height / 2, '', {fontSize: '48px', fill:'#F08'});
    this.gameOver.fixedToCamera = true;

    Darwinator.Pathfinder = new EasyStar.js();
    Darwinator.Pathfinder.enableDiagonals();
    var indexes = Darwinator.Helpers.convertTileMap(this.map.layers[0].data);
    Darwinator.Pathfinder.setGrid(indexes);
    Darwinator.Pathfinder.setAcceptableTiles([1337, 168]);

  },

  loadLevel: function() {
    this.map = this.game.add.tilemap('level1');
    this.map.addTilesetImage('tiles', 'tiles');

    Darwinator.GlobalValues.tileSize(this.map.tileWidth, this.map.tileHeight);

    this.map.setCollisionByExclusion([1337, 168]);
    this.map.createLayer('Tile Layer 2');
    this.layer = this.map.createLayer('Tile Layer 1');

    this.map.collisionLayer = this.layer;
    this.layer.resizeWorld();
  },

  update: function () {

    this.game.physics.collide(this.player, this.layer);
    this.game.physics.collide(this.enemy, this.layer);

    // For development only
    this.fps.content = 'FPS: ' + this.game.time.fps;
    this.stats.content = 'Player stamina: ' + Math.round(this.player.currBreath) + '/' + this.player.stamina;
    this.health.content = 'Health: ' + this.player.health;
  },

  getTileSize: function() {
    var size = null;
    if (this.map !== null) {
      size = [];
      size[0] = this.map.tileWidth;
      size[1] = this.map.tileHeight;
    }
    return size;
  },
};
