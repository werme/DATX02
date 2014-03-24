'use strict';

Darwinator.Menu = function() {
  this.text = null;
};

Darwinator.Menu.prototype = {

  create: function () {
    this.text = new Phaser.BitmapText(this.game, 0, 0, 'minecraftia', 'Click to start!', 16);
    
    this.text.position.x = this.game.width  / 2 - this.text.textWidth  / 2,
    this.text.position.y = this.game.height / 2 - this.text.textHeight / 2;
    
    this.game.add.existing(this.text);

    this.input.onDown.add(this.onDown, this);
  },

  update: function () {

  },

  onDown: function () {
    this.game.state.start('game');
  }

};
