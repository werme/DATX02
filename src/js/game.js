'use strict';

Darwinator.GameState = function() {
  this.player   = null;
  this.enemies    = null;
  this.cursors  = null;
  this.map      = null;
  this.tileset  = null;
  this.layer    = null;
  this.fps      = null;
  this.stats    = null;
  this.health   = null;
  this.spawnPositions = [];
  this.numberOfEnemies = 20;
}

Darwinator.GameState.prototype = {

  create: function () {
    this.loadLevel();
    this.game.world.setBounds(0,0, this.map.widthInPixels, this.map.heightInPixels);

    this.cursors = this.game.input.keyboard.createCursorKeys();

    this.player = new Darwinator.Player(this.game, 160, 620, this.cursors, 100, 5, 5);
    this.player.scale.setTo(2,2);

    this.initSpawnPosition();
    this.spawnEnemies();
    
    this.game.add.existing(this.player);
    this.game.camera.follow(this.player);

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

    var x = this.game.width / 2
    , y = this.game.height / 2;
    this.pauseText = this.game.add.text(x, y, 'Game paused', { fontSize: '16px', fill: '#fff', align: 'center' });
    this.pauseText.anchor.setTo(0.5, 0.5);
    this.pauseText.fixedToCamera = true;
    this.pauseText.renderable = false;
    this.pauseText.visible = false;
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

  spawnEnemies: function () {
    var spawnIndexes = new Array(this.spawnPositions.length);

    for (var i = 0; i < spawnIndexes.length; i++) {
      spawnIndexes[i] = i;
    }

    this.enemies = this.game.add.group();
    var rInd;
    var pos;
    while (this.numberOfEnemies-- && spawnIndexes.length) {
      rInd = Math.round(Math.random() * spawnIndexes.length -1);
      pos = spawnIndexes.splice(rInd,1);
      this.enemies.add(new Darwinator.Enemy(this.game, this.player, 
        this.spawnPositions[pos][0], 
        this.spawnPositions[pos][1], 100));
    }

    console.log("duurp");
  },

  initSpawnPosition: function () {
    var matrix = Darwinator.Helpers.convertTileMap(this.map.layers[0].data);
    
    for (var i = 0; i < matrix.length; i++) {
      for(var j = 0; j < matrix[i].length; j++) {
        if (matrix[i][j] === 168){
          this.spawnPositions.push(Darwinator.Helpers.tileToPixels(j,i));
        }
      }
    }
  },


  update: function () {
    // TODO: Move this to the nonexistent resume callback 
    if (this.pauseText.visible) this.pauseText.visible = false;

    this.game.physics.collide(this.player, this.layer);
    this.game.physics.collide(this.enemies, this.layer);
    this.game.physics.collide(this.enemies, this.enemies);

    // For development only
    this.fps.content = 'FPS: ' + this.game.time.fps;
    this.stats.content = 'Player stamina: ' + Math.round(this.player.currBreath) + '/' + this.player.stamina;
    this.health.content = 'Health: ' + this.player.health;
  },

  paused: function () {
    this.pauseText.visible = true;
  }

};
