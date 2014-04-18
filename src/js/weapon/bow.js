'use strict';

Darwinator.Bow = function(game, owner, bulletsContainer) {
    Darwinator.RangedWeapon.call(this, game, Darwinator.BOW_COOLDOWN,
            Darwinator.BOW_BULLET_SPEED, Darwinator.BOW_DAMAGE, owner);

    this.bullets.createMultiple(30, 'arrow');
    this.bullets.setAll('anchor.x', 0.5);
    this.bullets.setAll('anchor.y', 0.5);
    this.bullets.setAll('outOfBoundsKill', true);
    this.bullets.setAll('owner', this.owner);

    this.game.physics.enable(this.bullets, Phaser.Physics.ARCADE);

    bulletsContainer.add(this.bullets);
};

Darwinator.Bow.prototype = Object.create(Darwinator.RangedWeapon.prototype);
