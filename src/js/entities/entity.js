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

  this.attributes = {
    strength:  !!strength  ? strength  : 0,
    agility:   !!agility   ? agility   : 0,
    intellect: !!intellect ? intellect : 0
  }

  this.updateAttributes();
};

Darwinator.Entity.prototype = Object.create(Phaser.Sprite.prototype);

Darwinator.Entity.prototype.update = function() {};

Darwinator.Entity.prototype.updateAttributes = function() {
  this.health         = !!health ? health + this.attributes.strength : 50;
  this.damage         = 5  + this.attributes.strength / 3;
  this.speed          = 75 + this.attributes.agility*1 - this.attributes.strength / 8;
  this.stamina        = 50 + this.attributes.agility*2 - this.attributes.strength / 5;
  this.aim            = this.attributes.intellect; //Intended to define how well the enemy aims. 0 = "shitty" aim, 100 = "perfect" aim
  this.criticalStrike = this.attributes.intellect / 100; //Critical strike percentage
  this.currBreath     = this.stamina;
};

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