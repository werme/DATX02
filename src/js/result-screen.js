'use strict';

Darwinator.ResultScreen = function() {};

Darwinator.ResultScreen.prototype = {

    create: function () {
        this.game.camera.target = null;
        this.game.camera.setPosition(0,0);

        var g = this.game.add.graphics(0, 0);
        g.fixedToCamera = true;
        g.beginFill(0x222d42, 1);
        g.drawRect(0, 0, this.game.width, this.game.height);
        g.endFill();

        this.renderAttributes(this.player.attributes)

        // this.input.onDown.add(this.onDown, this);

        var key = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        key.onDown.add(this.startGame, this);
    },

    renderAttributes: function (attributes) {
        var x = this.game.width / 2
          , y = this.game.height / 2 - 26;

        for (var attribute in attributes) {
            if (attributes.hasOwnProperty(attribute)) {
                console.log(attribute);
                var text = this.add.bitmapText(x, y, attribute + ": " + attributes[attribute] , {font: '16px minecraftia', align: 'center'});
                text.fixedToCamera = true;
                y += 26; // Print the next attribute on a new line.
            }
        }
        // Render button by hand, it's a craft.
    },

    herp: function (attribute) {
        console.log(this);
        this.player.attributes.stamina += 1;
    },

    update: function () {
        console.log(this.player.attributes.stamina);
    },

    startGame: function () {
        console.log("onDown in resultScreen state");
        this.game.state.start('game', false);
    }

};
