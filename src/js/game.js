(function() {
  'use strict';

  function Game() {
    this.player = null;
  }

  Game.prototype = {

    create: function () {
      var x = this.game.width / 2
        , y = this.game.height / 2;

      this.player = this.add.sprite(x, y, 'player');
      this.player.anchor.setTo(0.5, 0.5);
    },

    update: function () {
      this.input.onDown.add(function() {
        console.log(this);
        console.log('Clicked!');
      }, this);
    }

  };

  window.darwinator.Game = Game;

}());
