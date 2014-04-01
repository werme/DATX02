'use strict';

Darwinator.GameOverScreen = function() {
    this.container = null;
};

Darwinator.GameOverScreen.prototype = {

    create: function () {

        // Draw background color
        var background = new Phaser.Graphics(this.game, 0, 0);
        background.fixedToCamera = true;
        background.beginFill(Darwinator.MENU_BACKGROUND_COLOR, 0.8);
        background.drawRect(0, 0, this.game.width, this.game.height);
        background.endFill();
        this.game.add.existing(background);
        this.world.bringToTop(background);

        // Draw text
        var gameover = this.game.add.bitmapText(0, 50, 'minecraftia', 'GAME OVER', 48);
        var text     = this.game.add.bitmapText(0, 80, 'minecraftia', 'Click to try again!', 16);
        
        gameover.position.y = this.game.height / 2 - 80;
        gameover.position.x = this.game.width / 2 - gameover.textWidth / 2;
        text.position.y = this.game.height / 2;
        text.position.x = this.game.width / 2 - text.textWidth / 2,

        // restart on click
        this.input.onDown.add(this.restart, this);
    },

    update: function () {},

    restart: function () {
        this.game.state.start('game');
    }

};
