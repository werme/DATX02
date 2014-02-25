(function() {
  'use strict';

  var Helpers = {

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
      pos[0] = Math.floor(x / window.Darwinator.GlobalValues.tileWidth);
      pos[1] = Math.floor(y / window.Darwinator.GlobalValues.tileHeight);
      return pos;
    },

    tileToPixels: function(x, y) {
      var pos = [];
      var tileWidth = window.Darwinator.GlobalValues.tileWidth;
      var tileHeight = window.Darwinator.GlobalValues.tileHeight;
      pos[0] = Math.floor(x * tileWidth + (tileWidth / 2));
      pos[1] = Math.floor(y * tileHeight + (tileHeight / 2));
      return pos;
    }

  };

  window.Darwinator = window.Darwinator || {};
  window.Darwinator.Helpers = Helpers;

}());