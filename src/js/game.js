(function() {
  'use strict';

  function Game() {
    this.player       = null;
    this.enemy        = null;
    this.cursors      = null;
    this.map          = null;
    this.tileset      = null;
    this.layer        = null;
    this.fps          = null;
    this.stats        = null;
    this.bullets      = null;
    this.playerWeapon = null;
  }

  Game.prototype = {

    create: function () {
      this.game.world.setBounds(0,0, 1280, 940);
      this.background = this.add.sprite(0,0, 'background');

      var x = 680
        , y = this.game.height / 2;


      this.map = this.game.add.tilemap('level1');
      this.map.addTilesetImage('tiles', 'tiles');
      //to be changed
      this.map.setCollisionByExclusion([7, 2]);


      this.layer = this.map.createLayer('Tile Layer 1');

      this.layer.resizeWorld();

      this.bullets = this.game.add.group();
      this.bullets.createMultiple(30, 'enemy');
      this.bullets.setAll('anchor.x', 0.5);
      this.bullets.setAll('anchor.y', 0.5);
      this.bullets.setAll('scale.x', 0.1);
      this.bullets.setAll('scale.y', 0.1);
      this.bullets.setAll('outOfBoundsKill', true);
      this.bullets.setAll('name', 'bullet');

      this.cursors = this.game.input.keyboard.createCursorKeys();

      this.playerWeapon = new window.Darwinator.Weapon(this.game, x, y, 200, 1000, 'enemy', this.bullets);
      this.player = new window.Darwinator.Player(this.game, x, y, 100, this.cursors);
      this.player.weapon = this.playerWeapon;
      this.player.scale.setTo(2,2);
      this.enemy = new window.Darwinator.Enemy(this.game, 100, 100, 100);

      this.game.add.existing(this.enemy);
      this.game.add.existing(this.player);
      this.game.add.existing(this.playerWeapon);
      this.game.camera.follow(this.player);
      // For development only
      this.fps = this.game.add.text(16, 16, 'FPS: 0', { fontSize: '16px', fill: '#F08' });
      this.fps.fixedToCamera = true;

      this.stats = this.game.add.text(16, 40, '', { fontSize: '16px', fill: '#F08' });
      this.stats.fixedToCamera = true;
    },

    update: function () {
      this.game.physics.collide(this.player, this.layer);
      this.game.physics.moveToObject(this.enemy, this.player, 50);
      this.game.physics.collide(this.enemy, this.bullets, this.bulletCollisionHandler, null, this);
      this.game.physics.collide(this.layer, this.bullets, this.bulletCollisionHandler, null, this);

      // For development only
      this.fps.content = 'FPS: ' + this.game.time.fps;
      this.stats.content = 'Player stamina: ' + Math.round(this.player.currBreath) + '/' + this.player.stamina;
    }

    ,

    bulletCollisionHandler: function(obj1, obj2){
      var bullet;
      if(obj1.name === 'bullet'){
        bullet = obj1;
      }else if(obj2.name === 'bullet'){
        bullet = obj2;
      }else{
        return;
      }
      bullet.kill();
    }

  };

  window.Darwinator = window.Darwinator || {};
  window.Darwinator.Game = Game;

}());
