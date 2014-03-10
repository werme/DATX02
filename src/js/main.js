'use strict';

/**
* @namespace Darwinator
*/
window.Darwinator = window.Darwinator || {

  start: function(game) {
    game.state.add('boot', this.Boot);
    game.state.add('preloader', this.Preloader);
    game.state.add('menu', this.Menu);
    game.state.add('game', this.GameState);
    game.state.add('resultScreen', this.ResultScreen);

    game.state.start('boot');
  },

  PLAYER_START_HEALTH: 100,
  
  TILE_WIDTH: 0,
  TILE_HEIGHT: 0,

  MENU_BACKGROUND_COLOR: 0x222d42,

  setTileSize: function(w,h) {
    this.TILE_WIDTH = w;
    this.TILE_HEIGHT = h;
  }

};
