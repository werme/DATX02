'use strict';

Darwinator.GameState = function() {

  this.enemies               = null;
  this.bullets               = null;
  this.cursors               = null;
  this.tileset               = null;
  this.layer                 = null;
  this.fps                   = null;
  this.stats                 = null;
  this.health                = null;
  this.secondsRemaining      = null;
  this.enemiesRemaining      = null;
  this.pauseText             = null;
  this.roundSecondsRemaining = null;
  this.endRoundTimer         = null;
  this.displayTimeLeftTimer  = null;

  this.spawnPositions        = [];
  this.roundLengthSeconds    = 60;
}

Darwinator.GameState.prototype = {

  create: function () {
    this.cursors = this.game.input.keyboard.createCursorKeys();

    var cheatKey = this.game.input.keyboard.addKey(Phaser.Keyboard.E);
    cheatKey.onDown.add(this.endRound, this);

    // Toggle pause with space
    var key = this.game.input.keyboard.addKey(Phaser.Keyboard.P);
    key.onDown.add(this.togglePause, this);

    this.initPauseOverlay();

    // Since states by default lack a callback for the resume event.
    this.game.onResume.add(this.resumed, this);

    // Initiate level & spawn enemies and player
    // TODO group these to make the order constant.
    this.level = new Darwinator.Level(this.game);
    this.layer = this.level.layer;
    this.spawnPlayer(160, 620);
    this.level.spawnEnemies();
    this.enemies = this.level.enemies;

    // Renders the non-collidable top layer on top of player and enemies.
    this.level.addTopLayer();

    // TODO move bullets to separate class
    this.bullets = this.game.add.group();
    this.bullets.createMultiple(30, 'arrow');
    this.bullets.setAll('anchor.x', 0.5);
    this.bullets.setAll('anchor.y', 0.5);
    // this.bullets.setAll('scale.x', 2);
    // this.bullets.setAll('scale.y', 2);
    this.bullets.setAll('outOfBoundsKill', true);

    this.game.player.weapon = new window.Darwinator.Weapon(this.game, 0, 0,
    Darwinator.PLAYER_RANGE_WEAPON_BASE_COOLDOWN, 500, this.bullets, 10, this.game.player);

    this.displayGUI();

    this.startTimers();
  },

  displayTimer: function () { // Callback to update time remaining display every second
    this.roundSecondsRemaining--;
    this.secondsRemaining.content = 'Seconds remaining: ' + this.roundSecondsRemaining;
  },

  displayGUI: function () {
    
    // For development only
    var style = { font: '16px monospace', fill: '#fff' };
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
  },

  startTimers: function () {
    // end round when the time limit is reached
    this.endRoundTimer = this.game.time.events.add(Phaser.Timer.SECOND * this.roundLengthSeconds, this.endRound, this);
    // display seconds remaining until round ends
    this.roundSecondsRemaining = this.roundLengthSeconds;
    this.displayTimeLeftTimer = this.game.time.events.repeat(Phaser.Timer.SECOND, this.roundLengthSeconds, this.displayTimer, this);
  },

  stopTimers: function () {
    this.game.time.events.remove(this.endRoundTimer);
    this.game.time.events.remove(this.displayTimeLeftTimer);
  },

  spawnPlayer: function (x, y) {
    // Instanciate new player or reset existing.
    if (!this.game.player) {
      this.game.player = new Darwinator.Player(this.game, x, y, this.cursors);
    } else {
      this.game.player.reset(x, y, Darwinator.PLAYER_BASE_HEALTH);
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
    this.game.physics.collide(this.enemies, this.game.player.sword, this.meleeAttack, null, this);
    this.game.physics.collide(this.game.player, this.layer);
    this.game.physics.collide(this.enemies, this.layer);
    this.game.physics.collide(this.bullets, this.enemies, this.bulletCollisionHandler, null, this);
    this.game.physics.collide(this.bullets, this.layer, this.bulletCollisionHandler, null, this);
    this.bullets.forEachAlive(this.checkBulletSpeed, this); //workaround for misbehaving bullets..

    // For development only
    this.fps.content = 'FPS: ' + this.game.time.fps;
    this.stats.content = 'Player stamina: ' + Math.round(this.game.player.currBreath) + '/' + Math.round(this.game.player.stamina);
    this.health.content = 'Health: ' + Math.round(this.game.player.health);
    this.enemiesRemaining.content = 'Enemies remaining: ' + this.enemies.countLiving();

    // end round when all enemies are dead
    if(this.enemies.countLiving() === 0){
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
        console.log('No melee damage was dealt');
      }
    }
  },

  checkBulletSpeed: function (bullet) {
    if (!bullet) {
      console.log('checkBulletSpeed: Undefined bullet');
      return;
    }
    var speed = Math.sqrt(  (bullet.body.velocity.x * bullet.body.velocity.x)
                          + (bullet.body.velocity.y * bullet.body.velocity.y));
    var tolerance = 0.1;
    if(Math.abs(speed - this.game.player.weapon.bulletSpeed) > tolerance){ //illegal speed
      if(bullet.x === this.game.player.weapon.x && bullet.y === this.game.player.weapon.y){ // bullet didn't reset properly on revival
        this.game.player.weapon.resetBullet(bullet);
      } else { //bullet got stuck or bounced
        bullet.kill();
      }
    }
  },

  bulletCollisionHandler: function (bullet, target) {
    if (target instanceof Darwinator.Enemy) {
      target.takeDamage(this.game.player.damage);
    }
    bullet.kill();
  },

  togglePause: function() {
    this.game.paused = !this.game.paused;
  },

  endRound: function() {
    this.stopTimers();
    this.game.state.start('resultScreen', true);
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
