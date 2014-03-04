'use strict';

Darwinator.Entity = function(game, x, y, key, anims, health, strength, agility) {
  anims = anims || [];
  Phaser.Sprite.call(this, game, x, y, key);

  this.game                     = game;
  this.body.collideWorldBounds  = true;

  this.health                   = health;
  this.strength                 = strength;
  this.damage                   = !!this.strength ? 5 + Math.round(this.strength/3) : 5;
  this.agility                  = agility;
  this.speed                    = !!this.agility ? 75 + this.agility : 75;
  this.stamina                  = !!this.agility ? 50 + this.agility*2 : 50;
  this.currBreath               = this.stamina;

  if (anims.length) {
    for (var i = 0; i < anims.length; i++) {
      var tmp = anims[i];
      this.animations.add.apply(this.animations, tmp);
    }
  }
};

Darwinator.Entity.prototype = Object.create(Phaser.Sprite.prototype);

Darwinator.Entity.prototype.update = function() {};

Darwinator.Entity.prototype.takeDamage = function(amount) {
  this.health = this.health - amount;
};