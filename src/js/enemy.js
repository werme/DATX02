(function() {
  "use strict";

  function Enemy(game, x, y, health) {
    Phaser.Sprite.call(this, game, x, y, 'enemy');
    this.scale.setTo(0.25,0.25);
    this.game   = game;
    this.health = health;
  }

  Enemy.prototype = Object.create(Phaser.Sprite.prototype);

  Enemy.prototype.update = function() {

  }

  window.Darwinator = window.Darwinator || {};
  window.Darwinator.Enemy = Enemy;

}());