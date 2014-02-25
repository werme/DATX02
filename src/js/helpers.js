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

  };

  window.Darwinator = window.Darwinator || {};
  window.Darwinator.Helpers = Helpers;

};
