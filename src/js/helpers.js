'use strict';

Darwinator.Helpers = {

  convertTileMap: function(layer) {
    var indexes = [];

    for (var i = 0; i < layer.length; i++) {
      indexes[i] = [];
      for(var l = 0; l < layer.length; l++) {
        indexes[i][l] = layer[i][l].index;
      }
    }
    return indexes;
  },

  pixelsToTile: function(x, y) {
    var pos = [];
    if (x < 0) {
      x = 0;
    }
    if (y < 0) {
      y = 0;
    }
    pos[0] = Math.floor(x / Darwinator.TILE_WIDTH);
    pos[1] = Math.floor(y / Darwinator.TILE_HEIGHT);
    return pos;
  },

  tileToPixels: function(x, y) {
    var pos = [];
    var tileWidth = Darwinator.TILE_WIDTH;
    var tileHeight = Darwinator.TILE_HEIGHT;
    pos[0] = Math.floor(x * tileWidth + (tileWidth / 2));
    pos[1] = Math.floor(y * tileHeight + (tileHeight / 2));
    return pos;
  }

};