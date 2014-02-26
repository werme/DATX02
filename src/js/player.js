'use strict';

Darwinator.Player = function(game, x, y, health, cursors) {
  Phaser.Sprite.call(this, game, x, y, 'player');
  this.cursors = cursors;
  this.sprintKey = game.input.keyboard.addKey(Phaser.Keyboard.SHIFT);
  this.scale.setTo(0.25,0.25);
  this.game   = game;
  this.health = health;
  this.anchor.setTo(0.5, 0.5);
  this.animations.add('walk-left', [8,9,10,11], 10, true);
  this.animations.add('walk-right', [12,13,14,15], 10, true);
  this.animations.add('walk-up', [0,1,2,3], 10, true);
  this.animations.add('walk-down', [4,5,6,7], 10, true);
  this.body.collideWorldBounds = true;
  this.stamina = 50;
  this.currBreath = this.stamina;
};

Darwinator.Player.prototype = Object.create(Phaser.Sprite.prototype);

Darwinator.Player.prototype.update = function() {
  this.body.velocity.setTo(0,0);
  var moving = true;
  if (this.cursors.up.isDown) {
    this.body.velocity.y = -100;
    this.animations.play('walk-up');
  } else if (this.cursors.left.isDown) {
    this.body.velocity.x = -100;
    this.animations.play('walk-left');
  } else if (this.cursors.right.isDown) {
    this.body.velocity.x = 100;
    this.animations.play('walk-right');
  } else if (this.cursors.down.isDown) {
    this.body.velocity.y = 100;
    this.animations.play('walk-down');
  } else {
    this.animations.stop();
    this.body.frame = 4;
    moving = false;
  }

  if(this.sprintKey.isDown && this.currBreath > 1 && moving) {
    this.body.velocity.multiply(2,2);
    this.currBreath--;
  } else if (this.currBreath < this.stamina) {
    this.currBreath += 0.2;
  }

  if (this.health === 0){
    //TODO Set to this.kill();
    this.health = 100;
  }
};

Darwinator.Player.prototype.takeDamage = function(amount) {
  this.health = this.health - amount;
};
