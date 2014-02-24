(function() {
  'use strict';

  function Game() {
    this.player   = null;
    this.enemy    = null;
    this.cursors  = null;
    this.map      = null;
    this.tileset  = null;
    this.layer    = null;
    this.fps      = null;
    this.stats    = null;
  }

  Game.prototype = {

    create: function () {
      this.game.world.setBounds(0,0, 1280, 940);
      this.background = this.add.sprite(0,0, 'background');

      var x = 680
        , y = this.game.height / 2;


      this.map = this.game.add.tilemap('level1');
      this.map.addTilesetImage('tiles', 'tiles');
      //to be changed
      this.map.setCollisionByExclusion([7, 2]);


      this.layer = this.map.createLayer('Tile Layer 1');

      this.layer.resizeWorld();

      this.playerWeapon = this.add.sprite(x, y, 'enemy');
      this.playerWeapon.anchor.setTo(0.5, 0.5);
      this.playerWeapon.scale.setTo(0.2, 0.2);
      this.playerWeapon.body.collideWorldBounds = true;

      this.bullets = this.game.add.group();
      this.bullets.createMultiple(30, 'enemy');
      this.bullets.setAll('anchor.x', 0.5);
      this.bullets.setAll('anchor.y', 0.5);
      this.bullets.setAll('scale.x', 0.1);
      this.bullets.setAll('scale.y', 0.1);
      this.bullets.setAll('outOfBoundsKill', true);

      this.coolDown = 200;
      this.nextFire = 0;

      this.cursors = this.game.input.keyboard.createCursorKeys();

      this.player = new window.Darwinator.Player(this.game, x, y, 100, this.cursors);
      this.player.scale.setTo(2,2);
      this.enemy = new window.Darwinator.Enemy(this.game, 100, 100, 100);

      this.game.add.existing(this.enemy);
      this.game.add.existing(this.player);
      this.game.camera.follow(this.player);

      // For development only
      this.fps = this.game.add.text(16, 16, 'FPS: 0', { fontSize: '16px', fill: '#F08' });
      this.fps.fixedToCamera = true;

      this.stats = this.game.add.text(16, 40, '', { fontSize: '16px', fill: '#F08' });
      this.stats.fixedToCamera = true;
    },

    update: function () {
      this.playerWeapon.x = this.player.x;
      this.playerWeapon.y = this.player.y;

      this.playerWeapon.rotation = this.game.physics.angleToPointer(this.playerWeapon);
      if (this.game.input.activePointer.isDown){
        if (this.game.time.now > this.nextFire && this.bullets.countDead() > 0){
          this.nextFire = this.game.time.now + this.coolDown;
          var bullet = this.bullets.getFirstDead();
          bullet.reset(this.playerWeapon.x, this.playerWeapon.y);
          bullet.rotation = this.game.physics.moveToPointer(bullet, 1000);
        }
      }
      this.game.physics.collide(this.player, this.layer);
      this.game.physics.moveToObject(this.enemy, this.player, 50);

      // For development only
      this.fps.content = 'FPS: ' + this.game.time.fps;
      this.stats.content = 'Player stamina: ' + Math.round(this.player.currBreath) + '/' + this.player.stamina;
    }

  };

  window.Darwinator = window.Darwinator || {};
  window.Darwinator.Game = Game;

}());
