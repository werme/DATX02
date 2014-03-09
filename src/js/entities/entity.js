'use strict';

Darwinator.Entity = function(game, x, y, health, key, anims) {
  anims = anims || [];
  Phaser.Sprite.call(this, game, x, y, key);

  this.game                     = game;
  this.health                   = health;
  this.body.collideWorldBounds  = true;
  this.stamina                  = 50;
  this.currBreath               = this.stamina;

  // For testing of the result screen
  this.attributes = {
    stamina: 50,
    speed:   100
  }
};

Darwinator.Entity.prototype = Object.create(Phaser.Sprite.prototype);

Darwinator.Entity.prototype.update = function() {};

Darwinator.Entity.prototype.takeDamage = function(amount) {
  this.health = this.health - amount;
};