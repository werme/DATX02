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

        this.unspentPoints = 3;

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
        this.unspentPointsText = this.add.bitmapText(this.game.width/2, 30, text, styling);
        this.unspentPointsText.anchor.setTo(0.5, 0.5);

        // Setup done button
        this.continueGameButton = this.game.add.button(30, 30, 'player', this.continueGame, this, 2, 1, 0);
        this.continueGameButton.scale.setTo(2, 2);
    },

    initAttributes: function (attributes) {
        var x       = this.game.width  / 2,
            y       = this.game.height / 2 - 26,
            styling = { font: '16px minecraftia', align: 'center' },
            text;

        // TODO: Doesn't ensure order.
        for (var attribute in attributes) {
            if (attributes.hasOwnProperty(attribute)) {
                text = attribute + ": " + attributes[attribute];
                this.attributes[attribute] = this.add.bitmapText(x, y, text, styling);
                this.attributes[attribute].fixedToCamera = true;
                y += 26; // Render the next attribute on a new line.
            }
        }
    },

    initButtons: function () {
        var x = this.game.width  / 2 - 24,
            y = this.game.height / 2 - 20;

        // Buttons shall be rendered by hand, it's a craft.
        this.buttons.push(this.add.button(x, y, 'player', function() {
            this.incrementAttribute('stamina');
        }, this, 2, 1, 0));

        this.buttons.push(this.add.button(x, y + 26, 'player', function() {
            if (this.unused)
            this.incrementAttribute('speed');
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
        this.game.state.start('game', false);
    }

};
