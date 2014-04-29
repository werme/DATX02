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
  Darwinator.Entity.call(this, game, x, y, this.category, health, strength, agility, intellect);

  this.scale.setTo(0.25,0.25);
  this.target = target;
  this.path   = [];
  this.debug  = true;

  this.surviveMode = false;
  this.lastRandomInput = 0;
  this.lastDir = [0,0];

  //Allow enemy to overlap objects, i.e. reduce the hitbox
  //this.body.setRectangle(20*4, 16*4, 0, 16*4);
  this.lastPathUpdate = 0;

  // score properties to measure success
  this.damageDone = 0;

  // melee cooldown
  this.lastMeleeTimestamp = 0;
  this.cooldownMs         = 250;
};

Darwinator.Enemy.prototype = Object.create(Darwinator.Entity.prototype);

// for convenience, categories are represented by image names
Darwinator.Enemy.prototype.categories = {
  INTELLIGENT:  'enemy_intellect',
  AGILE:        'enemy_agility',
  STRONG:       'enemy_strength',
  DEFAULT:      'enemy'
};

Darwinator.Enemy.prototype.update = function() {
  Darwinator.Entity.prototype.update.call(this);
  if (this.dead || this.knockedBack) {
    return;
  }
  if(Darwinator.settings.enemyVsEnemy && (!this.target || this.target.dead)) {
    this.findTarget();
  }

  this.body.velocity.setTo(0,0);

  if (this.surviveMode) {
    var currentTile = Darwinator.Helpers.pixelsToTile(this.body.x, this.body.y);
    var targetTile  = Darwinator.Helpers.pixelsToTile(this.target.body.x, this.target.body.y);
    var distance    = Darwinator.Helpers.calculateDistance(targetTile, currentTile);

    if (distance < 10) {
      this.flee();
    } else {
      if ((Date.now() - this.lastRandomInput) > 750) {
            this.randomInput();
      } else {
          this.body.velocity.x = this.lastDir[0];
          this.body.velocity.y = this.lastDir[1];
          if (this.body.blocked.left || this.body.blocked.right || 
              this.body.blocked.up ||this.body.blocked.down ) {
              this.randomInput();
          }
        }
      }
    } else {
    switch(this.category) {
      case this.categories.INTELLIGENT:
        var currentTile, targetTile, distance, clearView;
        currentTile = Darwinator.Helpers.pixelsToTile(this.body.x, this.body.y);
        targetTile  = Darwinator.Helpers.pixelsToTile(this.target.body.x, this.target.body.y);
        distance    = Darwinator.Helpers.calculateDistance(targetTile, currentTile);
        clearView   = Darwinator.Helpers.clearLineToTarget(this, this.target, this.game);

        if (distance < 6) {
          this.flee();
        } else if (clearView) {
          this.weapon.fire(this.target.body.x, this.target.body.y);
        } else {
          this.doMove();
        }

        break;

      case this.categories.STRONG:
        this.doMove();
        if (this.path.length) {
        this.tryTeleport(undefined, undefined, this.telePos.bind(this));
        }
        break;

      case this.categories.AGILE:
        this.doMove();
      if(this.underAttack) {
        this.tryDodge();
        }
        break;

      default:
        this.doMove();
        break;
    } 
  }

  // TODO make this prettier
  if(this.category !== this.categories.INTELLIGENT){
    this.game.physics.arcade.overlap(this, this.target, this.meleeAttack, null, this);
  }
};

Darwinator.Enemy.prototype.telePos = function() {
  var telRange = Math.min((this.path.length - 1), 5);
  var targetTile = this.path[telRange];
  var target = Darwinator.Helpers.tileToPixels(targetTile.x, targetTile.y);
  var pos = { 
    x: Math.round(target.x - this.body.width  / 2),
    y: Math.round(target.y - this.body.height / 2) };
  return pos;
}

Darwinator.Enemy.prototype.meleeAttack = function(){
  this.damage += this.weapon.strike(this.target);
};

Darwinator.Enemy.prototype.doMove = function() {
  if (this.shouldUpdatePath()) {
    this.updatePath();
  } else {
    this.lastPathUpdate++;
  }
  
  if(!!this.path.length) {
    this.followPath();
  } else {
    this.game.physics.arcade.moveToXY(this, this.target.body.x, this.target.body.y, this.speed);
  }
};

Darwinator.Enemy.prototype.shouldUpdatePath = function() {
  var currTile    = Darwinator.Helpers.pixelsToTile(this.body.x, this.body.y);
  var targetTile  = Darwinator.Helpers.pixelsToTile(this.target.body.x, this.target.body.y);

  if (!this.path.length) {
    return true;
  }
  var newTargetTile  = this.path[this.path.length - 1].x !== targetTile.x || this.path[this.path.length - 1].y !== targetTile.y;
  var newStartTile   = this.path[0].x !== currTile.x || this.path[0].y !== currTile.y;
  var notOnCooldown  = !Darwinator.Helpers.calculateDistance(targetTile, currTile) * 5 < this.lastPathUpdate;

  // Path can only be updated when not on cooldown. Path should only try to update if it doesn't exist, 
  // if target has moved, or if the entity has somehow changed its position.
  return (newTargetTile || newStartTile) && notOnCooldown;
};

Darwinator.Enemy.prototype.updatePath = function() {
  var currTile    = Darwinator.Helpers.pixelsToTile(this.body.x, this.body.y);
  var targetTile  = Darwinator.Helpers.pixelsToTile(this.target.body.x, this.target.body.y);
  this.path = Darwinator.Pathfinder.findPath(currTile, targetTile);
  this.lastPathUpdate = 0;
};

Darwinator.Enemy.prototype.followPath = function() {
  if (!this.path.length) {
    return;
  }

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

Darwinator.Enemy.prototype.flee = function() {
  var angleFromTarget = this.game.physics.arcade.angleBetween(this, this.target) + Math.PI;
  this.game.physics.arcade.velocityFromRotation(angleFromTarget, this.speed, this.body.velocity);
};

Darwinator.Enemy.prototype.findTarget = function() {
  var enemyTeam = this.team === 1 ? this.game.team2 : this.game.team1;
  var counter = 100;

  if (enemyTeam.nrAlive === 0) {
    return;
  }
  while((!this.target || this.target.dead) && counter) {
    this.target = enemyTeam[Math.floor(Math.random() * enemyTeam.length)];
    counter--;
  }
};

Darwinator.Enemy.prototype.randomInput = function () {
  this.lastRandomInput = Date.now();
  var rand = Math.random();
  if (rand < 0.25) {
      //Moving left
      this.body.velocity.x = -this.speed;
  } else if (rand < 0.5) {
      //Moving right
      this.body.velocity.x = this.speed;
  } else if (rand < 0.75) {
      //Moving up
      this.body.velocity.y = this.speed;
  } else {
      //Moving down
      this.body.velocity.y = -this.speed;
  }
  this.lastDir[0] = this.body.velocity.x;
  this.lastDir[1] = this.body.velocity.y;
};