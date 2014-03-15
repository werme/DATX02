'use strict';

Darwinator.Menu = function() {
  this.titleTxt = null;
  this.startTxt = null;
};

Darwinator.Menu.prototype = {

  create: function () {
    var x = this.game.width / 2
      , y = this.game.height / 2;

    this.titleTxt = this.add.bitmapText(x, y, 'minecraftia', 'Click to start!', 16);
    this.titleTxt.align = 'center';
    // this.titleTxt.anchor.setTo(0.5, 0.5);

    this.input.onDown.add(this.onDown, this);
  },

  update: function () {

  },

  onDown: function () {
    this.game.state.start('game');
  }

};
