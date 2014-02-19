(function() {
  'use strict';

  function Game() {
    this.player = null;
    this.cursors = null;
    this.map = null;
    this.tileset = null;
    this.layer = null;
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


      this.player = this.add.sprite(x, y, 'player');
      this.player.anchor.setTo(0.5, 0.5);
      this.player.animations.add('walk-left', [8,9,10,11], 10, true);
      this.player.animations.add('walk-right', [12,13,14,15], 10, true);
      this.player.animations.add('walk-up', [0,1,2,3], 10, true);
      this.player.animations.add('walk-down', [4,5,6,7], 10, true);

      this.player.scale.setTo(3,3);

      this.player.body.collideWorldBounds = true;

      this.cursors = this.game.input.keyboard.createCursorKeys();
      this.game.camera.follow(this.player);
    },

    update: function () {
      this.player.body.velocity.setTo(0,0);
      this.game.physics.collide(this.player, this.layer);


      if (this.cursors.up.isDown) {
        this.player.body.velocity.y = -100;
        this.player.animations.play('walk-up');
      } 
      if (this.cursors.left.isDown) {
        this.player.body.velocity.x = -100;
        this.player.animations.play('walk-left');
      }
      if (this.cursors.right.isDown) {
        this.player.body.velocity.x = 100;
        this.player.animations.play('walk-right');
      }
      if (this.cursors.down.isDown) {
        this.player.body.velocity.y = 100;
        this.player.animations.play('walk-down');
      }
    }

  };

  window.darwinator.Game = Game;

}());
