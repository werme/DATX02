'use strict';

Darwinator.Player = function(game, x, y, cursors, health, strength, agility, intellect) {
  var anims = [['walk-left', [8,9,10,11], 10, true], ['walk-right', [12,13,14,15], 10, true],
               ['walk-up', [0,1,2,3], 10, true], ['walk-down', [4,5,6,7], 10, true]];
  Darwinator.Entity.call(this, game, x, y, 'player', anims, health, strength, agility, intellect);
  this.cursors = cursors;
  this.scale.setTo(0.25,0.25);
  this.anchor.setTo(0.5, 0.5);
  this.body.maxVelocity.setTo(50, 50);
  this.initKeys(game);
  this.weapon = null;
  this.lastKey = null;
  this.dashTimer = null;
  this.direction = 0;

  /* 
      Notes until later: 
      each body can setCircle, Rectangle or Polygon. 
      Check the phaser.js on line ~41837
  */
  this.body.setRectangle(12, 4, 2, 12);
};
Darwinator.Player.prototype = Object.create(Darwinator.Entity.prototype);

Darwinator.Player.prototype.update = function() {
  this.body.velocity.setTo(0,0);
  var dir = [0,0];
  var moving = false;
  this.direction = 0;  

  if(this.weapon !== null){
    this.weapon.updateManually(this.x, this.y);
  }

  if (this.cursors.left.isDown || this.leftKey.isDown) {
    if ((this.lastKey === this.cursors.left || this.lastKey === this.leftKey) 
          && (this.game.time.time - this.dashTimer) < 250) {
      this.body.velocity.x = -1250;
    }
    dir[0] = -1;
    moving = true;
  } else if (this.cursors.right.isDown || this.rightKey.isDown) {
    if ((this.lastKey === this.cursors.right || this.lastKey === this.rightKey) 
          && (this.game.time.time - this.dashTimer) < 250) {
      this.body.velocity.x = 1250;
    }
    dir[0] = 1;
    moving = true;
  }
  if (this.cursors.up.isDown || this.upKey.isDown) {
    if (this.topLeft.y <= 0 || this.topRight.y <= 0){
      this.body.velocity.y = 0;
    } else if ((this.lastKey === this.cursors.up || this.lastKey === this.upKey) 
                  && (this.game.time.time - this.dashTimer) < 250) {
      this.body.velocity.y = -1250;
    }
    dir[1] = 1;
    moving = true;
  } else if (this.cursors.down.isDown || this.downKey.isDown) {
    if ((this.lastKey === this.cursors.down || this.lastKey === this.downKey) 
           && (this.game.time.time - this.dashTimer) < 250) {
      this.body.velocity.y = 1250;
    } 
    dir[1] = -1;
    moving = true;
  }

  if(!moving) {
    this.animations.stop();
    this.body.frame = 4;
  } else {
    //Going upwards
    if (dir[1] == 1){
      this.direction = 270;
      this.animations.play('walk-up');
      //Also going right or left
      if(dir[0] == 1){
        this.direction = 315;
      }else if (dir[0] == -1){
        this.direction = 225;
      }
    //Going downwards
    } else if (dir[1] == -1){
      this.direction = 90;
      this.animations.play('walk-down');
      //Also going right or left
      if(dir[0] == 1){
        this.direction = 45;
      }else if (dir[0] == -1){
        this.direction = 135;
      }
      //Going right
    } else if (dir[0] == 1){
      this.direction = 0;
      this.animations.play('walk-right');
      //Going left
    } else if (dir[0] == -1){
      this.direction = 180;
      this.animations.play('walk-left');
    }
    //Set speed and angle
    this.game.physics.velocityFromAngle(this.direction, this.speed, this.body.velocity);
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
};

Darwinator.Player.prototype.initKeys = function(game) {
  this.upKey = game.input.keyboard.addKey(Phaser.Keyboard.W);
  this.leftKey = game.input.keyboard.addKey(Phaser.Keyboard.A);
  this.downKey = game.input.keyboard.addKey(Phaser.Keyboard.S);
  this.rightKey = game.input.keyboard.addKey(Phaser.Keyboard.D);
  this.sprintKey = game.input.keyboard.addKey(Phaser.Keyboard.SHIFT);

  this.upKey.onUp.add(this.lastPressed, this);
  this.leftKey.onUp.add(this.lastPressed, this);
  this.downKey.onUp.add(this.lastPressed, this);
  this.rightKey.onUp.add(this.lastPressed, this);  
};

Darwinator.Player.prototype.lastPressed = function(key) {
  this.lastKey = key;
  this.dashTimer = this.game.time.time;
};