'use strict';

  Darwinator.Weapon = function(game, coolDown, bulletSpeed, bullets, damage, owner) {
    this.game         = game;
    var baseCoolDown  = Darwinator.PLAYER_RANGE_WEAPON_BASE_COOLDOWN - game.player.attributes.intellect * 20;
    this.coolDown     = baseCoolDown > 200 ? baseCoolDown : 100;
    this.nextFire     = 0;
    this.bullets      = this.game.add.group();
    this.bulletSpeed  = bulletSpeed;
    this.damage       = damage;
    this.owner        = owner;
    this.bullets.createMultiple(30, 'arrow');
    this.bullets.setAll('anchor.x', 0.5);
    this.bullets.setAll('anchor.y', 0.5);
    this.bullets.setAll('outOfBoundsKill', true);
    this.game.physics.enable(this.bullets, Phaser.Physics.ARCADE);
    bullets.add(this.bullets);
  };

  Darwinator.Weapon.prototype.fire = function (x, y) {
    if (this.game.time.now > this.nextFire && this.bullets.countDead() > 0) {
        this.nextFire = this.game.time.now + this.coolDown;
        var bullet    = this.bullets.getFirstDead();
        bullet.reset(this.owner.x, this.owner.y); // resets sprite and body
        bullet.target = { x: x, y: y };
        var angle = this.takeAim(bullet.target.x, bullet.target.y);
        bullet.rotation = angle;
        this.game.physics.arcade.velocityFromRotation(angle, this.bulletSpeed, bullet.body.velocity);
    }
  };

  Darwinator.Weapon.prototype.takeAim = function(x, y) {
    var perfAngle = this.game.physics.arcade.angleToXY(this.owner, x, y);
    perfAngle += (Math.random() - 0.5) / (Math.round(this.owner.attributes.intellect / 5) + 1);
    return perfAngle;
  };
