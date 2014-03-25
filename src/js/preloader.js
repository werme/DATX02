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
    this.load.image('enemy_strength', 'assets/player_strength.png');
    this.load.image('enemy_agility', 'assets/player_agility.png');
    this.load.image('enemy_intellect', 'assets/player_intellect.png');
    this.load.bitmapFont('minecraftia', 'assets/minecraftia.png', 'assets/minecraftia.xml');
    this.load.tilemap('level1', 'assets/galapa.json', null, Phaser.Tilemap.TILED_JSON);
    this.game.load.image('GroundTiles', 'assets/GroundTiles.png');
    this.game.load.image('WaterTiles', 'assets/WaterTiles.png');
    this.game.load.image('ObjectTiles', 'assets/ObjectTiles.png');
    this.load.image('sword','assets/sword.png');
    this.load.image('arrow','assets/arrow.png');
    this.load.image('cannonball', 'assets/cannonball.png');
    this.load.spritesheet('player', 'assets/darwin.png', 32, 32, 16);
    this.game.load.image('plus-button', 'assets/plus-button.png');
    this.load.spritesheet('continue-game-button', 'assets/continue-game-button.png', 248, 58, 2);
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
