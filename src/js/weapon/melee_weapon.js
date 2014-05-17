'use strict';

Darwinator.MeleeWeapon = function (game, coolDown, damage, owner) {
    Darwinator.Weapon.call(this, game, coolDown, damage, owner);

    // nothing permanent here, just some values to get started with implementation
    this.coolDown           = 250;
    this.damage             = this.owner.damage;
    this.knockBackDistance  = 100 + 2 * this.owner.attributes.strength;
    this.knockBackCooldown  = 0;
    this.lastKnockBack      = 0;
};

Darwinator.MeleeWeapon.prototype = Object.create(Darwinator.Weapon.prototype);

Darwinator.MeleeWeapon.prototype.strike = function(target){
    var dmg = 0;
    if (!this.onCooldown()){
        var crit    = Math.random() - this.criticalStrike;
        dmg         = this.damage;

        if (crit < 0){
            dmg *= 2;
        }
        target.takeDamage(dmg);
        this.owner.damageDone += dmg;
        this.lastAttack = Date.now();
    }

    if (this.owner instanceof Darwinator.Player) {
        this.tryKnockBack(target);
    }
    return dmg;
};

Darwinator.MeleeWeapon.prototype.tryKnockBack = function(target){
    if(Date.now() - this.lastKnockBack >= this.knockBackCooldown){
        var angle           = this.game.physics.arcade.angleBetween(this.owner, target);
        var targetFuturePos = Darwinator.Helpers.calculatePosition(target.x, target.y, this.knockBackDistance, angle);
        target.knockedBack  = true;
        target.knockBackPos = targetFuturePos;
        this.lastKnockBack  = Date.now();
    }
};