'use strict';

Darwinator.Player = function(game, x, y, cursors) {
  Darwinator.Entity.call(this, game, x, y, 'player');
  this.cursors = cursors;
  this.anchor.setTo(0.5, 0.5);
  this.body.maxVelocity.setTo(50, 50);
  this.initKeys(game);
  this.initAnimations();
  this.updateAttributes();

  this.attributes.strength  = Darwinator.PLAYER_BASE_STRENGTH;
  this.attributes.agility   = Darwinator.PLAYER_BASE_AGILITY;
  this.attributes.intellect = Darwinator.PLAYER_BASE_INTELLECT;

  this.weapon      = null;
  this.dashTimer   = null;
  this.direction   = 90;
  this.dashCounter = 0;
  this.sword       = null;
  this.attacking   = false;
}

Darwinator.Player.prototype = Object.create(Darwinator.Entity.prototype);

Darwinator.Player.prototype.update = function () {
  
  if (this.weapon !== null) {
    this.weapon.updateManually(this.x, this.y);
  }

  var addSword = function(player) {
    player.sword = new Phaser.Sprite(player.game, player.x+12, player.y+26, 'sword');
    player.sword.scale.setTo(2,2);
    player.sword.angle = 180;
    player.sword.anchor.setTo(0.5, 0.15);
    player.game.add.existing(player.sword);
  }

  if (this.sword === null) {
    addSword(this);
  }

  var pointer = this.game.input.activePointer;
  if (pointer.isDown){
    this.weapon.fire(pointer.worldX, pointer.worldY);
  }

  /*
   *  If dashing, override manual controls and
   *  just keep the values assigned in dash. Once
   *  dash is completed, return to normal controls.
   */
  if (this.isDashing()) {
    this.dashCounter--;
    // Draw the sword outside the world to prevent it dragging behind player
    this.sword.x = -50;
    this.sword.y = -50;
    this.game.physics.velocityFromAngle(this.direction, this.currentSpeed, this.body.velocity);
  } else {
    this.currentSpeed = this.speed;
    this.body.velocity.setTo(0,0);
    var dir = [0,0];
    var moving = false;

    if (this.cursors.left.isDown || this.leftKey.isDown) {
      dir[0] = -1;
      moving = true;
    } else if (this.cursors.right.isDown || this.rightKey.isDown) {
      dir[0] = 1;
      moving = true;
    }
    if (this.cursors.up.isDown || this.upKey.isDown) {
      if (this.topLeft.y <= 0 || this.topRight.y <= 0) {
        this.body.velocity.y = 0;
      }
      dir[1] = 1;
      moving = true;
    } else if (this.cursors.down.isDown || this.downKey.isDown) {
      dir[1] = -1;
      moving = true;
    }

    if (!moving) {
      this.animations.stop();
      this.body.frame = 4;
      if (this.direction === 0) {
        //Right
        this.sword.x = this.x+22;
        this.sword.y = this.y-2;
      } else if (this.direction === 90 || this.direction === 45 || this.direction === 135) {
        //Down
        this.sword.x = this.x+12;
        this.sword.y = this.y+26;
      } else if (this.direction === 180) {
        //Left
        this.sword.x = this.x-22;
        this.sword.y = this.y-2;
      } else if (this.direction === 270 || this.direction === 225 || this.direction === 315) {
        this.sword.x = this.x-12;
        this.sword.y = this.y-12;
      }
    } else {
      //Going upwards
      if (dir[1] === 1) {
        this.direction = 270;
        this.animations.play('walk-up');
        this.bringToTop();
        this.sword.x = this.x-12;
        this.sword.y = this.y-12;
        this.sword.angle = 0;
        //Also going right or left
        if(dir[0] === 1) {
          this.direction = 315;
        } else if (dir[0] === -1) {
          this.direction = 225;
        }
      //Going downwards
      } else if (dir[1] === -1) {
        this.direction = 90;
        this.animations.play('walk-down');
        this.sword.bringToTop();
        this.sword.x = this.x+12;
        this.sword.y = this.y+26;
        this.sword.angle = 180;
        //Also going right or left
        if (dir[0] === 1) {
          this.direction = 45;
        } else if (dir[0] === -1) {
          this.direction = 135;
        }
        //Going right
      } else if (dir[0] === 1) {
        this.direction = 0;
        this.animations.play('walk-right');
        this.bringToTop();
        this.sword.x = this.x+22;
        this.sword.y = this.y-2;
        this.sword.angle = 60;
        //Going left
      } else if (dir[0] === -1) {
        this.direction = 180;
        this.animations.play('walk-left');
        this.sword.bringToTop();
        this.sword.x = this.x-22;
        this.sword.y = this.y-2;
        this.sword.angle = -60;
      }
      //Set speed and angle
      this.game.physics.velocityFromAngle(this.direction, this.currentSpeed, this.body.velocity);
    }
  }
  if (this.sprintKey.isDown && this.currBreath > 1 && moving) {
    this.body.velocity.multiply(2,2);
    this.currBreath--;
  } else if (this.currBreath < this.stamina) {
    this.currBreath += 0.2;
  }

  if (this.health <= 0) {
    //TODO Set to this.kill();
    this.health = 100;
  }

  if (this.attacking && (this.attackTimer > (this.game.time.time - this.attackTimer + 300))) {
    this.attacking = false;
  }
};

