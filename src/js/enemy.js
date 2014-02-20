
function Enemy(game, x, y, health) {
  Phaser.Sprite.call(this, game, x, y, 'enemy');
  this.game   = game;
  this.health = health;
}

Enemy.prototype = Object.create(Phaser.Sprite.prototype);

Enemy.prototype.update = function() {

}