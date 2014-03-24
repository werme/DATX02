'use strict';

Darwinator.Bow = function (game, coolDown, bulletSpeed, bullets, damage, owner) {
    Darwinator.Weapon.call(this, game, coolDown, bulletSpeed, damage, owner);

    this.bullets.createMultiple(30, 'arrow');
    this.bullets.setAll('anchor.x', 0.5);
    this.bullets.setAll('anchor.y', 0.5);
    this.bullets.setAll('outOfBoundsKill', true);

    this.game.physics.enable(this.bullets, Phaser.Physics.ARCADE);

    bullets.add(this.bullets);
};

Darwinator.Bow.prototype = Object.create(Darwinator.Weapon.prototype);
