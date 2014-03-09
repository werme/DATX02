'use strict';

Darwinator.GameState = function() {
  this.player    = null;
  this.enemy     = null;
  this.cursors   = null;
  this.map       = null;
  this.tileset   = null;
  this.layer     = null;
  this.fps       = null;
  this.stats     = null;
  this.health    = null;
  this.pauseText = null;
};

Darwinator.GameState.prototype = {

  create: function () {
    this.loadLevel();
    this.game.world.setBounds(0,0, this.map.widthInPixels, this.map.heightInPixels);

    this.cursors = this.game.input.keyboard.createCursorKeys();

    this.initPauseOverlay();

    // Since states by default lack a callback for the resume event.
    this.game.onResume.add(this.resumed, this);

    this.spawnPlayer(160, 620);

    this.enemy = new Darwinator.Enemy(this.game, this.game.player, 160, 400, 100);
    this.game.add.existing(this.enemy);
    
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

    Darwinator.setTileSize(this.map.tileWidth, this.map.tileHeight);

    this.map.setCollisionByExclusion([1337, 168]);
    this.map.createLayer('Tile Layer 2');
    this.layer = this.map.createLayer('Tile Layer 1');
    this.layer.debug = true;
    
    this.map.collisionLayer = this.layer;
    this.layer.resizeWorld();
  },

  spawnPlayer: function (x, y) {

    // Instanciate new player or reset existing.
    if (!this.game.player) {
      this.game.player = new Darwinator.Player(this.game, x, y, Darwinator.PLAYER_START_HEALTH, this.cursors); 
    } else {
      this.game.player.reset(x, y, Darwinator.PLAYER_START_HEALTH);
      this.game.player.bringToTop();

      // TODO: Find out why this is neccessary.
      this.game.player.cursors = this.cursors;
    } 

    // Add player sprite to stage and focus camera.
    this.game.add.existing(this.game.player);
    this.game.camera.follow(this.game.player);
  },

  initPauseOverlay: function() {
    var styling = { fontSize: '16px', fill: '#fff', align: 'center' },
        x       = this.game.width  / 2,
        y       = this.game.height / 2;

    // Render text centered and fixed to camera.
    this.pauseText = this.game.add.text(x, y, 'Game paused', styling);
    this.pauseText.anchor.setTo(0.5, 0.5);
    this.pauseText.fixedToCamera = true;

    // Should be hidden by default.
    this.pauseText.visible = false;
  },

  update: function () {
    this.game.physics.collide(this.game.player, this.layer);
    this.game.physics.collide(this.enemy, this.layer);

    // For development only
    this.fps.content = 'FPS: ' + this.game.time.fps;
    this.stats.content = 'Player stamina: ' + Math.round(this.game.player.currBreath) + '/' + this.game.player.stamina;
    this.health.content = 'Health: ' + this.game.player.health;
  },

  },

  paused: function () {
    this.pauseText.visible = true;
  },

  resumed: function() {
    this.pauseText.visible = false;
  }

};
