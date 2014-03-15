'use strict';

Darwinator.GameState = function() {
  this.enemies  = null;
  this.bullets  = null;
  this.playerWeapon = null;
  this.cursors  = null;
  this.tileset  = null;
  this.layer    = null;
  this.fps      = null;
  this.stats    = null;
  this.health   = null;
  this.secondsRemaining = null;
  this.enemiesRemaining = null;
  this.pauseText = null;
  this.spawnPositions = [];
  this.numberOfEnemies = null;
  this.sword    = null;
  this.roundLengthSeconds = 60; 
  this.roundSecondsPassed = 0;
  this.bulletsRemaining = null;
}

Darwinator.GameState.prototype = {

  create: function () {
    this.reset();

    this.cursors = this.game.input.keyboard.createCursorKeys();

    var cheatKey = this.game.input.keyboard.addKey(Phaser.Keyboard.E);
    cheatKey.onDown.add(this.endRound, this);

    this.initPauseOverlay();

    // Since states by default lack a callback for the resume event.
    this.game.onResume.add(this.resumed, this);

    //initiate level & spawn enemies and player
    //TODO group these to make the order constant.
    this.level = new Darwinator.Level(this.game);
    this.layer = this.level.layer;
    this.spawnPlayer(160, 620);
    this.level.spawnEnemies(this.numberOfEnemies);
    this.enemies = this.level.enemies;
    //renders the non-collidable top layer on top of player and enemies.
    this.level.addTopLayer();
    this.sword = this.game.player.sword;

    // TODO move bullets to separate class
    this.bullets = this.game.add.group();
    this.bullets.createMultiple(30, 'enemy');
    this.bullets.setAll('anchor.x', 0.5);
    this.bullets.setAll('anchor.y', 0.5);
    this.bullets.setAll('scale.x', 0.1);
    this.bullets.setAll('scale.y', 0.1);
    this.bullets.setAll('outOfBoundsKill', true);

    this.playerWeapon = new window.Darwinator.Weapon(this.game, 0, 0, 200, 1000, this.bullets, 10, this.game.player);
    this.game.player.weapon = this.playerWeapon;


    // For development only
    var style = { font: "16px monospace", fill: '#fff' };
    this.fps = this.game.add.text(16, 16, 'FPS: 0', style);
    this.fps.fixedToCamera = true;

    this.stats = this.game.add.text(16, 36, '', style);
    this.stats.fixedToCamera = true;

    this.health = this.game.add.text(16, 56, '', style);
    this.health.fixedToCamera = true;

    this.secondsRemaining = this.game.add.text(16, 76, 'Seconds remaining: ' + this.roundLengthSeconds, style);
    this.secondsRemaining.fixedToCamera = true;

    // for debugging - easier to check if a round ended too early
    this.enemiesRemaining = this.game.add.text(16, 96, 'Enemies remaining: ', style);
    this.enemiesRemaining.fixedToCamera = true;

    this.gameOver = this.game.add.text(this.game.width / 2, this.game.height / 2, '', {fontSize: '48px', fill:'#F08'});
    this.gameOver.fixedToCamera = true;

    this.bulletsRemaining = this.game.add.text(16, 116, 'Bullets remaining: ', style);
    this.bulletsRemaining.fixedToCamera = true;

    // end round when the time limit is reached
    this.game.time.events.add(Phaser.Timer.SECOND * this.roundLengthSeconds, this.endRound, this);
    this.roundSecondsPassed = 0;
    this.game.time.events.repeat(Phaser.Timer.SECOND * 1, this.roundLengthSeconds-1, this.displayTimer, this);
  },

  displayTimer: function(){ //callback to update time remaining display every second
    this.roundSecondsPassed++;
    this.secondsRemaining.content = 'Seconds remaining: ' + (this.roundLengthSeconds - this.roundSecondsPassed);
  },

  reset: function () {
    this.numberOfEnemies = 10;
  },

  spawnPlayer: function (x, y) {
    // Instanciate new player or reset existing.
    if (!this.game.player) {
      this.game.player = new Darwinator.Player(this.game, x, y, this.cursors, Darwinator.PLAYER_START_HEALTH, 10, 15, 15);
    } else {
      this.game.player.reset(x, y, Darwinator.PLAYER_START_HEALTH);
      this.game.player.bringToTop();
      this.game.player.updateAttributes();

      // TODO: Find out why this is neccessary.
      this.game.player.cursors = this.cursors;
      this.game.player.initKeys(this.game);
    }

    // Add player sprite to stage and focus camera.
    this.game.add.existing(this.game.player);
    this.game.camera.follow(this.game.player);
  },

  initPauseOverlay: function () {
    var styling = { fontSize: '16px', fill: '#fff', align: 'center' },
        x       = this.game.width  / 2,
        y       = this.game.height / 2;

    // Render text centered and fixed to camera.
    this.pauseText = this.game.add.text(x, y, 'Game paused', styling);
    this.pauseText.anchor.setTo(0.5, 0.5);
    this.pauseText.fixedToCamera = true;

    // Should be hidden by default.
    this.pauseText.visible = false;
  },

  update: function () {
    this.game.physics.collide(this.enemies, this.sword, this.meleeAttack, null, this);
    this.game.physics.collide(this.game.player, this.layer);
    this.game.physics.collide(this.enemies, this.layer);
    this.game.physics.collide(this.enemies);
    this.game.physics.collide(this.bullets, this.enemies, this.bulletCollisionHandler, null, this);
    this.game.physics.collide(this.bullets, this.layer, this.bulletCollisionHandler, null, this);
    this.bullets.forEachAlive(this.checkBulletSpeed, this); //workaround for misbehaving bullets..

    // For development only
    this.fps.content = 'FPS: ' + this.game.time.fps;
    this.stats.content = 'Player stamina: ' + Math.round(this.game.player.currBreath) + '/' + this.game.player.stamina;
    this.health.content = 'Health: ' + Math.round(this.game.player.health);
    this.enemiesRemaining.content = 'Enemies remaining: ' + this.enemies.countLiving();
    this.bulletsRemaining.content = 'Bullets remaining: ' + this.bullets.countLiving();

    // end round when all enemies are dead
    if(this.enemies.countLiving() === 0){
      //console.log('Killed all enemies! Here comes the new wave!');
      //this.enemies = Darwinator.GeneticAlgorithm.generatePopulation(this.game, this.game.player, this.enemies, true, this.level.spawnPositions);
      this.endRound();
    }
  },

  meleeAttack: function (obj1, obj2) {
    var enemy;
    if (this.game.player.attacking) {
      if (obj1 instanceof Darwinator.Enemy) {
        enemy = obj1;
        enemy.takeDamage(this.game.player.damage);
      } else if (obj2 instanceof Darwinator.Enemy) {
        enemy = obj2;
        enemy.takeDamage(this.game.player.damage);
      } else {
        console.log("No melee damage was dealt");
      }
    } 
  },

  checkBulletSpeed: function(bullet){
    if(!bullet){
      console.log('checkBulletSpeed: Undefined bullet');
      return;
    }
    var speed = Math.sqrt(  (bullet.body.velocity.x * bullet.body.velocity.x) 
                          + (bullet.body.velocity.y * bullet.body.velocity.y));
    var tolerance = 0.1;
    if(Math.abs(speed - this.playerWeapon.bulletSpeed) > tolerance){ //illegal speed
      if(bullet.x === this.playerWeapon.x && bullet.y === this.playerWeapon.y){ // bullet didn't reset properly on revival
        this.playerWeapon.resetBullet(bullet);
      } else { //bullet got stuck or bounced
        bullet.kill();
      }
    }
  },

  bulletCollisionHandler: function(bullet, target){
    if (target instanceof Darwinator.Enemy) {
      target.takeDamage(this.game.player.damage);
    }
    bullet.kill();
  },

  endRound: function() {
    if(this.roundSecondsPassed >= this.roundLengthSeconds || this.enemies.countLiving() === 0){
      this.game.state.start('resultScreen', true);
    }
  },

  paused: function () {
    this.pauseText.visible = true;
    console.log("Paused game.");
  },

  resumed: function() {
    this.pauseText.visible = false;
    console.log("Resumed game.");
  }

};
