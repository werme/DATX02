'use strict';

Darwinator.Entity = function(game, x, y, key, anims, health, strength, sprint) {
  anims = anims || [];
  Phaser.Sprite.call(this, game, x, y, key);

  this.game                     = game;
  this.body.collideWorldBounds  = true;

  this.health                   = health;
  this.strength                 = strength;
  console.log(this.strength);
  this.damage                   = !!this.strength ? 5 + Math.round(this.strength/3) : 5;
  this.sprint                   = sprint;
  this.stamina                  = !!this.sprint ? 50 + this.sprint*3 : 50;
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