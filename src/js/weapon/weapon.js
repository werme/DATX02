'use strict';

Darwinator.Weapon = function (game, coolDown, damage, owner) {
    this.game         = game;
    this.coolDown     = coolDown;
    this.damage       = damage;
    this.owner        = owner;
};