'use strict';

Darwinator.Player = function(game, x, y, cursors, health, strength, agility, intellect) {
  Darwinator.Entity.call(this, game, x, y, 'player', health, strength, agility, intellect);

  this.cursors = cursors;
  // this.scale.setTo(2,2);
  this.anchor.setTo(0.5, 0.5);
  this.body.maxVelocity.setTo(50, 50);
  this.initKeys(game);
  this.initAnimations();

  this.weapon        = null;
  this.dashTimer     = null;
  this.direction     = 90;
  this.orgSpeed      = this.speed;
  this.dashCounter   = 0;
  this.sword         = null;
  this.attacking     = false;
  this.attackTimer   = null;

  this.body.setRectangle(12, 4, 2, 12);
};
Darwinator.Player.prototype = Object.create(Darwinator.Entity.prototype);

Darwinator.Player.prototype.update = function() {
  if(this.weapon !== null){
    this.weapon.updateManually(this.x, this.y);
  }

  var addSword = function(player) {
    player.sword = new Phaser.Sprite(player.game, player.x+12, player.y+26, 'sword');
    player.sword.scale.setTo(2,2);
    player.sword.angle = 180;
    player.sword.anchor.setTo(0.5, 0.15);
    player.game.add.existing(player.sword);
  }

  if (this.sword === null){
    addSword(this);
  }

  /*
      If dashing, override manual controls and
      just keep the values assigned in dash. Once
      dash is completed, return to normal controls.
  */
  if (!!this.dashCounter) {
    this.dashCounter--;
    //Draw the sword outside the world to prevent it dragging behind player
    this.sword.x = -50;
    this.sword.y = -50;
    this.game.physics.velocityFromAngle(this.direction, this.speed, this.body.velocity);
  } else {
      this.speed = this.orgSpeed;
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
      if (this.topLeft.y <= 0 || this.topRight.y <= 0){
        this.body.velocity.y = 0;
      }
      dir[1] = 1;
      moving = true;
    } else if (this.cursors.down.isDown || this.downKey.isDown) {
      dir[1] = -1;
      moving = true;
    }

    if(!moving) {
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
      if (dir[1] === 1){
        this.direction = 270;
        this.animations.play('walk-up');
        this.bringToTop();
        this.sword.x = this.x-12;
        this.sword.y = this.y-12;
        this.sword.angle = 0;
        //Also going right or left
        if(dir[0] === 1){
          this.direction = 315;
        }else if (dir[0] === -1){
          this.direction = 225;
        }
      //Going downwards
      } else if (dir[1] === -1){
        this.direction = 90;
        this.animations.play('walk-down');
        this.sword.bringToTop();
        this.sword.x = this.x+12;
        this.sword.y = this.y+26;
        this.sword.angle = 180;
        //Also going right or left
        if(dir[0] === 1){
          this.direction = 45;
        }else if (dir[0] === -1){
          this.direction = 135;
        }
        //Going right
      } else if (dir[0] === 1){
        this.direction = 0;
        this.animations.play('walk-right');
        this.bringToTop();
        this.sword.x = this.x+22;
        this.sword.y = this.y-2;
        this.sword.angle = 60;
        //Going left
      } else if (dir[0] === -1){
        this.direction = 180;
        this.animations.play('walk-left');
        this.sword.bringToTop();
        this.sword.x = this.x-22;
        this.sword.y = this.y-2;
        this.sword.angle = -60;
      }
      //Set speed and angle
      this.game.physics.velocityFromAngle(this.direction, this.speed, this.body.velocity);
    }
  }
  if(this.sprintKey.isDown && this.currBreath > 1 && moving) {
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
       console.log("Attacking: false");
  }
};

Darwinator.Player.prototype.initKeys = function(game) {
  this.upKey = game.input.keyboard.addKey(Phaser.Keyboard.W);
  this.leftKey = game.input.keyboard.addKey(Phaser.Keyboard.A);
  this.downKey = game.input.keyboard.addKey(Phaser.Keyboard.S);
  this.rightKey = game.input.keyboard.addKey(Phaser.Keyboard.D);
  this.sprintKey = game.input.keyboard.addKey(Phaser.Keyboard.SHIFT);
  this.slashKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

  var checkTimer = function(key) {
    if (!!key.lastReleased && this.game.time.time - key.lastReleased < 200 && this.currBreath > 30) {
      this.dashCounter = 10;
      this.speed = 1000;
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

  var addTimer = function(key) {key.lastReleased = this.game.time.time;};

  var meleeAttack = function(key) {
    if (!this.attacking) {
      this.attacking = true;
      console.log("Attacking: true");
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

Darwinator.Player.prototype.initAnimations = function() {
  var anims = [['walk-left', [8,9,10,11], 10, true], ['walk-right', [12,13,14,15], 10, true],
               ['walk-up', [0,1,2,3], 10, true], ['walk-down', [4,5,6,7], 10, true]];

  this.setAnimations(anims);
};
