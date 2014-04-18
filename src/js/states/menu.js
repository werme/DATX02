'use strict';

Darwinator.Menu = function() {
  this.container = null;
  this.htmlContainer = null;
};

Darwinator.Menu.prototype = {

  create: function () {
    this.container = this.game.add.group();
    this.container.fixedToCamera = true;
    this.game.add.existing(this.container);

    // Draw background color
    var background = new Phaser.Graphics(this.game, 0, 0);
    background.fixedToCamera = true;
    background.beginFill(Darwinator.MENU_BACKGROUND_COLOR);
    background.drawRect(0, 0, this.game.width, this.game.height);
    background.endFill();
    this.container.add(background);

    var logo = this.container.add(new Phaser.BitmapText(this.game, 0, 50, 'minecraftia', 'DARWINATOR', 48));
    logo.position.x = this.game.width  / 2 - logo.textWidth / 2;

    this.htmlContainer = document.getElementById("html-overlay");
    this.initHtmlOverlay();

    // var startGameButton = this.container.add(new Phaser.Button(this.game, 0, this.game.height - 120, 'start-game-button', this.continueGame, this, 1, 0, 1));
    // startGameButton.position.x = this.game.width / 2 - startGameButton.width / 2;

    // var buttonText = this.container.add(new Phaser.BitmapText(this.game, 0, this.game.height - 107, 'minecraftia', 'CONTINUE GAME', 20));
    // buttonText.position.x = this.game.width  / 2 - buttonText.textWidth / 2;

    this.game.canvas.style.cursor = "inherit";

    this.input.onDown.add(this.onDown, this);
  },

  initHtmlOverlay: function () {
    var source   = $("#menu-template").html();
    var template = Handlebars.compile(source);
    var context  = { 
      maps: [
        { id: "galapagos", name: "Galapagos" },
        { id: "forest", name: "Forest" }
      ]
    }
    $(this.htmlContainer).html(template(context));
  },

  update: function () {

  },

  onDown: function () {
    this.game.state.start('game');
  }

};
