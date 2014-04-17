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

  game.physics.enable(this, Phaser.Physics.ARCADE);

  this.game                     = game;
  this.body.collideWorldBounds  = true;

  this.attributes = {
    strength  : !!strength  ? strength  : 0,
    agility   : !!agility   ? agility   : 0,
    intellect : !!intellect ? intellect : 0
  }

  var baseHealth = !!health ? health : Darwinator.ENTITY_BASE_HEALTH;

  this.health         = baseHealth + this.attributes.strength;
  this.damage         = Darwinator.ENTITY_BASE_DAMAGE  + this.attributes.strength / 3;
  this.speed          = Darwinator.ENTITY_BASE_SPEED   + this.attributes.agility;
  this.stamina        = Darwinator.ENTITY_BASE_STAMINA + this.attributes.agility * 2;
  this.aim            = this.attributes.intellect; // Intended to define how well the enemy aims. 0 = "shitty" aim, 100 = "perfect" aim
  this.criticalStrike = this.attributes.intellect / 100; // Critical strike percentage
  this.currBreath     = this.stamina;
  
  this.abilityCooldownMs  = Darwinator.ENTITY_ABILITY_COOLDOWN;
  this.lastAbilityUse     = 0;

  this.dodging              = false;
  this.dodgeDurationSeconds = 2;
  this.dodgeTimer           = null;
  this.underAttack          = false;

  // the alive property of Phaser sprites seems to be bugged
  this.dead = false;
};

Darwinator.Entity.prototype = Object.create(Phaser.Sprite.prototype);

Darwinator.Entity.prototype.update = function() {
  if (this.health <= 0 && !this.dead){
    this.kill();
    this.dead = true;
  }
};

Darwinator.Entity.prototype.takeDamage = function(amount) {
  this.health = this.health - amount;
  this.underAttack = true;
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

/**
* Attempt to dodge bullets for this.dodgeDurationSeconds seconds. Does nothing if abilities are on cooldown.
* 
* @method Darwinator.Entity#tryDodge
*/
Darwinator.Entity.prototype.tryDodge = function() {
  if((Date.now() - this.lastAbilityUse) >= this.abilityCooldownMs){
    this.dodging = true;
    this.underAttack = false;
    this.alpha = 0.5;
    this.lastAbilityUse = Date.now();
    var dodgeCallback = function() {this.dodging = false; this.alpha = 1; };
    this.dodgeTimer = this.game.time.events.add(Phaser.Timer.SECOND * this.dodgeDurationSeconds, dodgeCallback, this);
  }
};

/**
* Attempt to teleport the entity to a given position. Does nothing if abilities are on cooldown.
* 
* @param {Number}     - [x] The x-coordinate. Optional if a function is given.
* @param {Number}     - [y] The y-coordinate. Optional if a function is given.
* @param {Function}   - [posFunction] Optional. A function returning an object with x and y properties.
* @method Darwinator.Entity#tryTeleport
*/
Darwinator.Entity.prototype.tryTeleport = function(x, y, posFunction) {
  if((Date.now() - this.lastAbilityUse) >= this.abilityCooldownMs){
    if(posFunction){
      var pos = posFunction();
      x = pos.x;
      y = pos.y;
    }
    this.reset(x, y, this.health);
    this.lastAbilityUse = Date.now();
  }
};

/**
* Resets ability effects as well as the ability cooldown.
*
* @method Darwinator.Entity#resetAbilities
*/
Darwinator.Entity.prototype.resetAbilities = function(){
  this.lastAbilityUse = 0;

  this.game.time.events.remove(this.dodgeTimer);
  this.alpha        = 1;
  this.dodging      = false;
  this.underAttack  = false;
};
