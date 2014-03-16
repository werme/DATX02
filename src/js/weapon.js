'use strict';

Darwinator.Weapon = function (game, x, y, coolDown, bulletSpeed, bullets, damage) {
  this.game = game;

  this.x           = x;
  this.y           = y;

  var baseCoolDown = Darwinator.PLAYER_RANGE_WEAPON_BASE_COOLDOWN - game.player.attributes.intellect * 20;
  this.coolDown    = baseCoolDown > 200 ? baseCoolDown : 50;
  
  this.nextFire    = 0;
  this.bullets     = bullets;
  this.bulletSpeed = bulletSpeed;
  this.damage      = damage;
}

Darwinator.Weapon.prototype.updateManually = function (x, y) {
  this.x = x;
  this.y = y;
  this.game.physics.angleToPointer(this);

  if (this.game.input.activePointer.isDown) {
    this.fire();
  }
};

Darwinator.Weapon.prototype.fire = function() {
  if (this.game.time.now > this.nextFire && this.bullets.countDead() > 0) {
    this.nextFire = this.game.time.now + this.coolDown;
    var bullet    = this.bullets.getFirstDead();
    this.resetBullet(bullet);
  }
};

Darwinator.Weapon.prototype.resetBullet = function (bullet) { 
  bullet.reset(this.x, this.y); // resets sprite and body
  bullet.rotation = this.game.physics.moveToPointer(bullet, this.bulletSpeed);
};
