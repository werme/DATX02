'use strict';

Darwinator.Weapon = function (game, coolDown, damage, owner) {
    this.game         = game;
    this.coolDown     = coolDown;
    this.damage       = damage;
    this.owner        = owner;
    this.lastAttack   = 0;
};

Darwinator.Weapon.prototype.onCooldown = function(){
    return Date.now() - this.lastAttack < this.coolDown;
};