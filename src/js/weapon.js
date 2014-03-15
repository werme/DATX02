(function() {
  'use strict';

  function Weapon(game, x, y, coolDown, bulletSpeed, bullets, damage) {
    this.game = game;
    this.x = x;
    this.y = y;
    this.coolDown = coolDown;
    this.nextFire = 0;
    this.bullets = bullets;
    this.bulletSpeed = bulletSpeed;
    this.damage = damage;
  }

  Weapon.prototype = {
    updateManually: function(x, y){
      this.x = x;
      this.y = y;
    },

    fire: function(x, y){
      if (this.game.time.now > this.nextFire && this.bullets.countDead() > 0){
          this.nextFire = this.game.time.now + this.coolDown;
          var bullet    = this.bullets.getFirstDead();
          bullet.reset(this.x, this.y);
          bullet.rotation = this.takeAim(x, y);
      }
    },

    takeAim: function(x, y) {
      var perfAngle = this.game.physics.angleToXY(this.game.player, x, y);
      // TODO: Make targeting depend on users intelligence.
      return perfAngle;
    }

  };

  window.Darwinator = window.Darwinator || {};
  window.Darwinator.Weapon = Weapon;

}());
