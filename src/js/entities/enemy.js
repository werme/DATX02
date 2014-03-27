'use strict';

Darwinator.Enemy = function(game, target, x, y, health, strength, agility, intellect) {
  if (strength > intellect && strength > agility) {
    this.category = this.categories.STRONG;
  } else if (agility > intellect && agility > strength) {
    this.category = this.categories.AGILE;
  } else if (intellect > strength && intellect > agility) {
    this.category = this.categories.INTELLIGENT;
  } else {
    this.category = this.categories.DEFAULT;
  }
  Darwinator.Entity.call(this, game, x, y, this.category,/* [],*/ health, strength, agility, intellect);

  this.scale.setTo(0.25,0.25);
  this.target = target;
  this.path   = [];
  this.debug  = true;

  //Allow enemy to overlap objects, i.e. reduce the hitbox
  //this.body.setRectangle(20*4, 16*4, 0, 16*4);
  this.lastPathUpdate = 0;

  // score properties to measure success
  this.damageDone = 0;

  // melee cooldown
  this.lastMeleeTimestamp = 0;
  this.cooldownMs         = 250;

  // reduce fire rate for 'stupid' enemies
  this.fireProbability    = 0.01;
  this.lastFireTimeStamp  = 0;
  this.fireCooldownMs     = 10000;
};

Darwinator.Enemy.prototype = Object.create(Darwinator.Entity.prototype);

// for convenience, categories are represented by image names
Darwinator.Enemy.prototype.categories = {
  INTELLIGENT:  'enemy_intellect',
  AGILE:        'enemy_agility',
  STRONG:       'enemy_strength',
  DEFAULT:      'enemy'
};

Darwinator.Enemy.prototype.arm = function(weapon) {
  this.weapon = weapon;
};

Darwinator.Enemy.prototype.update = function() {
  if (!this.alive) {
    return;
  }
  this.body.velocity.setTo(0,0);
  var currTile    = Darwinator.Helpers.pixelsToTile(this.body.x, this.body.y);
  var targetTile  = Darwinator.Helpers.pixelsToTile(this.target.body.x, this.target.body.y);

  var pathLength = this.path.length;
  if(!(pathLength && this.path[pathLength - 1].x === targetTile.x &&
                     this.path[pathLength - 1].y === targetTile.y &&
                     this.path[0].x === currTile.x &&
                     this.path[0].y === currTile.y)) {
    if (Darwinator.Helpers.calculateDistance(targetTile, currTile) * 5 < this.lastPathUpdate) {
      this.updatePath();
    } else {
      this.lastPathUpdate++;
    }
  }

  switch(this.category) {
  case this.categories.INTELLIGENT:
    if (this.path.length && Darwinator.Helpers.calculateDistance(targetTile, currTile) > 10) {
      this.followPath();
    } else {
      this.weapon.fire(this.target.body.x, this.target.body.y);
    }
    break;
  default:
    /* If a path exists - follow it. Else, try to move in the general direction of the player, ignoring
       obsticles*/
    if (this.path.length) {
      this.followPath();
      var onCooldown = (Date.now() - this.lastFireTimeStamp) < this.fireCooldownMs;
      if (!onCooldown && Math.random() < this.fireProbability) {
        this.weapon.fire(this.target.body.x, this.target.body.y);
        this.lastFireTimeStamp = Date.now();
      }
    } else {
      this.game.physics.arcade.moveToXY(this, this.target.body.x, this.target.body.y, this.speed);
    }
    break;
  }
  // Target (ie. player) takes damage while the target and enemy overlap.
  // If they continuously overlap the target will take damage every 0.25 seconds
  this.game.physics.arcade.overlap(this, this.target, this.meleeAttack, null, this);

  if (this.health <= 0 && this.alive){
    console.log('%c Enemy killed by player! ', 'background: black; color: orange');
    this.kill();
  }

};

Darwinator.Enemy.prototype.meleeAttack = function(){ //callback for overlapping with target
  var onCooldown = (Date.now() - this.lastMeleeTimestamp) < this.cooldownMs;
  if (!onCooldown){
    var crit  = Math.random() - this.criticalStrike;
    var dmg   = this.damage;

    if (crit < 0){
      dmg *= 2;
      console.log('%c Enemy made a critical hit! ', 'background: red; color: white');
    }
    this.target.takeDamage(dmg);
    this.damageDone += dmg;
    this.lastMeleeTimestamp = Date.now();
  }
};

Darwinator.Enemy.prototype.updatePath = function() {
  var currTile    = Darwinator.Helpers.pixelsToTile(this.body.x, this.body.y);
  var targetTile  = Darwinator.Helpers.pixelsToTile(this.target.body.x, this.target.body.y);
  this.path = Darwinator.Pathfinder.findPath(currTile, targetTile);
  this.lastPathUpdate = 0;
};

Darwinator.Enemy.prototype.followPath = function() {
  var targetPos = Darwinator.Helpers.tileToPixels(this.path[1].x, this.path[1].y);
  targetPos.x   = Math.round(targetPos.x - this.body.width / 2);
  targetPos.y   = Math.round(targetPos.y - this.body.height / 2);

  var distance = Darwinator.Helpers.calculateDistance(targetPos, [this.body.x, this.body.y]);
  if (distance < 4 && this.path.length > 2) {      // Trial and error - modify if need be.
    // Remember, include (x,y,health) in reset, otherwise health will = 1.
    this.reset(targetPos.x, targetPos.y, this.health);
    this.path.splice(0,1); // Remove first tile in path.
    this.updatePath();
  } else {
    this.game.physics.arcade.moveToXY(this, targetPos.x, targetPos.y, this.speed);
  }
  if (this.path.length < 5 && this.currBreath > 1) {
    this.body.velocity.multiply(2,2);
    this.currBreath--;
  } else if (this.currBreath < this.stamina) {
    this.currBreath += 0.2;
  }
};
