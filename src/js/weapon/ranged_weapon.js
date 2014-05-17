'use strict';

Darwinator.RangedWeapon = function (game, coolDown, bulletSpeed, damage, owner) {
    Darwinator.Weapon.call(this, game, coolDown, damage, owner);
    
    var baseCoolDown  = coolDown - owner.attributes.intellect * 20;
    this.coolDown     = baseCoolDown > 200 ? baseCoolDown : 100;
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
    var bullet = this.loadGun();
    if (bullet) {
        bullet.rotation = angle;
        this.game.physics.arcade.velocityFromRotation(angle, this.bulletSpeed, bullet.body.velocity);
    } 
}

Darwinator.RangedWeapon.prototype.loadGun = function () {
    if (!this.onCooldown() && this.bullets.countDead() > 0) {
        var bullet    = this.bullets.getFirstDead();
        var center = {x: this.owner.x + this.owner.width / 2,
                      y: this.owner.y + this.owner.height / 2};
        bullet.reset(center.x, center.y); // resets sprite and body
        bullet.target = Darwinator.Enemy;
        bullet.owner = this.owner;
        bullet.lifespan = 3000;
        this.lastAttack = Date.now();
        return bullet;
    } else {
        return false;
    }
}

Darwinator.RangedWeapon.prototype.takeAim = function(x, y) {
    var perfAngle = this.game.physics.arcade.angleToXY(this.owner, x, y);
    perfAngle += (Math.random() - 0.3) / (Math.round(this.owner.attributes.intellect / 5) + 1);
    return perfAngle;
};
