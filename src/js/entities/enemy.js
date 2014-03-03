'use strict';

Darwinator.Enemy = function(game, target, x, y, health) {
  Darwinator.Entity.call(this, game, x, y, health, 'enemy');
  this.scale.setTo(0.25,0.25);
  this.target = target;
  this.path = null;
  this.speed = 75;
  this.damage = 5;
  this.attacking = false;
  this.time = null;
  this.overlap = null;
  this.debug = true;
  //Allow enemy to overlap objects, i.e. reduce the hitbox
  this.body.setRectangle(20*4, 16*4, 0, 16*4); 
};

Darwinator.Enemy.prototype = Object.create(Darwinator.Entity.prototype);

Darwinator.Enemy.prototype.update = function() {
  var currTile = Darwinator.Helpers.pixelsToTile(this.body.x, this.body.y);

  // Changed the y target tile to be not freak out when player now overlaps with objects.
  var targetTile = Darwinator.Helpers.pixelsToTile(this.target.body.x, this.target.body.y + 28);
  Darwinator.Pathfinder.findPath(currTile[0], currTile[1], targetTile[0], targetTile[1], function(path){
    this.path = path;
  }.bind(this));
  Darwinator.Pathfinder.calculate();

  if (this.path !== null) {
    var targetPos = Darwinator.Helpers.tileToPixels(this.path[1].x, this.path[1].y);
    this.game.physics.moveToXY(this, targetPos[0], targetPos[1], this.speed);
    if (this.path.length < 3 && this.currBreath > 1) {
      this.body.velocity.multiply(2,2);
      this.currBreath--;
    } else if (this.currBreath < this.stamina) {
      this.currBreath += 0.2;
    }
  }

  // Target (ie. player) takes damage while the target and enemy overlap.
  // If they continuously overlap the target will take damage every 0.25 seconds
  this.overlap = this.game.physics.overlap(this, this.target);
  if (this.overlap && !this.attacking){
    this.target.takeDamage(this.damage);
    this.time = this.game.time.time;
    this.attacking = true;
  } else if (!this.overlap || ((this.game.time.time - this.time) > 250)) {
    this.attacking = false;
  }
};
