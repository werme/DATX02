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

    game.state.start('boot');
  },
  
  TILE_WIDTH: 0,
  TILE_HEIGHT: 0,

  setTileSize: function(w,h) {
    this.TILE_WIDTH = w;
    this.TILE_HEIGHT = h;
  }

};
