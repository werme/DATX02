'use strict';

Darwinator.Enemy = function(game, target, x, y, health, strength, agility, intellect) {
  if (strength > intellect && strength > agility) {
    this.category = 'enemy_strength';
  } else if (agility > intellect && agility > strength) {
    this.category = 'enemy_agility';
  } else if (intellect > strength && intellect > agility) {
    this.category = 'enemy_intellect';
  } else {
    this.category = 'enemy';
  }
  Darwinator.Entity.call(this, game, x, y, this.category,/* [],*/ health, strength, agility, intellect);

  this.scale.setTo(0.25,0.25);
  this.target = target;
  if(!target)
    console.log('Enemy: target is falsey');
  this.path = [];
  this.attacking = false;
  this.time = null;
  this.overlap = null;
  this.debug = true;
  //Allow enemy to overlap objects, i.e. reduce the hitbox
  //this.body.setRectangle(20*4, 16*4, 0, 16*4);
  this.lastPathUpdate = 0;
  // score properties to measure success
  this.dateOfBirthMs = Date.now();
  this.timeSurvivedMs = undefined; //set this to dateOfBirthMs - Date.now() on death OR end of game round
  this.damageDone = 0;
};

Darwinator.Enemy.prototype = Object.create(Darwinator.Entity.prototype);

Darwinator.Enemy.prototype.arm = function(weapon) {
  this.weapon = weapon;
};

Darwinator.Enemy.prototype.update = function() {
  if (!this.alive) {
    return;
  }
  this.body.velocity.setTo(0,0);
  var currTile = Darwinator.Helpers.pixelsToTile(this.body.x, this.body.y);
  var targetTile = Darwinator.Helpers.pixelsToTile(this.target.body.x, this.target.body.y);

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
  case 'enemy':
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
    } else {
      this.game.physics.arcade.moveToXY(this, this.target.body.x, this.target.body.y, this.speed);
    }
    break;
  }

  // Target (ie. player) takes damage while the target and enemy overlap.
  // If they continuously overlap the target will take damage every 0.25 seconds
  this.overlap = this.game.physics.arcade.overlap(this, this.target);

  if (this.overlap && !this.attacking){
    var crit = Math.random() - this.criticalStrike;
    if (crit < 0){
      this.damageDone += this.damage*2;
      this.target.takeDamage(this.damage*2);
      console.log('%c Enemy made a critical hit! ', 'background: red; color: white');
    } else {
      this.damageDone += this.damage;
      this.target.takeDamage(this.damage);
    }
    this.time = this.game.time.time;
    this.attacking = true;
  } else if (!this.overlap || ((this.game.time.time - this.time) > 250)) {
    this.attacking = false;
  }

  if (this.health <= 0 && this.alive){
    console.log('%c Enemy killed by player! ', 'background: black; color: orange');
    this.kill();
  }

};

Darwinator.Enemy.prototype.updatePath = function() {
  var currTile = Darwinator.Helpers.pixelsToTile(this.body.x, this.body.y);
  var targetTile = Darwinator.Helpers.pixelsToTile(this.target.body.x, this.target.body.y);
  Darwinator.Pathfinder.findPath(currTile.x, currTile.y, targetTile.x, targetTile.y, function(path){
    this.path = !!path ? path : [];
  }.bind(this));
  Darwinator.Pathfinder.calculate();
  this.lastPathUpdate = 0;
};

Darwinator.Enemy.prototype.followPath = function() {
  var targetPos = Darwinator.Helpers.tileToPixels(this.path[1].x, this.path[1].y);
  targetPos.x = Math.round(targetPos.x - this.body.width / 2);
  targetPos.y = Math.round(targetPos.y - this.body.height / 2);
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
