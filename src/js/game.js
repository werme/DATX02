'use strict';

Darwinator.GameState = function() {

    // Input
    this.cursors               = null;
    this.cheatKey              = null;
    this.pauseKey              = null;

    // Groups
    this.bullets               = null;
    this.gui                   = null;

    // Displayables
    this.fps                   = null;
    this.stats                 = null;
    this.health                = null;
    this.secondsRemaining      = null;
    this.enemiesRemaining      = null;
    this.pauseText             = null;
    this.roundSecondsRemaining = null;
    this.endRoundTimer         = null;
    this.displayTimeLeftTimer  = null;

    // Misc
    this.roundLengthSeconds    = 60;
};

Darwinator.GameState.prototype = {

    init: function (reset) {
        if (!reset) {
            // Input
            this.cursors  = this.game.input.keyboard.createCursorKeys();
            this.cheatKey = this.game.input.keyboard.addKey(Phaser.Keyboard.E);
            this.pauseKey = this.game.input.keyboard.addKey(Phaser.Keyboard.P);

            // Map
            this.level = new Darwinator.Level(this.game);

            // Containers
            this.bullets = this.game.add.group();
            this.gui     = this.game.add.group();

            // Misc
            this.game.time.advancedTiming = true;
            this.gui.fixedToCamera        = true;
        }

        this.cheatKey.onDown.add(this.endRound, this);
        this.pauseKey.onDown.add(this.togglePause, this);

        // Since states lack a callback for the resume event
        this.game.onResume.add(this.resumed, this);
    },

    beforeSwitch: function () {
        this.game.world.remove(this.game.player);
        this.game.world.remove(this.game.enemies);
        this.game.world.remove(this.level.overlaps);
        this.game.world.remove(this.gui);
        this.game.world.remove(this.bullets);

        this.cheatKey.onDown.remove(this.endRound, this);
        this.pauseKey.onDown.remove(this.togglePause, this);
        this.game.onResume.remove(this.resumed, this);

        this.stopTimers();
    },

    create: function () {

        this.spawnPlayer(160, 620);
        this.game.enemies = this.level.spawnEnemies();

        // TODO Find the right way to do this
        this.game.enemies.setAll('alive', true);

        // Renders the non-collidable top layer on top of player and enemies
        this.level.addTopLayer();

        this.game.player.weapon = new Darwinator.Bow(this.game, Darwinator.PLAYER_RANGE_WEAPON_BASE_BULLETSPEED, Darwinator.PLAYER_RANGE_WEAPON_BASE_COOLDOWN, Darwinator.PLAYER_BASE_DAMAGE, this.bullets, this.game.player);

        this.initGUI();

        this.startTimers();
    },

    initGUI: function () {
        var style = { font: '16px monospace', fill: '#fff' };

        this.fps = this.gui.add(new Phaser.Text(this.game, 16, 16, 'FPS: 0', style));
        this.stats = this.gui.add(new Phaser.Text(this.game, 16, 36, '', style));
        this.health = this.gui.add(new Phaser.Text(this.game, 16, 56, '', style));
        this.secondsRemaining = this.gui.add(new Phaser.Text(this.game, 16, 76, 'Seconds remaining: ' + this.roundLengthSeconds, style));
        this.enemiesRemaining = this.gui.add(new Phaser.Text(this.game, 16, 96, 'Enemies remaining: ', style));
        this.gameOver = this.gui.add(new Phaser.Text(this.game, this.game.width / 2, this.game.height / 2, '', {fontSize: '48px', fill:'#F08'}));

        this.initPauseOverlay();
    },

    startTimers: function () {
        // End round when the time limit is reached
        this.endRoundTimer = this.game.time.events.add(Phaser.Timer.SECOND * this.roundLengthSeconds, this.endRound, this);
        // Display seconds remaining until round ends
        this.roundSecondsRemaining = this.roundLengthSeconds;
        this.displayTimeLeftTimer = this.game.time.events.repeat(Phaser.Timer.SECOND, this.roundLengthSeconds, this.updateTimer, this);
    },

    stopTimers: function () {
        this.game.time.events.remove(this.endRoundTimer);
        this.game.time.events.remove(this.displayTimeLeftTimer);
    },

    spawnPlayer: function (x, y) {
        // Instanciate new player or reset existing
        if (!this.game.player) {
            this.game.player = new Darwinator.Player(this.game, x, y, this.cursors);
        } else {
            this.game.player.reset(x, y, Darwinator.PLAYER_BASE_HEALTH);
            this.game.player.updateAttributes();
        }

        // Add player sprite to stage and focus camera
        this.game.add.existing(this.game.player);
        this.game.camera.follow(this.game.player);
    },

    initPauseOverlay: function () {
        var style = { fontSize: '16px', fill: '#fff', align: 'center' },
            x     = this.game.width  / 2,
            y     = this.game.height / 2;

        // Render text centered and fixed to camera
        this.pauseText = this.gui.add(new Phaser.Text(this.game, x, y, 'Game paused', style));
        this.pauseText.anchor.setTo(0.5, 0.5);

        // Should be hidden by default
        this.pauseText.visible = false;
    },

    update: function () {
        for (var i = 0; i < this.bullets.length; i++) {
            var bulletGroup = this.bullets.getAt(i);
            this.game.physics.arcade.collide(bulletGroup, this.game.enemies, this.bulletCollisionHandler, null, this);
            this.game.physics.arcade.collide(bulletGroup, this.level.objects, this.bulletCollisionHandler, null, this);
        }

        this.game.physics.arcade.collide(this.game.player, this.level.objects);
        this.game.physics.arcade.collide(this.game.enemies, this.level.objects);

        this.updateGUI();

        // End round when all enemies are dead
        if (this.game.enemies.countLiving() === 0) {
            this.endRound();
        }
    },

    updateGUI: function () {
        this.fps.text = 'FPS: ' + this.game.time.fps;
        this.stats.text = 'Player stamina: ' + Math.round(this.game.player.currBreath) + '/' + Math.round(this.game.player.stamina);
        this.health.text = 'Health: ' + Math.round(this.game.player.health);
        this.enemiesRemaining.text = 'Enemies remaining: ' + this.game.enemies.countLiving();
    },

    updateTimer: function () { // Callback to update time remaining display every second
        this.roundSecondsRemaining--;
        this.secondsRemaining.content = 'Seconds remaining: ' + this.roundSecondsRemaining;
    },

    bulletCollisionHandler: function (bullet, target) {
        if (target instanceof Darwinator.Enemy) {
            target.takeDamage(this.game.player.damage);
        }
        bullet.kill();
    },

    endRound: function() {
        this.beforeSwitch();
        this.game.state.start('resultScreen', false);
    },

    togglePause: function() {
        this.game.paused = !this.game.paused;
    },

    paused: function () {
        this.pauseText.visible = true;
        console.log('Paused game.');
    },

    resumed: function() {
        this.pauseText.visible = false;
        console.log('Resumed game.');
    }

};
