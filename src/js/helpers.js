'use strict';

Darwinator.Helpers = {

  /**
  * Given a layer in a tileMap, returns the index of the tile in every
  * position of the layer.
  * @method Darwinator.Helpers#convertTileMap
  * @param {Array} - [layer] The layer to convert
  * @return {Array} - The converted map
  */
  convertTileLayer: function(tileLayer) {

    var array = tileLayer.layer.data;
    var indexes = new Array(array.length);

    for (var i = 0; i < indexes.length; i++) {
      indexes[i] = new Array(array[i].length);
      for(var l = 0; l < indexes[i].length; l++) {
        indexes[i][l] = !!array[l][i] ? array[l][i].index : 0;
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
    if (x < 0) {
      x = 0;
    }
    if (y < 0) {
      y = 0;
    }
    var pos = {
      x: Math.floor(x / Darwinator.TILE_WIDTH),
      y: Math.floor(y / Darwinator.TILE_HEIGHT)
    };

    return pos;
  },

  /**
  * Calculate the position in pixels of a tile.
  * @method Darwinator.Helpers#tileToPixels
  * @param {Number} - [x] The x-index of the tile
  * @param {Number} - [y] The y-index of the tile
  * @return {Tuple} - The pixel in the center of the tile, returned as an object with properties x,y
  */
  tileToPixels: function(xCor, yCor) {
    var tileWidth = Darwinator.TILE_WIDTH;
    var tileHeight = Darwinator.TILE_HEIGHT;
    var pos = {
      x: Math.floor(xCor * tileWidth + (tileWidth / 2)),
      y: Math.floor(yCor * tileHeight + (tileHeight / 2))
    };

    return pos;
  },

  /**
  * Calculates distance between two points. Works for both distance in pixels and distance in tiles.
  * @method Darwinator.Helpers#calculateDistance
  * @param {Array/Tuple} - [pos1] The first point, given as [x,y] or as an object with properties x,y
  * @param {Array/Tuple} - [pos2] The second point, given as [x,y] or as an object with properties x,y
  * @return {Number} The distance between the two points.
  */
  calculateDistance: function(pos1, pos2) {
    var x1 = pos1.hasOwnProperty('x') ? pos1.x : pos1[0];
    var y1 = pos1.hasOwnProperty('y') ? pos1.y : pos1[1];
    var x2 = pos2.hasOwnProperty('x') ? pos2.x : pos2[0];
    var y2 = pos2.hasOwnProperty('y') ? pos2.y : pos2[1];
    var dx = x1 - x2;
    var dy = y1 - y2;
    return Math.sqrt(dx*dx + dy*dy);
  },

  /**
  * @method Darwinator.Helpers#calculatePosition
  * @param {Number} - [x] Current x position
  * @param {Number} - [y] Current y position
  * @param {Number} - [distance] Distance to new position
  * @param {Number} - [angle] Angle between old and new position
  * @return {Object}  New position as an object with x and y properties
  */
  calculatePosition: function(x, y, distance, angle){
    var xNew = x + distance * Math.cos(angle);
    var yNew = y + distance * Math.sin(angle);
    return {x: xNew, y: yNew};
  }

};
