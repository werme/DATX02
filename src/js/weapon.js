'use strict';

  Darwinator.Weapon = function(game, x, y, coolDown, bulletSpeed, bullets, damage, owner) {
    this.game         = game;
    this.x            = x;
    this.y            = y;
    var baseCoolDown  = Darwinator.PLAYER_RANGE_WEAPON_BASE_COOLDOWN - game.player.attributes.intellect * 20;
    this.coolDown     = baseCoolDown > 200 ? baseCoolDown : 100;
    this.nextFire     = 0;
    this.bullets      = bullets;
    this.bulletSpeed  = bulletSpeed;
    this.damage       = damage;
    this.owner        = owner;
  }

  Darwinator.Weapon.prototype.updateManually = function(x, y) {
      this.x = x;
      this.y = y;
  };

  Darwinator.Weapon.prototype.fire = function (x, y) {
    if (this.game.time.now > this.nextFire && this.bullets.countDead() > 0) {
        this.nextFire = this.game.time.now + this.coolDown;
        var bullet    = this.bullets.getFirstDead();
        bullet.target = { x: x, y: y };
        this.resetBullet(bullet);
    }
  };

  Darwinator.Weapon.prototype.takeAim = function(x, y) {
    var perfAngle = this.game.physics.arcade.angleToXY(this, x, y);
    perfAngle += (Math.random() - 0.5) / (Math.round(this.owner.attributes.intellect / 5) + 1);
    return perfAngle;
  };

  Darwinator.Weapon.prototype.resetBullet = function(bullet){
    bullet.reset(this.x, this.y); // resets sprite and body
    var angle = this.takeAim(bullet.target.x, bullet.target.y);
    bullet.rotation = angle;
    this.game.physics.arcade.velocityFromRotation(angle, this.bulletSpeed, bullet.body.velocity);
  };
