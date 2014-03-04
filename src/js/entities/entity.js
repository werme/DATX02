'use strict';

Darwinator.Entity = function(game, x, y, key, anims, health, strength, agility, intellect) {
  anims = anims || [];
  Phaser.Sprite.call(this, game, x, y, key);

  this.game                     = game;
  this.body.collideWorldBounds  = true;

  this.strength                 = !!strength ? strength : 0;
  this.agility                  = !!agility ? agility : 0;
  this.intellect                = !!intellect ? intellect : 0;
  this.health                   = !!health ? health + this.strength : 50;
  this.damage                   = 5 + this.strength/3;
  this.speed                    = 75 + this.agility*1 - this.strength/8;
  this.stamina                  = 50 + this.agility*2 - this.strength/5;
  this.aim                      = this.intellect; 
  this.criticalStrike           = this.intellect/100;
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