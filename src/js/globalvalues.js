(function() {
  'use strict';

  var GlobalValues = {
    tileWidth: 0,
    tileHeight: 0,
    
    tileSize: function(w,h) {
      this.tileWidth = w;
      this.tileHeight = h;
    }
  };

  window.Darwinator = window.Darwinator || {};
  window.Darwinator.GlobalValues = GlobalValues;

}());