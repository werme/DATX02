'use strict';

Darwinator.ResultScreen = function() {
    this.attributes         = {};
    this.buttons            = null;
    this.unspentPoints      = 0;
    this.unspentPointsText  = null;
    this.container          = null;
};

Darwinator.ResultScreen.prototype = {

    create: function () {

        this.container = this.game.add.group();
        this.container.fixedToCamera = true;
        this.game.add.existing(this.container);

        this.unspentPoints = 3;

        // Unfollow player and position camera in top left corner of world.
        this.game.camera.target = null;
        this.game.camera.setPosition(0,0);

        // Draw background color
        var background = new Phaser.Graphics(this.game, 0, 0);
        background.fixedToCamera = true;
        background.beginFill(Darwinator.MENU_BACKGROUND_COLOR, 1);
        background.drawRect(0, 0, this.game.width, this.game.height);
        background.endFill();

        this.container.add(background);

        // Render content
        this.initAttributes(this.game.player.attributes);
        this.initButtons();

        var text = 'Points left to spend: ' + this.unspentPoints;
        this.unspentPointsText = this.container.add(new Phaser.BitmapText(this.game, this.game.width/2, 90, 'minecraftia', text, 16));
        this.container.add(new Phaser.Button(this.game, this.game.width/2, this.game.height - 100, 'continue-game-button', this.continueGame, this, 1, 0, 1));
    },

    beforeSwitch: function () {
        this.game.world.remove(this.container);
    },

    initAttributes: function (attributes) {
        var x       = this.game.width  / 2 - 70,
            y       = 170,
            text;

        // TODO Ensure order.
        for (var attribute in attributes) {
            if (attributes.hasOwnProperty(attribute)) {
                text = attribute + ': ' + attributes[attribute];
                this.attributes[attribute] = new Phaser.BitmapText(this.game, x, y, 'minecraftia', text, 20);
                this.container.add(this.attributes[attribute]);
                y += 42; // Render the next attribute on a new line.
            }
        }
    },

    initButtons: function () {
        var x = this.game.width  / 2 - 100,
            y = 180;

        var buttons = new Phaser.Group(this.game, 0, 0);

        // Buttons shall be rendered by hand, it's a craft.
        buttons.add(new Phaser.Button(this.game, x, y, 'plus-button', function() {
            this.incrementAttribute('strength');
        }, this, 2, 1, 0));

        buttons.add(new Phaser.Button(this.game, x, y + 42, 'plus-button', function() {
            this.incrementAttribute('agility');
        }, this, 2, 1, 0));

        buttons.add(new Phaser.Button(this.game, x, y + 84, 'plus-button', function() {
            this.incrementAttribute('intellect');
        }, this, 2, 1, 0));

        buttons.fixedToCamera = true;

        this.container.add(buttons);
    },

    incrementAttribute: function (attribute) {
        if (this.unspentPoints <= 0) {
            return;
        }

        // Increment attribute.
        this.game.player.attributes[attribute] += 1;
        console.log('Incremented player ' + attribute + ' to ' + this.game.player.attributes[attribute] + '.');

        // Update bitmap text.
        var text = attribute + ': ' + this.game.player.attributes[attribute];
        this.attributes[attribute].setText(text);

        // Update unspent points.
        this.unspentPoints -= 1;
        this.unspentPointsText.setText('Points left to spend: ' + this.unspentPoints);
    },

    update: function () {},

    continueGame: function () {
        this.beforeSwitch();
        this.game.state.start('game', false, false, true);
    }

};
