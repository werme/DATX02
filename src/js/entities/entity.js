'use strict';

Darwinator.Entity = function(game, x, y, health, key, anims) {
  anims = anims || [];
  Phaser.Sprite.call(this, game, x, y, key);

  this.game                     = game;
  this.health                   = health;
  this.body.collideWorldBounds  = true;
  this.stamina                  = 50;
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