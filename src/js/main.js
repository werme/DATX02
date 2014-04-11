'use strict';

/**
* @namespace Darwinator
*/
window.Darwinator = window.Darwinator || {

  start: function(game) {

    this.game = game;
    
    game.state.add('boot', this.Boot);
    game.state.add('preloader', this.Preloader);
    game.state.add('menu', this.Menu);
    game.state.add('game', this.GameState);
    game.state.add('result', this.ResultScreen);
    game.state.add('gameover', this.GameOverScreen);

    game.state.start('boot');
  },

  /*
  * Player Stats 
  */
  PLAYER_BASE_HEALTH  : 1000,
  PLAYER_BASE_STAMINA : 50,
  PLAYER_BASE_DAMAGE  : 15,
  PLAYER_BASE_SPEED   : 275,

  PLAYER_BASE_STRENGTH  : 10,
  PLAYER_BASE_AGILITY   : 10,
  PLAYER_BASE_INTELLECT : 100,

  PLAYER_POINTS_PER_LEVEL: 3,

  /*
  * Weapon Stats 
  */
  BOW_COOLDOWN      : 800,
  BOW_DAMAGE        : 10,
  BOW_BULLET_SPEED  : 500,

  CANNON_DAMAGE        : 5,
  CANNON_COOLDOWN      : 1200,
  CANNON_BULLET_SPEED  : 300,

  /*
  * Entity Stats 
  */

  ENTITY_BASE_HEALTH  : 50,
  ENTITY_BASE_STAMINA : 50,
  ENTITY_BASE_DAMAGE  : 5,
  ENTITY_BASE_SPEED   : 75,

  /*
  * Enemy Stats 
  */

  AI_PATH_UPDATE_FREQUENCY : 5,

  /*
  * Other Stats 
  */
  ROUND_LENGTH_SECONDS: 60,

  TILE_WIDTH: 0,
  TILE_HEIGHT: 0,

  MENU_BACKGROUND_COLOR: 0x222d42,
  HEALTHBAR_BACKGROUND_COLOR: 0xff0000,

  setTileSize: function(w,h) {
    this.TILE_WIDTH = w;
    this.TILE_HEIGHT = h;
  }

};
