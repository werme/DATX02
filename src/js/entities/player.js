'use strict';

Darwinator.Player = function(game, x, y, cursors, health, strength, agility, intellect) {
  var anims = [['walk-left', [8,9,10,11], 10, true], ['walk-right', [12,13,14,15], 10, true],
               ['walk-up', [0,1,2,3], 10, true], ['walk-down', [4,5,6,7], 10, true]];
  Darwinator.Entity.call(this, game, x, y, 'player', anims, health, strength, agility, intellect);
  this.cursors = cursors;
  this.scale.setTo(0.25,0.25);
  this.anchor.setTo(0.5, 0.5);
  this.initKeys(game);
  this.weapon = null;
  this.lastKey = null;
  this.dashTimer = null;

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

  if(this.weapon !== null){
    this.weapon.updateManually(this.x, this.y);
  }

  if (this.cursors.left.isDown || this.leftKey.isDown) {
//  console.log("this time :" + this.game.time.time + " dash time: " + this.dashTimer);
    if ((this.lastKey === this.cursors.left || this.lastKey === this.leftKey) && (this.game.time.time - this.dashTimer) < 250) {
      this.body.velocity.x = -2000;
    } else {
      this.body.velocity.x = -this.speed;
    }
    dir[0] = -1;
    moving = true;
  } else if (this.cursors.right.isDown || this.rightKey.isDown) {
    this.body.velocity.x = this.speed;
    dir[0] = 1;
    moving = true;
  }
  if (this.cursors.up.isDown || this.upKey.isDown) {
    if (this.topLeft.y <= 0){
      this.body.velocity.y = 0;
    } else {
      this.body.velocity.y = -this.speed;
    }
    dir[1] = 1;
    moving = true;
  } else if (this.cursors.down.isDown || this.downKey.isDown) {
    this.body.velocity.y = this.speed;
    dir[1] = -1;
    moving = true;
  }

  /*if (this.cursors.left.onUp || this.leftKey.onUp) {
    console.log(this.leftKey);
    this.lastKey = "left";
    this.dashTimer = this.game.time.time;
  } else if (this.cursors.right.onUp || this.rightKey.onUp) {
    this.lastKey = "right";
    this.dashTimer = time.game.time.time;
  } else if (this.cursors.down.onUp || this.downKey.onUp) {
    this.lastKey = "down";
    this.dashTimer = time.game.time.time;
  } else if (this.cursors.up.onUp || this.upKey.onUp) {
    this.lastKey = "right";
    this.dashTimer = time.game.time.time;
  }*/

  if(!moving) {
    this.animations.stop();
    this.body.frame = 4;
  } else {
    // Moving up or down - higher priority than left/right for animations
    if (dir[1] == -1) {
      this.animations.play('walk-down');
    } else if (dir[1] == 1) {
      this.animations.play('walk-up');
    } else if (dir[0] == -1) {
      this.animations.play('walk-left');
    } else {
      this.animations.play('walk-right');
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
};

Darwinator.Player.prototype.initKeys = function(game) {
  this.upKey = game.input.keyboard.addKey(Phaser.Keyboard.W);
  this.leftKey = game.input.keyboard.addKey(Phaser.Keyboard.A);
  this.downKey = game.input.keyboard.addKey(Phaser.Keyboard.S);
  this.rightKey = game.input.keyboard.addKey(Phaser.Keyboard.D);
  this.sprintKey = game.input.keyboard.addKey(Phaser.Keyboard.SHIFT);

  this.upKey.onUp.add(this.lastPressed);
  this.leftKey.onUp.add(this.lastPressed);
  this.downKey.onUp.add(this.lastPressed);
  this.rightKey.onUp.add(this.lastPressed);  
};

Darwinator.Player.prototype.lastPressed = function(key) {
  
};