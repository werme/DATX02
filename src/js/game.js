(function() {
  'use strict';

  function Game() {
    this.player = null;
    this.cursors = null;
  }

  Game.prototype = {

    create: function () {
      this.game.world.setBounds(0,0, 1280, 940);
      this.background = this.add.sprite(0,0, 'background');

      var x = this.game.width / 2
        , y = this.game.height / 2;

      this.player = this.add.sprite(x, y, 'player');
      this.player.anchor.setTo(0.5, 0.5);
      this.player.animations.add('walk-left', [8,9,10,11], 10, true);
      this.player.animations.add('walk-right', [12,13,14,15], 10, true);
      this.player.animations.add('walk-up', [0,1,2,3], 10, true);
      this.player.animations.add('walk-down', [4,5,6,7], 10, true);
      this.player.scale.setTo(3,3);
      this.player.body.collideWorldBounds = true;

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
      this.game.camera.follow(this.player);
    },

    update: function () {
      this.player.body.velocity.setTo(0,0);

      this.playerWeapon.x = this.player.x;
      this.playerWeapon.y = this.player.y;

      if (this.cursors.up.isDown) {
        this.player.body.velocity.y = -100;
        this.player.animations.play('walk-up');
      } 
      if (this.cursors.left.isDown) {
        this.player.body.velocity.x = -100;
        this.player.animations.play('walk-left');
      }
      if (this.cursors.right.isDown) {
        this.player.body.velocity.x = 100;
        this.player.animations.play('walk-right');
      }
      if (this.cursors.down.isDown) {
        this.player.body.velocity.y = 100;
        this.player.animations.play('walk-down');
      }

      this.playerWeapon.rotation = this.game.physics.angleToPointer(this.playerWeapon);
      if (this.game.input.activePointer.isDown){
        if (this.game.time.now > this.nextFire && this.bullets.countDead() > 0){
          this.nextFire = this.game.time.now + this.coolDown;
          var bullet = this.bullets.getFirstDead();
          bullet.reset(this.playerWeapon.x, this.playerWeapon.y);
          bullet.rotation = this.game.physics.moveToPointer(bullet, 1000);
        }
        //fire();
      }
    }

  };

  window.darwinator.Game = Game;
  /*
  function fire (bullets, playerWeapon) {

   // if (game.time.now > nextFire && bullets.countDead() > 0)
    //{
       // nextFire = game.time.now + fireRate;

        var bullet = bullets.getFirstDead();

        bullet.reset(playerWeapon.x, playerWeapon.y);

        bullet.rotation = this.game.physics.moveToPointer(bullet, 1000);
  //  }

  }*/
}());
