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

    this.game.canvas.style.cursor = "inherit";

    var startGameButton = document.getElementById('start-game-button');
    $(startGameButton).on('click', this.startGame.bind(this));
  },

  initHtmlOverlay: function () {
    var source   = $("#menu-template").html();
    var template = Handlebars.compile(source);

    var settings = { 
      modes: [
        { state: "game", name: "Rainbow Unicorn Mode" },
        { state: "myOtherState", name: "My Other Mode" }
      ],
      maps: [
        { id: "galapagos", name: "Galapagos" },
        { id: "forest", name: "Forest" }
      ]
    }

    $(this.htmlContainer).html(template(settings));
  },

  update: function () {

  },

  startGame: function () {
    var state = $('#mode-select').val();
    
    var settings = {
      map:          $('#map-select').val(),
      level:        $('#level-input').val(),
      immortal:     $('#immortal-check').is(':checked'),
      randomPlayer: $('#random-check').is(':checked')
    }

    $(this.htmlContainer).hide();
    this.game.state.start(state);
  }

};
