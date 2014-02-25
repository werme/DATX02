(function() {
  'use strict';

  function Enemy(game, target, x, y, health) {
    Phaser.Sprite.call(this, game, x, y, 'enemy');
    this.scale.setTo(0.25,0.25);
    this.game   = game;
    this.health = health;
    this.body.collideWorldBounds = true;
    this.target = target;
    this.path = null;
    this.stamina = 50;
    this.currBreath = this.stamina;
  }

  Enemy.prototype = Object.create(Phaser.Sprite.prototype);

  Enemy.prototype.setPath = function(path) {
    console.log(path);
    this.path = path;
  };

  Enemy.prototype.update = function() {
    var currTile = window.Darwinator.Helpers.pixelsToTile(this.body.x, this.body.y);
    var targetTile = window.Darwinator.Helpers.pixelsToTile(this.target.body.x, this.target.body.y);

    window.Darwinator.Pathfinder.findPath(currTile[0], currTile[1], targetTile[0], targetTile[1], function(path){
      this.path = path;
    }.bind(this));
    window.Darwinator.Pathfinder.calculate();

    if(this.path !== null) {
      var targetPos = window.Darwinator.Helpers.tileToPixels(this.path[1].x, this.path[1].y);
      this.game.physics.moveToXY(this, targetPos[0], targetPos[1], 100);
      if(this.path.length < 3 && this.currBreath > 1) {
        this.body.velocity.multiply(2,2);
        this.currBreath--;
      } else if (this.currBreath < this.stamina) {
        this.currBreath += 0.2;
      }
    };


  };

  window.Darwinator = window.Darwinator || {};
  window.Darwinator.Enemy = Enemy;

}());