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
      if (this.cursors.up.isDown) {
        this.player.y--;
      } 
      if (this.cursors.left.isDown) {
        this.player.x--;
      }
      if (this.cursors.right.isDown) {
        this.player.x++;
      }
      if (this.cursors.down.isDown) {
        this.player.y++;
      }
    }

  };

  window.darwinator.Game = Game;

}());
