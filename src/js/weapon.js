(function() {
  'use strict';

  function Weapon(game, x, y, coolDown, speed, imgName, bullets, damage) {
    Phaser.Sprite.call(this, game, x, y, imgName);
    this.anchor.setTo(0.5, 0.5);
    this.scale.setTo(0.2, 0.2);
    this.body.collideWorldBounds = true;
    this.coolDown = coolDown;
    this.nextFire = 0;
    this.bullets  = bullets;
    this.speed    = speed;
    this.damage   = damage;
  }

  Weapon.prototype = Object.create(Phaser.Sprite.prototype);

  Weapon.prototype.update = function() {
    this.rotation = this.game.physics.angleToPointer(this);
    if (this.game.input.activePointer.isDown){
      this.fire();
    }
  };

  Weapon.prototype.fire = function(){
    if (this.game.time.now > this.nextFire && this.bullets.countDead() > 0){
        this.nextFire = this.game.time.now + this.coolDown;
        var bullet    = this.bullets.getFirstDead();
        this.resetBullet(bullet);
    }
  };

  Weapon.prototype.resetBullet = function(bullet){
    bullet.reset(this.x, this.y); // resets sprite and body
    bullet.rotation = this.game.physics.moveToPointer(bullet, this.speed);
  };

  window.Darwinator = window.Darwinator || {};
  window.Darwinator.Weapon = Weapon;

}());