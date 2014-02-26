'use strict';

window.Darwinator = window.Darwinator || {
  
  TILE_WIDTH: 0,
  TILE_HEIGHT: 0,

  setTileSize: function(w,h) {
    this.TILE_WIDTH = w;
    this.TILE_HEIGHT = h;
  }

};

window.onload = function () {

  var game;

  game = new Phaser.Game(640, 480, Phaser.AUTO, 'darwinator-container');
  game.state.add('boot', Darwinator.Boot);
  game.state.add('preloader', Darwinator.Preloader);
  game.state.add('menu', Darwinator.Menu);
  game.state.add('game', Darwinator.GameState);

  game.state.start('boot');
};
