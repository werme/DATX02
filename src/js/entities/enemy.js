'use strict';

Darwinator.Enemy = function(game, target, x, y, health, strength, agility, intellect) {

  if (strength > intellect && strength > agility) {
    Darwinator.Entity.call(this, game, x, y, 'enemy_strength', [], health, strength, agility, intellect);
  } else if (agility > intellect && agility > strength) {
    Darwinator.Entity.call(this, game, x, y, 'enemy_agility', [], health, strength, agility, intellect);
  } else if (intellect > strength && intellect > agility) {
    Darwinator.Entity.call(this, game, x, y, 'enemy_intellect', [], health, strength, agility, intellect);
  } else {
    Darwinator.Entity.call(this, game, x, y, 'enemy', [], health, strength, agility, intellect);
  }
  this.scale.setTo(0.25,0.25);
  this.target = target;
  this.path = [];
  this.attacking = false;
  this.time = null;
  this.overlap = null;
  this.debug = true;
  //Allow enemy to overlap objects, i.e. reduce the hitbox
  //this.body.setRectangle(20*4, 16*4, 0, 16*4);
  this.lastPathUpdate = 0;
};

Darwinator.Enemy.prototype = Object.create(Darwinator.Entity.prototype);

Darwinator.Enemy.prototype.update = function() {
  var currTile = Darwinator.Helpers.pixelsToTile(this.body.x, this.body.y);
  var targetTile = Darwinator.Helpers.pixelsToTile(this.target.body.x, this.target.body.y);

  var pathLength = this.path.length;
  if(!(pathLength &&  this.path[pathLength - 1].x === targetTile.x &&
                      this.path[pathLength - 1].y === targetTile.y)) {
    if (Darwinator.Helpers.calculateDistance(targetTile, currTile) * 5 < this.lastPathUpdate) {
      Darwinator.Pathfinder.findPath(currTile.x, currTile.y, targetTile.x, targetTile.y, function(path){
        this.path = !!path ? path : [];
      }.bind(this));
      Darwinator.Pathfinder.calculate();
      this.lastPathUpdate = 0;
    } else {
      this.lastPathUpdate++;
    }
  }

  /* If a path exists - follow it. Else, try to move in the general direction of the player, ignoring
     obsticles*/
  if (this.path.length) {
    this.followPath();
  } else {
    this.game.physics.moveToXY(this, this.target.body.x, this.target.body.y, this.speed);
  }

  // Target (ie. player) takes damage while the target and enemy overlap.
  // If they continuously overlap the target will take damage every 0.25 seconds
  this.overlap = this.game.physics.overlap(this, this.target);

  if (this.overlap && !this.attacking){
    var crit = Math.random() - this.criticalStrike;
    if (crit < 0){
      this.target.takeDamage(this.damage*2);
      console.log('CRIT!');
    } else {
      this.target.takeDamage(this.damage);
    }
    this.time = this.game.time.time;
    this.attacking = true;
  } else if (!this.overlap || ((this.game.time.time - this.time) > 250)) {
    this.attacking = false;
  }

  if (this.health <= 0){
    console.log('died');
    this.destroy();
  }

};

Darwinator.Enemy.prototype.followPath = function() {
  var targetPos = Darwinator.Helpers.tileToPixels(this.path[1].x, this.path[1].y);
  targetPos.x = Math.round(targetPos.x - this.body.width / 2);
  targetPos.y = Math.round(targetPos.y - this.body.height / 2);
  var distance = Darwinator.Helpers.calculateDistance(targetPos, [this.body.x, this.body.y]);
  if (distance < 2 && this.path.length > 2) {      // Trial and error - modify if need be.
    // Remember, include (x,y,health) in reset, otherwise health will = 1.
    this.reset(targetPos.x, targetPos.y, this.health);
    this.path.splice(0,1); // Remove first tile in path.
    targetPos = Darwinator.Helpers.tileToPixels(this.path[1].x, this.path[1].y);
    targetPos.x = Math.round(targetPos.x - this.body.width / 2);
    targetPos.y = Math.round(targetPos.y - this.body.height / 2);
  }
  this.game.physics.moveToXY(this, targetPos.x, targetPos.y, this.speed);
  if (this.path.length < 5 && this.currBreath > 1) {
    this.body.velocity.multiply(2,2);
    this.currBreath--;
  } else if (this.currBreath < this.stamina) {
    this.currBreath += 0.2;
  }
};
