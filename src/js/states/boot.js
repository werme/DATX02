'use strict';

Darwinator.Boot = function() {};

Darwinator.Boot.prototype = {

  preload: function () {
    this.load.image('preloader', 'assets/preloader.gif');
  },

  create: function () {
    this.game.input.maxPointers = 1;

    // this.game.stage.disableVisibilityChange = true;

    // Enable Arcade physic system
    this.game.physics.startSystem(Phaser.Physics.ARCADE);

    if (this.game.device.desktop) {
      this.game.stage.scale.pageAlignHorizontally = true;
    } else {
      this.game.stage.scaleMode = Phaser.StageScaleMode.SHOW_ALL;
      this.game.stage.scale.minWidth = 480;
      this.game.stage.scale.minHeight = 260;
      this.game.stage.scale.maxWidth = 640;
      this.game.stage.scale.maxHeight = 480;
      this.game.stage.scale.forceLandscape = true;
      this.game.stage.scale.pageAlignHorizontally = true;
      this.game.stage.scale.setScreenSize(true);
    }

    // Initialize html overlay
    var overlay = document.createElement("div");
    overlay.setAttribute("id", "html-overlay");
    overlay.style.width = this.game.width + "px";
    overlay.style.height = this.game.height + "px";
    document.body.appendChild(overlay);

    this.game.state.start('preloader');
  },

};
