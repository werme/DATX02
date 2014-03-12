'use strict';

Darwinator.ResultScreen = function() {
    this.attributes         = {};
    this.buttons            = [];
    this.unspentPoints      = 0;
    this.unspentPointsText  = null;
    this.continueGameButton = null;
};

Darwinator.ResultScreen.prototype = {

    create: function () {

        this.unspentPoints = 100;

        // Unfollow player and position camera in top left corner of world.
        this.game.camera.target = null;
        this.game.camera.setPosition(0,0);

        // Draw background color
        var g = this.game.add.graphics(0, 0);
        g.fixedToCamera = true;
        g.beginFill(Darwinator.MENU_BACKGROUND_COLOR, 1);
        g.drawRect(0, 0, this.game.width, this.game.height);
        g.endFill();

        // Render content
        this.initAttributes(this.game.player.attributes);
        this.initButtons();

        var styling = { font: '16px minecraftia', align: 'center' },
            text    = "Points left to spend: " + this.unspentPoints;
        this.unspentPointsText = this.add.bitmapText(this.game.width/2, 90, text, styling);
        this.unspentPointsText.anchor.setTo(0.5, 0.5);

        // Setup done button
        this.continueGameButton = this.game.add.button(this.game.width/2, this.game.height - 100, 'continue-game-button', this.continueGame, this, 1, 0, 1);
        this.continueGameButton.anchor.setTo(0.5, 0.5);
    },

    initAttributes: function (attributes) {
        var x       = this.game.width  / 2 - 70,
            y       = 170,
            styling = { font: '20px minecraftia', align: 'center' },
            text;

        // TODO: Doesn't ensure order.
        for (var attribute in attributes) {
            if (attributes.hasOwnProperty(attribute)) {
                text = attribute + ": " + attributes[attribute];
                this.attributes[attribute] = this.add.bitmapText(x, y, text, styling);
                this.attributes[attribute].fixedToCamera = true;
                y += 42; // Render the next attribute on a new line.
            }
        }
    },

    initButtons: function (attributes) {
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

        this.buttons.forEach(function(button) {
            button.fixedToCamera = true;
        });
    },

    incrementAttribute: function (attribute) {
        if (this.unspentPoints <= 0) return;

        // Increment attribute.
        this.game.player.attributes[attribute] += 1;
        console.log("Incremented player " + attribute + " to " + this.game.player.attributes[attribute] + ".");
        
        // Update bitmap text.
        var text = attribute + ": " + this.game.player.attributes[attribute];
        this.attributes[attribute].setText(text);

        // Update unspent points.
        this.unspentPoints -= 1;
        this.unspentPointsText.setText("Points left to spend: " + this.unspentPoints);
    },

    update: function () {},

    continueGame: function () {
        this.game.state.start('game', true);
    }

};
