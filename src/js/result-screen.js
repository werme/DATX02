'use strict';

Darwinator.ResultScreen = function() {
    this.attributes         = {};
    this.buttons            = [];
    this.unspentPoints      = 0;
    this.unspentPointsText  = null;
    this.continueGameButton = null;

    this.background         = null;
};

Darwinator.ResultScreen.prototype = {

    create: function () {

        this.unspentPoints = 3;

        // Unfollow player and position camera in top left corner of world.
        this.game.camera.target = null;
        this.game.camera.setPosition(0,0);

        // Draw background color
        this.background = this.game.add.graphics(0, 0);
        this.background.fixedToCamera = true;
        this.background.beginFill(Darwinator.MENU_BACKGROUND_COLOR, 1);
        this.background.drawRect(0, 0, this.game.width, this.game.height);
        this.background.endFill();

        // Render content
        this.initAttributes(this.game.player.attributes);
        this.initButtons();

        var text = 'Points left to spend: ' + this.unspentPoints;
        this.unspentPointsText = this.add.bitmapText(this.game.width/2, 90, 'minecraftia', text, 16);
        // this.unspentPointsText.anchor.setTo(0.5, 0.5);

        // Setup done button
        this.continueGameButton = this.game.add.button(this.game.width/2, this.game.height - 100, 'continue-game-button', this.continueGame, this, 1, 0, 1);
        this.continueGameButton.anchor.setTo(0.5, 0.5);
    },

    clean: function () {
        console.log('Cleaning result screen.');

        this.game.world.remove(this.background);
    },

    initAttributes: function (attributes) {
        var x       = this.game.width  / 2 - 70,
            y       = 170,
            text;

        // TODO Ensure order.
        for (var attribute in attributes) {
            if (attributes.hasOwnProperty(attribute)) {
                text = attribute + ': ' + attributes[attribute];
                this.attributes[attribute] = this.add.bitmapText(x, y, 'minecraftia', text, 20);
                this.attributes[attribute].fixedToCamera = true;
                y += 42; // Render the next attribute on a new line.
            }
        }
    },

    initButtons: function () {
        var x = this.game.width  / 2 - 100,
            y = 180;

        // Buttons shall be rendered by hand, it's a craft.
        this.buttons.push(this.add.button(x, y, 'plus-button', function() {
            this.incrementAttribute('strength');
        }, this, 2, 1, 0));

        this.buttons.push(this.add.button(x, y + 42, 'plus-button', function() {
            this.incrementAttribute('agility');
        }, this, 2, 1, 0));

        this.buttons.push(this.add.button(x, y + 84, 'plus-button', function() {
            this.incrementAttribute('intellect');
        }, this, 2, 1, 0));

        this.buttons.forEach(function (button) {
            button.fixedToCamera = true;
        });
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
        this.clean();
        this.game.state.start('game', true, false, true);
    }

};
