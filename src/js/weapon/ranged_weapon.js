'use strict';

Darwinator.RangedWeapon = function (game, coolDown, bulletSpeed, damage, owner) {
    Darwinator.Weapon.call(this, game, coolDown, damage, owner);
    var baseCoolDown  = coolDown - game.player.attributes.intellect * 20;
    this.coolDown     = baseCoolDown > 200 ? baseCoolDown : 100;
    this.nextFire     = 0;
    this.bullets      = this.game.add.group();
    this.bulletSpeed  = bulletSpeed;
};

Darwinator.RangedWeapon.prototype = Object.create(Darwinator.Weapon.prototype);

Darwinator.RangedWeapon.prototype.fire = function (x, y) {
    var angle = this.takeAim(x,y);
    var bullet = this.loadGun(angle);
    if (bullet) {
        bullet.rotation = angle;
        this.game.physics.arcade.velocityFromRotation(angle, this.bulletSpeed, bullet.body.velocity);
    } 
};

Darwinator.RangedWeapon.prototype.fireInDirection = function (angle) {
    var bullet = this.loadGun(angle);
    if (bullet) {
        bullet.rotation = angle;
        this.game.physics.arcade.velocityFromRotation(angle, this.bulletSpeed, bullet.body.velocity);
    } 
}

Darwinator.RangedWeapon.prototype.loadGun = function (angle) {
    if (this.game.time.now > this.nextFire && this.bullets.countDead() > 0) {
        this.nextFire = this.game.time.now + this.coolDown;
        var bullet    = this.bullets.getFirstDead();
        bullet.reset(this.owner.x, this.owner.y); // resets sprite and body
        bullet.target = Darwinator.Enemy;
        bullet.owner = this.owner;
        return bullet;
    } else {
        return false;
    }
}

Darwinator.RangedWeapon.prototype.takeAim = function(x, y) {
    var perfAngle = this.game.physics.arcade.angleToXY(this.owner, x, y);
    perfAngle += (Math.random() - 0.5) / (Math.round(this.owner.attributes.intellect / 5) + 1);
    return perfAngle;
};
