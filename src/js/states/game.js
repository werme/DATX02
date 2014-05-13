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
    this.crosshair             = null;

    this.numberOfRounds        = 0;

};

Darwinator.GameState.prototype = {

    init: function (reset) {
        if (!reset) {
            // Input
            this.cursors        = this.game.input.keyboard.createCursorKeys();
            this.cheatKey       = this.game.input.keyboard.addKey(Phaser.Keyboard.E);
            this.pauseKey       = this.game.input.keyboard.addKey(Phaser.Keyboard.P);
            this.fullScreenKey  = this.game.input.keyboard.addKey(Phaser.Keyboard.F);

            // Map
            this.level = new Darwinator.Level(this.game);
            this.level.addTopLayer();

            // Containers
            this.bullets = this.game.add.group();
            this.gui     = this.initGUI();

            // Misc
            this.game.time.advancedTiming = true;
            this.gui.fixedToCamera        = true;
        }

        this.game.add.existing(this.gui);
        this.game.add.existing(this.bullets);

        this.cheatKey.onDown.add(this.endRound, this);
        this.pauseKey.onDown.add(this.togglePause, this);
        this.game.scale.fullScreenScaleMode = Phaser.ScaleManager.SHOW_ALL;
        this.fullScreenKey.onDown.add(this.goFullScreen, this);

        // Since states lack a callback for the resume event
        this.game.onResume.add(this.resumed, this);
    },

    beforeSwitch: function () {
        this.game.world.remove(this.game.player);
        this.game.world.remove(this.game.enemies);
        this.game.world.remove(this.gui);
        this.game.world.remove(this.bullets);

        this.cheatKey.onDown.remove(this.endRound, this);
        this.pauseKey.onDown.remove(this.togglePause, this);
        this.game.onResume.remove(this.resumed, this);

        this.stopTimers();

        this.game.player.resetKnockBack();
        this.game.player.resetAbilities();
        this.game.player.dead = false;

        for(var i = 0; i < this.bullets.length; i++) {
            var bulletGroup = this.bullets.getAt(i);
            bulletGroup.forEachAlive(function(bullet){bullet.kill();}, this);
        }
    },

    create: function () {

        this.spawnPlayer(160, 620);
        this.game.enemies = this.level.spawnEnemies();

        if (Darwinator.settings.enemyVsEnemy) {
            this.initEnemyVsEnemy();
        }

        // TODO Find the right way to do this
        this.game.enemies.setAll('alive', true);

        this.game.world.bringToTop(this.level.toplayer);

        for (var i = 0; i < this.game.enemies.length; i++) {
            var enemy = this.game.enemies.getAt(i);
            if(enemy.category === enemy.categories.INTELLIGENT){
                enemy.arm(new Darwinator.Cannon(this.game, enemy, this.bullets));
            }
            enemy.arm(new Darwinator.MeleeWeapon(this.game, undefined, undefined, enemy));
        }

        var melee = new Darwinator.MeleeWeapon(this.game, undefined, undefined, this.game.player); 
        var bow = new Darwinator.Bow(this.game, this.game.player, this.bullets);
        this.game.player.arm(bow);
        this.game.player.arm(melee);

        this.game.world.bringToTop(this.gui);

        this.startTimers();

        this.game.level = this.level;

        // Hide the cursor
        this.game.canvas.style.cursor = "none";
    },

    initGUI: function () {
        var gui   = this.game.add.group(),
            style = { font: '16px monospace', fill: '#fff' },
            x     = this.game.width  / 2,
            y     = this.game.height / 2,
            enemyContent = Darwinator.settings.enemyVsEnemy ? 'Enemies remaining: Team 1: Team 2: ' : 
                                                              'Enemies remaining: ';

        this.fps               = gui.add(new Phaser.Text(this.game, 16, 16, 'FPS: 0', style));
        this.stats             = gui.add(new Phaser.Text(this.game, 16, 36, '', style));
        this.health            = gui.add(new Phaser.Text(this.game, 16, 56, '', style));
        this.secondsRemaining  = gui.add(new Phaser.Text(this.game, 16, 76, 'Seconds remaining: ' + Darwinator.ROUND_LENGTH_SECONDS, style));
        this.enemiesRemaining  = gui.add(new Phaser.Text(this.game, 16, 96, enemyContent, style));
        this.pauseText         = gui.add(new Phaser.Text(this.game, x, y, 'Game paused', style));
        this.gameOver          = gui.add(new Phaser.Text(this.game, x, y, 'Game Over', {fontSize: '24px monospace', fill:'#FFF'}));

        this.pauseText.anchor.setTo(0.5, 0.5);
        this.gameOver.anchor.setTo(0.5, 0.5);

        // Should be hidden by default
        this.pauseText.visible = false;
        this.gameOver.visible  = false;

        this.crosshair = gui.add(this.game.add.sprite(this.game.input.activePointer.x, this.game.input.activePointer.y, 'crosshair'));
        this.crosshair.scale.setTo(1.5, 1.5);
        this.crosshair.anchor.setTo(0.5, 0.5);
        return gui;
    },

    startTimers: function () {
        // End round when the time limit is reached
        this.endRoundTimer = this.game.time.events.add(Phaser.Timer.SECOND * Darwinator.ROUND_LENGTH_SECONDS, this.endRound, this);
        // Display seconds remaining until round ends
        this.roundSecondsRemaining = Darwinator.ROUND_LENGTH_SECONDS;
        this.displayTimeLeftTimer = this.game.time.events.repeat(Phaser.Timer.SECOND, Darwinator.ROUND_LENGTH_SECONDS, this.updateTimer, this);
    },

    stopTimers: function () {
        this.game.time.events.remove(this.endRoundTimer);
        this.game.time.events.remove(this.displayTimeLeftTimer);
        this.secondsRemaining.text = 'Seconds remaining: ' + Darwinator.ROUND_LENGTH_SECONDS;
    },

    spawnPlayer: function (x, y) {
        // Instanciate new player or reset existing
        if (this.game.player) {
            if (this.game.player.health <= 0) {
                this.game.player.resetAttributes();
            }
            this.game.player.initEventListeners();
            this.game.player.reset(x, y, Darwinator.PLAYER_BASE_HEALTH + this.game.player.attributes.strength);
        } else {
            this.game.player = new Darwinator.Player(this.game, x, y, this.cursors);
        }

        // Add player sprite to stage and focus camera
        this.game.add.existing(this.game.player);
        this.game.camera.follow(this.game.player);
    },

    update: function () {
        var checkDodging = function (bullet, entity) {
            return !entity.dodging;
        };

        for (var i = 0; i < this.bullets.length; i++) {
            var bulletGroup = this.bullets.getAt(i);
            this.game.physics.arcade.collide(bulletGroup, this.game.enemies, this.bulletCollisionHandler, checkDodging, this);
            this.game.physics.arcade.collide(bulletGroup, this.level.collisionLayer, this.bulletCollisionHandler, null, this);
            this.game.physics.arcade.collide(bulletGroup, this.game.player, this.bulletCollisionHandler, checkDodging, this);
        }

        var collideTerrainCallback = function(entity, tile) { 
            entity.resetKnockBack(); 
            if (!!entity.isDashing && entity.isDashing()){
                entity.dashCounter = 0;
            }
        };

        this.game.physics.arcade.collide(this.game.player, this.level.collisionLayer, collideTerrainCallback);
        this.game.physics.arcade.collide(this.game.enemies, this.level.collisionLayer, collideTerrainCallback);
        this.game.physics.arcade.collide(this.game.enemies);

        this.updateGUI();

        // End round when all enemies are dead
        if(Darwinator.settings.enemyVsEnemy) {
            this.updateNrAlive();
            if (this.game.team1.nrAlive === 0 || this.game.team2.nrAlive === 0) {
                this.endRound();
            }
        } else {
            if (this.game.enemies.countLiving() === 0) {
                this.endRound();
            }
        }

        if (this.game.player.dead) {
            this.gatherStatistics();
            this.gameover();
        }
    },

    updateGUI: function () {
        var t1, t2, enemyContent, pointer;
        if (Darwinator.settings.enemyVsEnemy) {
            t1 = this.game.team1.nrAlive,
            t2 = this.game.team2.nrAlive,
            enemyContent = 'Enemies remaining: Team 1: ' + t1 + ' Team 2: ' + t2;
        } else {
            enemyContent = 'Enemies remaining: ' + this.game.enemies.countLiving();
        }

        this.fps.text = 'FPS: ' + this.game.time.fps;
        this.stats.text = 'Player stamina: ' + Math.round(this.game.player.currBreath) + '/' + Math.round(this.game.player.stamina);
        this.health.text = 'Health: ' + Math.round(this.game.player.health);
        this.enemiesRemaining.text = enemyContent;

        pointer = this.game.input.activePointer;
        this.crosshair.x = pointer.x;
        this.crosshair.y = pointer.y;
    },

    updateTimer: function () { // Callback to update time remaining display every second
        this.roundSecondsRemaining--;
        this.secondsRemaining.text = 'Seconds remaining: ' + this.roundSecondsRemaining;
    },

    updateNrAlive: function() {
        var alive = 0;
        for (var i = 0; i < this.game.team1.length; i++) {
            if(!this.game.team1[i].dead) {
                alive++;
            }
        }
        this.game.team1.nrAlive = alive;
        alive = 0;
        for (i = 0; i < this.game.team2.length; i++) {
            if(!this.game.team2[i].dead) {
                alive++;
            }
        }
        this.game.team2.nrAlive = alive;
    },

    bulletCollisionHandler: function (bullet, target) {
        /* It seems Phaser is a bit inconsistent with which parameter is sent first */
        if (bullet instanceof Darwinator.Entity) {
            var tmp = bullet;
            bullet = target;
            target = tmp;
        }
        /* Only do deal damage and remove bullet if the target was a entity of another type than the owner
        of the bullet */
        if (target instanceof Darwinator.Player && bullet.owner instanceof Darwinator.Player ||
            target instanceof Darwinator.Enemy && bullet.owner instanceof Darwinator.Enemy) {
            if (!(bullet instanceof Darwinator.Entity)) {
                bullet.kill();
            }
            return;
        }
        if (target instanceof Darwinator.Entity) {
            var dmg = bullet.owner.damage;
            target.takeDamage(dmg);
            if(target instanceof Darwinator.Player){
              var enemy = bullet.owner;
              enemy.damageDone += dmg;
            }
        }
        if (!(bullet instanceof Darwinator.Entity)) {
            bullet.kill();
        }
    },

    initEnemyVsEnemy: function() {
        var size, i, en1, en2; 
        size = this.game.enemies.length;
        this.game.team1 = [];
        this.game.team2 = [];

        for (i = 0; i < size / 2; i++) {
            en1 = this.game.enemies.getAt(i);
            en2 = this.game.enemies.getAt((size / 2) + i);
            en1.team = 1;
            en2.team = 2;
            en1.target = null;
            en2.target = null;
            this.game.team1.push(en1);
            this.game.team2.push(en2);
        }

        this.game.enemies.callAll("findTarget");
        this.game.team1.nrAlive = this.game.team1.length;
        this.game.team2.nrAlive = this.game.team2.length;
    },

    endRound: function() {
        this.numberOfRounds += 1;
        this.gatherStatistics();

        this.beforeSwitch();
        this.game.state.start('result', false);
    },

    gameover: function() {
        this.beforeSwitch()
        this.game.state.start('gameover', false);
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
    },

    goFullScreen: function(){
      this.game.scale.startFullScreen();
    },

    gatherStatistics: function() {
        var nbrIntelligence = 0,
            nbrAgility      = 0,
            nbrStrength     = 0,
            nbrDefault      = 0,
            nbrAlive        = 0,
            dmgIntelligence = 0,
            dmgStrength     = 0,
            dmgAgility      = 0,
            dmgDefault      = 0,
            scoreAgiltiy    = 0,
            scoreStrength   = 0,
            scoreIntellect  = 0,
            scoreDefault    = 0;        

        for (var i = 0; i < this.game.enemies.length; i++){
            var e = this.game.enemies.getAt(i);
            if (e.category === "enemy_intellect") {
                nbrIntelligence += 1;
                dmgIntelligence += e.damageDone;
                scoreIntellect  += e.abilityScore;
            } else if (e.category === "enemy_agility") {
                nbrAgility   += 1;
                dmgAgility   += e.damageDone;
                scoreAgiltiy += e.abilityScore;
            } else if (e.category === "enemy_strength") {
                nbrStrength   += 1;
                dmgStrength   += e.damageDone;
                scoreStrength += e.abilityScore;
            } else {
                nbrDefault   += 1;
                dmgDefault   += e.damageDone;
                scoreDefault += e.abilityScore;
            }
            if (e.alive === true) {
                nbrAlive +=1;
            }
        }
        console.log("Roundnumber: " + this.numberOfRounds);
        console.log("****   INTELLIGENT   ****")
        console.log("Number of Enemies: " + nbrIntelligence);
        console.log("Damage done: " + dmgIntelligence);
        console.log("Ability Score: " + scoreIntellect);
        console.log("****   AGILITY   ****")
        console.log("Number of Enemies: " + nbrAgility);
        console.log("Damage done: " + dmgAgility);
        console.log("Ability Score: " + scoreAgiltiy);
        console.log("****   STRENGTH   ****")
        console.log("Number of Enemies: " + nbrStrength);
        console.log("Damage done: " + dmgStrength);
        console.log("Ability Score: " + scoreStrength);
        console.log("****   DEFAULT   ****")
        console.log("Number of Enemies: " + nbrDefault);
        console.log("Damage done: " + dmgDefault);
        console.log("Ability Score: " + scoreDefault);
        console.log("_______SUMMARY_______")
        console.log("Number of Enemies Alive: " + nbrAlive);
        var dmg = dmgIntelligence + dmgAgility + dmgStrength + dmgDefault;
        console.log("Total Damage Done: " + dmg);
        var totalScore = scoreDefault + scoreStrength + scoreAgiltiy + scoreIntellect;
        console.log("Total Score: " + totalScore);
    },

};
