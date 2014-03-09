'use strict';

  /**
  * Shared attributes between of the different entities, player and enemies. 
  * @method Darwinator.Entity
  * @param {Phaser.Game}  - The current game instance
  * @param {Number}       - [x] The x-value of the pixel
  * @param {Number}       - [y] The y-value of the pixel
  * @param {Array}        - The array containing animations for the sprite
  * @param {Number}       - Entity health
  * @param {Number}       - Entity strength, defaults to 0. Used for increasing damage and health, reducing speed / stamina.
  * @param {Number}       - Entity agility, defaults to 0. Used for increasing speed and stamina.
  * @param {Number}       - Entity intellect, defaults to 0. Used for defining how well the entity aims and critical strike percentage.
  */
Darwinator.Entity = function(game, x, y, key, health, strength, agility, intellect) {
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
  this.aim                      = this.intellect; //Intended to define how well the enemy aims. 0 = "shitty" aim, 100 = "perfect" aim
  this.criticalStrike           = this.intellect/100; //Critical strike percentage
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

Darwinator.Entity.prototype.setAnimations = function(anims) {
  anims = anims || [];

  if (anims.length) {
    for (var i = 0; i < anims.length; i++) {
      var tmp = anims[i];
      this.animations.add.apply(this.animations, tmp);
    }
  }
};