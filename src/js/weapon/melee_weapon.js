'use strict';

Darwinator.MeleeWeapon = function (game, coolDown, bulletSpeed, damage, owner) {
    Darwinator.Weapon.call(this, game, coolDown, damage, owner);
    //var baseCoolDown  = coolDown - game.player.attributes.intellect * 20;
    //this.coolDown     = baseCoolDown > 200 ? baseCoolDown : 100;
    //this.nextFire     = 0;
    //this.bullets      = this.game.add.group();
    //this.bulletSpeed  = bulletSpeed;
};

Darwinator.MeleeWeapon.prototype = Object.create(Darwinator.Weapon.prototype);