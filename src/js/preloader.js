'use strict';

Darwinator.Preloader = function() {
  this.asset = null;
  this.ready = false;
};

Darwinator.Preloader.prototype = {

  preload: function () {
    this.asset = this.add.sprite(320, 240, 'preloader');
    this.asset.anchor.setTo(0.5, 0.5);

    this.load.onLoadComplete.addOnce(this.onLoadComplete, this);
    this.load.setPreloadSprite(this.asset);
    this.load.image('enemy', 'assets/player.png');
    this.load.bitmapFont('minecraftia', 'assets/minecraftia.png', 'assets/minecraftia.xml');
    this.load.tilemap('level1', 'assets/level2.json', null, Phaser.Tilemap.TILED_JSON);
    this.game.load.image('tiles', 'assets/landscape.png');
    
    this.load.spritesheet('player', 'assets/gal.png', 16, 16, 16);
  },

  create: function () {
    this.asset.cropEnabled = false;
  },

  update: function () {
    if (!!this.ready) {
      this.game.state.start('menu');
    }
  },

  onLoadComplete: function () {
    this.ready = true;
  }
};
