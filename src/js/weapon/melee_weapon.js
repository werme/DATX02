'use strict';

Darwinator.MeleeWeapon = function (game, coolDown, damage, owner) {
    Darwinator.Weapon.call(this, game, coolDown, damage, owner);

    // nothing permanent here, just some values to get started with implementation
    this.coolDown           = 250;
    this.damage             = this.owner.damage;
    this.knockBackDistance  = 2 * this.owner.attributes.strength;
};

Darwinator.MeleeWeapon.prototype = Object.create(Darwinator.Weapon.prototype);

Darwinator.MeleeWeapon.strike = function(target){
  if (!this.onCooldown()){
    var crit  = Math.random() - this.criticalStrike;
    var dmg   = this.damage;

    if (crit < 0){
      dmg *= 2;
    }
    target.takeDamage(dmg);
    this.lastAttack = Date.now();
    return dmg;
  }
};

Darwinator.MeleeWeapon.knockBack = function(target){

};