'use strict';

Darwinator.ResultScreen = function() {
    this.attributes = {};
    this.buttons    = [];
};

Darwinator.ResultScreen.prototype = {

    create: function () {

        // Unfollow player and position camera in top left corner of world.
        this.game.camera.target = null;
        this.game.camera.setPosition(0,0);

        // Draw background color
        var g = this.game.add.graphics(0, 0);
        g.fixedToCamera = true;
        g.beginFill(0x222d42, 1);
        g.drawRect(0, 0, this.game.width, this.game.height);
        g.endFill();

        // Render content
        this.initAttributes(this.player.attributes);
        this.initButtons();

        // this.input.onDown.add(this.onDown, this);

        var key = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        key.onDown.add(this.startGame, this);
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
        this.buttons.push(this.game.add.button(x, y, 'player', function() {
            this.incrementAttribute('stamina');
        }, this, 2, 1, 0));

        this.buttons.push(this.game.add.button(x, y + 26, 'player', function() {
            this.incrementAttribute('speed');
        }, this, 2, 1, 0));

        this.buttons.forEach(function(button) {
            button.fixedToCamera = true;
        });
    },

    incrementAttribute: function (attribute) {
        // Increment attribute.
        this.game.player.attributes[attribute] += 1;
        console.log("Incremented player " + attribute + " to " + this.game.player.attributes[attribute] + ".");
        
        // Update bitmap text.
        var text = attribute + ": " + this.game.player.attributes[attribute];
        this.attributes[attribute].setText(text);
    },

    startGame: function () {
        console.log("onDown in resultScreen state");
        this.game.state.start('game', false);
    }

};
