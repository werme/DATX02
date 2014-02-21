(function() {
  'use strict';

  function Game() {
    this.player   = null;
    this.enemy    = null;
    this.cursors  = null;
    this.map      = null;
    this.tileset  = null;
    this.layer    = null;
    this.fps      = null;
  }

  Game.prototype = {

    create: function () {
      this.game.world.setBounds(0,0, 1280, 940);
      this.background = this.add.sprite(0,0, 'background');

      var x = 680
        , y = this.game.height / 2;

      this.map = this.game.add.tilemap('level1');
      this.map.addTilesetImage('tiles', 'tiles');
      //to be changed
      this.map.setCollisionByExclusion([7, 2]);


      this.layer = this.map.createLayer('Tile Layer 1');

      this.layer.resizeWorld();

      this.cursors = this.game.input.keyboard.createCursorKeys();

      this.player = new window.Darwinator.Player(this.game, x, y, 100, this.cursors);
      this.player.scale.setTo(2,2);
      this.enemy = new window.Darwinator.Enemy(this.game, 100, 100, 100);

      this.game.add.existing(this.enemy);
      this.game.add.existing(this.player);
      this.game.camera.follow(this.player);

      // For development only
      this.fps = this.game.add.text(16, 16, 'FPS: 0', { fontSize: '16px', fill: '#F08' });
      this.fps.fixedToCamera = true;
    },

    update: function () {
      this.game.physics.collide(this.player, this.layer);
      this.game.physics.moveToObject(this.enemy, this.player, 50);

      // For development only
      this.fps.content = 'FPS: ' + this.game.time.fps;
    }

  };

  window.Darwinator = window.Darwinator || {};
  window.Darwinator.Game = Game;

}());
