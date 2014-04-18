'use strict';

Darwinator.Cannon = function(game, owner, bulletsContainer) {
    Darwinator.RangedWeapon.call(this, game, Darwinator.CANNON_COOLDOWN,
            Darwinator.CANNON_BULLET_SPEED, Darwinator.CANNON_DAMAGE, owner);

    this.bullets.createMultiple(30, 'cannonball');
    this.bullets.setAll('anchor.x', 0.5);
    this.bullets.setAll('anchor.y', 0.5);
    this.bullets.setAll('scale.x', 2);
    this.bullets.setAll('scale.y', 2);
    this.bullets.setAll('outOfBoundsKill', true);
    this.bullets.setAll('owner', this.owner);

    this.game.physics.enable(this.bullets, Phaser.Physics.ARCADE);

    bulletsContainer.add(this.bullets);
};

Darwinator.Cannon.prototype = Object.create(Darwinator.RangedWeapon.prototype);
