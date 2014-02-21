(function() {
  'use strict';

  function Player(game, x, y, health, cursors) {
    Phaser.Sprite.call(this, game, x, y, 'player');
    this.cursors = cursors;
    this.scale.setTo(0.25,0.25);
    this.game   = game;
    this.health = health;
    this.anchor.setTo(0.5, 0.5);
    this.animations.add('walk-left', [8,9,10,11], 10, true);
    this.animations.add('walk-right', [12,13,14,15], 10, true);
    this.animations.add('walk-up', [0,1,2,3], 10, true);
    this.animations.add('walk-down', [4,5,6,7], 10, true);
    this.body.collideWorldBounds = true;
  }

  Player.prototype = Object.create(Phaser.Sprite.prototype);

  Player.prototype.update = function() {
    this.body.velocity.setTo(0,0);
     if (this.cursors.up.isDown) {
        this.body.velocity.y = -100;
        this.animations.play('walk-up');
      } 
      if (this.cursors.left.isDown) {
        this.body.velocity.x = -100;
        this.animations.play('walk-left');
      }
      if (this.cursors.right.isDown) {
        this.body.velocity.x = 100;
        this.animations.play('walk-right');
      }
      if (this.cursors.down.isDown) {
        this.body.velocity.y = 100;
        this.animations.play('walk-down');
      }
  }

  window.Darwinator = window.Darwinator || {};
  window.Darwinator.Player = Player;

}());