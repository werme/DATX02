'use strict';

Darwinator.GameState = function() {
  this.player   = null;
  this.enemies  = null;
  this.bullets  = null;
  this.playerWeapon = null;
  this.cursors  = null;
  this.map      = null;
  this.tileset  = null;
  this.layer    = null;
  this.fps      = null;
  this.stats    = null;
  this.health   = null;
  this.pauseText = null;
  this.spawnPositions = [];
  this.numberOfEnemies = 10;
}

Darwinator.GameState.prototype = {

  create: function () {
    this.loadLevel();
    this.game.world.setBounds(0,0, this.map.widthInPixels, this.map.heightInPixels);

    this.cursors = this.game.input.keyboard.createCursorKeys();

    // Since states by default lack a callback for the resume event.
    this.game.onResume.add(this.resumed, this);

    this.player = new Darwinator.Player(this.game, 160, 620, this.cursors, 100, 10, 15, 15);
    this.player.scale.setTo(2,2);
    this.game.add.existing(this.player);
    this.game.camera.follow(this.player);

    // TODO move bullets to separate class
    this.bullets = this.game.add.group();
    this.bullets.createMultiple(30, 'enemy');
    this.bullets.setAll('anchor.x', 0.5);
    this.bullets.setAll('anchor.y', 0.5);
    this.bullets.setAll('scale.x', 0.1);
    this.bullets.setAll('scale.y', 0.1);
    this.bullets.setAll('outOfBoundsKill', true);
    this.bullets.setAll('name', 'bullet');

    this.playerWeapon  = new window.Darwinator.Weapon(this.game, x, y, 200, 1000, this.bullets, 10);
    this.player.weapon = this.playerWeapon;

    this.initSpawnPosition();
    this.spawnEnemies();

    //Maiking sure top layer is rendered on top of player
    this.map.createLayer('Tile Layer 3');

    // For development only
    this.fps = this.game.add.text(16, 16, 'FPS: 0', { fontSize: '16px', fill: '#F08' });
    this.fps.fixedToCamera = true;

    this.stats = this.game.add.text(16, 40, '', { fontSize: '16px', fill: '#F08' });
    this.stats.fixedToCamera = true;

    this.health = this.game.add.text(16, 64, '', {fontSize: '16px', fill: '#F08' });
    this.health.fixedToCamera = true;

    this.gameOver = this.game.add.text(this.game.width / 2, this.game.height / 2, '', {fontSize: '48px', fill:'#F08'});
    this.gameOver.fixedToCamera = true;

    Darwinator.Pathfinder = new EasyStar.js();
    Darwinator.Pathfinder.enableDiagonals();
    var indexes = Darwinator.Helpers.convertTileMap(this.map.layers[0].data);
    Darwinator.Pathfinder.setGrid(indexes);

    Darwinator.Pathfinder.setAcceptableTiles([1337, 168, 156, 157, 158, 172, 173, 174, 188, 189, 190, 205]);
  },

  loadLevel: function() {
    this.map = this.game.add.tilemap('level1');
    this.map.addTilesetImage('tiles', 'tiles');

    Darwinator.setTileSize(this.map.tileWidth, this.map.tileHeight);

    this.map.setCollisionByExclusion([1337, 168, 156, 157, 158, 172, 173, 174, 188, 189, 190, 205]);
    this.map.createLayer('Tile Layer 2');
    this.layer = this.map.createLayer('Tile Layer 1');

    this.layer.debug = true;

    this.map.collisionLayer = this.layer;
    this.layer.resizeWorld();
  },

  initPauseOverlay: function() {
    var x = this.game.width / 2
    , y = this.game.height / 2;
    this.pauseText = this.game.add.text(x, y, 'Game paused', { fontSize: '16px', fill: '#fff', align: 'center' });
    this.pauseText.anchor.setTo(0.5, 0.5);
    this.pauseText.fixedToCamera = true;
    this.pauseText.renderable = false;
    this.pauseText.visible = false;
  },

  spawnEnemies: function () {
    var spawnIndexes = new Array(this.spawnPositions.length);

    for (var i = 0; i < spawnIndexes.length; i++) {
      spawnIndexes[i] = i;
    }

    var rInd;
    var pos;

    while (this.numberOfEnemies && spawnIndexes.length) {
      rInd = Math.round(Math.random() * spawnIndexes.length -1);
      pos = spawnIndexes.splice(rInd,1);
      this.enemies.add(new Darwinator.Enemy(this.game, this.player,
        this.spawnPositions[pos][0],
        this.spawnPositions[pos][1], 100, 5, 5, 15));
      this.numberOfEnemies--;
    }
  },

  initSpawnPosition: function () {
    var matrix = Darwinator.Helpers.convertTileMap(this.map.layers[0].data);

    this.enemies = this.game.add.group();

    for (var i = 0; i < matrix.length; i++) {
      for(var j = 0; j < matrix[i].length; j++) {
        if (matrix[i][j] === 168){
          this.spawnPositions.push(Darwinator.Helpers.tileToPixels(j,i));
        }
      }
    }
  },

  update: function () {
    this.game.physics.collide(this.player, this.layer);
    this.game.physics.collide(this.enemies, this.layer);
    this.game.physics.collide(this.enemies);
    this.game.physics.collide(this.bullets, this.enemies, this.bulletCollisionHandler, null, this);
    this.game.physics.collide(this.bullets, this.layer, this.bulletCollisionHandler, null, this);
    this.bullets.forEachAlive(this.checkBulletSpeed, this); //workaround for misbehaving bullets..
    // For development only
    this.fps.content = 'FPS: ' + this.game.time.fps;
    this.stats.content = 'Player stamina: ' + Math.round(this.player.currBreath) + '/' + this.player.stamina;
    this.health.content = 'Health: ' + Math.round(this.player.health);

  },

  checkBulletSpeed: function(bullet){
    var speed = Math.sqrt(  (bullet.body.velocity.x * bullet.body.velocity.x) +
        (bullet.body.velocity.y * bullet.body.velocity.y));
    var tolerance = 0.1;
    if(bullet !== null && Math.abs(speed - this.playerWeapon.bulletSpeed) > tolerance){ //illegal speed
      if(bullet.x === this.playerWeapon.x && bullet.y === this.playerWeapon.y){ // bullet didn't reset properly on revival
        this.playerWeapon.resetBullet(bullet);
      }else{ //bullet got stuck or bounced
        bullet.kill();
      }
    }else if(bullet === null){
      console.log('checkBulletSpeed: bullet was null');
    }
  },

  bulletCollisionHandler: function(obj1, obj2){
    var bullet;
    if(obj1.name === 'bullet'){
      bullet = obj1;
      if(obj2 instanceof Darwinator.Enemy){
        obj2.takeDamage(this.player.damage);
      }
    }else if(obj2.name === 'bullet'){
      bullet = obj2;
      if(obj1 instanceof Darwinator.Enemy){
        obj1.takeDamage(this.player.damage);
      }
    }else{
      console.log('A bullet collision without bullets occurred. That\'s odd.');
      return;
    }
    bullet.kill();
  },

  paused: function () {
    this.pauseText.visible = true;
  },

  resumed: function() {
    this.pauseText.visible = false;
  }

};
