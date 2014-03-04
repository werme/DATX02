'use strict';

Darwinator.Player = function(game, x, y, cursors, health, strength, agility) {
  var anims = [['walk-left', [8,9,10,11], 10, true], ['walk-right', [12,13,14,15], 10, true],
               ['walk-up', [0,1,2,3], 10, true], ['walk-down', [4,5,6,7], 10, true]];
  Darwinator.Entity.call(this, game, x, y, 'player', anims, health, strength, agility);
  this.cursors = cursors;
  this.scale.setTo(0.25,0.25);
  this.anchor.setTo(0.5, 0.5);
  this.initKeys(game);

  /* 
      Notes until later: 
      each body can setCircle, Rectangle or Polygon. 
      Check the phaser.js on line ~41837
  */
  this.body.setRectangle(12, 4, 2, 12);
  console.log("speed: " + this.speed);
  console.log("strength: " + this.strength);
};
Darwinator.Player.prototype = Object.create(Darwinator.Entity.prototype);

Darwinator.Player.prototype.update = function() {
  this.body.velocity.setTo(0,0);
  var dir = [0,0];
  var moving = false;
  if (this.cursors.up.isDown || this.upKey.isDown) {
    this.body.velocity.y = -100;
    dir[1] = 1;
    moving = true;
  } else if (this.cursors.down.isDown || this.downKey.isDown) {
    this.body.velocity.y = 100;
    dir[1] = -1;
    moving = true;
  }
  if (this.cursors.left.isDown || this.leftKey.isDown) {
    this.body.velocity.x = -100;
    dir[0] = -1;
    moving = true;
  } else if (this.cursors.right.isDown || this.rightKey.isDown) {
    this.body.velocity.x = 100;
    dir[0] = 1;
    moving = true;
  }
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
  };
