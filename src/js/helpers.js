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
  },

  /**
  * Calculates distance between two points. Works for both distance in pixels and distance in tiles.
  * @method Darwinator.Helpers#calculateDistance
  * @param {Array} - The first point, given as [x,y]
  * @param {Array} - The second point, given as [x,y]
  * @return {Number} The distance between the two points.
  */
  calculateDistance: function(pos1, pos2) {
    var dx = pos1[0] - pos2[0];
    var dy = pos1[1] - pos2[1];
    return Math.sqrt(dx*dx + dy*dy);
  }
};
