'use strict';

Darwinator.Helpers = {

  /**
  * Given a layer in a tileMap, returns the index of the tile in every
  * position of the layer.
  * @method Darwinator.Helpers#convertTileMap
  * @param {Array} - [layer] The layer to convert
  * @return {Array} - The converted map
  */
  convertTileMap: function(layer) {
    var indexes = new Array(layer.length);

    for (var i = 0; i < indexes.length; i++) {
      indexes[i] = new Array(layer[i].length);
      for(var l = 0; l < indexes[i].length; l++) {
        indexes[i][l] = layer[i][l].index;
      }
    }
    return indexes;
  },

  /**
  * Calculate what tile a specific pixel is in.
  * @method Darwinator.Helpers#pixelsToTile
  * @param {Number} - [x] The x-value of the pixel
  * @param {Number} - [y] The y-value of the pixel
  * @return {Array} - The indexes of the tile, given as [x,y]
  */
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

  /**
  * Calculate the position in pixels of a tile.
  * @method Darwinator.Helpers#tileToPixels
  * @param {Number} - [x] The x-index of the tile
  * @param {Number} - [y] The y-index of the tile
  * @return {Array} - The pixel in the center of the tile, returned as [X,Y]
  */
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
  * @param {Array} - [pos1] The first point, given as [x,y]
  * @param {Array} - [pos2] The second point, given as [x,y]
  * @return {Number} The distance between the two points.
  */
  calculateDistance: function(pos1, pos2) {
    var dx = pos1[0] - pos2[0];
    var dy = pos1[1] - pos2[1];
    return Math.sqrt(dx*dx + dy*dy);
  }
};
