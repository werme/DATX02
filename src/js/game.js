(function() {
  'use strict';

  function Game() {
    this.player = null;
    this.cursors = null;
  }

  Game.prototype = {

    create: function () {
      this.game.world.setBounds(0,0, 1280, 940);
      this.background = this.add.sprite(0,0, 'background');

      var x = this.game.width / 2
        , y = this.game.height / 2;

      this.player = this.add.sprite(x, y, 'player');
      this.player.anchor.setTo(0.5, 0.5);

      this.cursors = this.game.input.keyboard.createCursorKeys();
      this.game.camera.follow(this.player);
    },

    update: function () {
      this.player.body.velocity.setTo(0,0);
      if (this.cursors.up.isDown) {
        this.player.body.velocity.y = -100;
      } 
      if (this.cursors.left.isDown) {
        this.player.body.velocity.x = -100;
      }
      if (this.cursors.right.isDown) {
        this.player.body.velocity.x = 100;
      }
      if (this.cursors.down.isDown) {
        this.player.body.velocity.y = 100;
      }
    }

  };

  window.darwinator.Game = Game;

}());
