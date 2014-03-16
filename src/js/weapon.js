(function() {
  'use strict';

  function Weapon(game, x, y, coolDown, bulletSpeed, bullets, damage, owner) {
    this.game         = game;
    this.x            = x;
    this.y            = y;
    this.coolDown     = coolDown;
    this.nextFire     = 0;
    this.bullets      = bullets;
    this.bulletSpeed  = bulletSpeed;
    this.damage       = damage;
    this.owner        = owner;
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
          bullet.target = {x: x, y: y};
          this.resetBullet(bullet);
      }
    },

    takeAim: function(x, y) {
      var perfAngle = this.game.physics.angleToXY(this, x, y);
      perfAngle += (Math.random() - 0.5) * 15 / this.owner.attributes.intellect;
      return perfAngle;
    },

    resetBullet: function(bullet){
      bullet.reset(this.x, this.y); // resets sprite and body
      var angle = this.takeAim(bullet.target.x, bullet.target.y);
      bullet.rotation = angle;
      this.game.physics.velocityFromRotation(angle, this.bulletSpeed, bullet.body.velocity);
    }

  };

  window.Darwinator = window.Darwinator || {};
  window.Darwinator.Weapon = Weapon;

}());