Darwinator.Player.prototype.initKeys = function (game) {

  this.upKey     = game.input.keyboard.addKey(Phaser.Keyboard.W);
  this.leftKey   = game.input.keyboard.addKey(Phaser.Keyboard.A);
  this.downKey   = game.input.keyboard.addKey(Phaser.Keyboard.S);
  this.rightKey  = game.input.keyboard.addKey(Phaser.Keyboard.D);
  this.sprintKey = game.input.keyboard.addKey(Phaser.Keyboard.SHIFT);
  this.slashKey  = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

  var checkTimer = function (key) {
    
    if (!this.isDashing() && !!key.lastReleased && this.game.time.time - key.lastReleased < 200 && this.currBreath > 30) {
      
      this.dashCounter = 10;
      this.currentSpeed = 1000;
      this.currBreath -= 30;

      if (key === this.cursors.left || key === this.leftKey) {
        this.direction = 180;
      } else if (key === this.cursors.right || key === this.rightKey) {
        this.direction = 0;
      } else if (key === this.cursors.up || key === this.upKey) {
        this.direction = 270;
      } else if (key === this.cursors.down || key === this.downKey) {
        this.direction = 90;
      }
    }
  };

  var addTimer = function(key) { 
    key.lastReleased = this.game.time.time;
  };

  var meleeAttack = function(key) {
    if (!this.attacking) {
      this.attacking   = true;
      this.attackTimer = this.game.time.time;
    } 
  };

  this.upKey.onUp.add(addTimer, this);
  this.leftKey.onUp.add(addTimer, this);
  this.downKey.onUp.add(addTimer, this);
  this.rightKey.onUp.add(addTimer, this);
  this.cursors.up.onUp.add(addTimer, this);
  this.cursors.down.onUp.add(addTimer, this);
  this.cursors.right.onUp.add(addTimer, this);
  this.cursors.left.onUp.add(addTimer, this);

  this.upKey.onDown.add(checkTimer, this);
  this.leftKey.onDown.add(checkTimer, this);
  this.downKey.onDown.add(checkTimer, this);
  this.rightKey.onDown.add(checkTimer, this);
  this.cursors.up.onDown.add(checkTimer, this);
  this.cursors.down.onDown.add(checkTimer, this);
  this.cursors.right.onDown.add(checkTimer, this);
  this.cursors.left.onDown.add(checkTimer, this);

  this.slashKey.onDown.add(meleeAttack, this);
};

Darwinator.Entity.prototype.updateAttributes = function () {

  this.health         = Darwinator.PLAYER_BASE_HEALTH  + this.attributes.strength;
  this.damage         = Darwinator.PLAYER_BASE_DAMAGE  + this.attributes.strength;
  this.speed          = Darwinator.PLAYER_BASE_SPEED   + this.attributes.agility * 3 - this.attributes.strength;
  this.stamina        = Darwinator.PLAYER_BASE_STAMINA + this.attributes.agility * 2 - this.attributes.strength / 5;
  this.aim            = this.attributes.intellect; // Intended to define how well the enemy aims. 0 = "shitty" aim, 100 = "perfect" aim
  this.criticalStrike = this.attributes.intellect / 100; // Critical strike percentage
  this.currBreath     = this.stamina;
  this.currentSpeed   = this.speed;

  var red   = 'color: red; font-weight: bold;';
  var green = 'color: #02c;';

  console.log('%c Updated player attributes! ', 'background: #222; color: #dc3');

  console.log('%c\tStrength:  ' + this.attributes.strength,  green);
  console.log('%c\tAgility:   ' + this.attributes.agility,   green);
  console.log('%c\tIntellect: ' + this.attributes.intellect, green);

  console.log('\tHealth:  ' + '%c' + this.health,  red);
  console.log('\tDamage:  ' + '%c' + this.damage,  red);
  console.log('\tSpeed:   ' + '%c' + this.speed,   red);
  console.log('\tStamina: ' + '%c' + this.stamina + '\n', red);
};

Darwinator.Player.prototype.initAnimations = function () {
  var anims = [['walk-left', [8,9,10,11], 10, true], ['walk-right', [12,13,14,15], 10, true],
               ['walk-up', [0,1,2,3], 10, true], ['walk-down', [4,5,6,7], 10, true]];

  this.setAnimations(anims);
};

Darwinator.Player.prototype.isDashing = function () {
  return this.dashCounter > 0;
}
