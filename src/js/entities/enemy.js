'use strict';

Darwinator.Enemy = function(game, target, x, y, health, strength, agility, intellect) {

  Darwinator.Entity.call(this, game, x, y, 'enemy', [], health, strength, agility, intellect);
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
  /*if (this.health === 1) {
    console.log("Nu blev det jävligt fel någonstans...");
  }*/
  var currTile = Darwinator.Helpers.pixelsToTile(this.body.x, this.body.y);
  var targetTile = Darwinator.Helpers.pixelsToTile(this.target.body.x, this.target.body.y);

  var pathLength = this.path.length;
  if(!(pathLength &&  this.path[pathLength - 1].x === targetTile[0] &&
                      this.path[pathLength - 1].y === targetTile[1])) {
    if (Darwinator.Helpers.calculateDistance(targetTile, currTile) < this.lastPathUpdate) {
      Darwinator.Pathfinder.findPath(currTile[0], currTile[1], targetTile[0], targetTile[1], function(path){
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
    this.kill();
  }

};

Darwinator.Enemy.prototype.followPath = function() {
  var targetPos = Darwinator.Helpers.tileToPixels(this.path[1].x, this.path[1].y);
  targetPos[0] = Math.round(targetPos[0] - this.body.width / 2);
  targetPos[1] = Math.round(targetPos[1] - this.body.height / 2);
  var distance = Darwinator.Helpers.calculateDistance(targetPos, [this.body.x, this.body.y]);
  if (distance < 2 && this.path.length > 2) {      // Trial and error - modify if need be.
    // Remember, include (x,y,health) in reset, otherwise health will = 1.
    this.reset(targetPos[0], targetPos[1], this.health);
    this.path.splice(0,1); // Remove first tile in path.
    targetPos = Darwinator.Helpers.tileToPixels(this.path[1].x, this.path[1].y);
    targetPos[0] = Math.round(targetPos[0] - this.body.width / 2);
    targetPos[1] = Math.round(targetPos[1] - this.body.height / 2);
  }
  this.game.physics.moveToXY(this, targetPos[0], targetPos[1], this.speed);
  if (this.path.length < 5 && this.currBreath > 1) {
    this.body.velocity.multiply(2,2);
    this.currBreath--;
  } else if (this.currBreath < this.stamina) {
    this.currBreath += 0.2;
  }
};
