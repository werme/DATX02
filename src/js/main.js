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

  settings : null,

  /*
  * Player Stats 
  */
  PLAYER_BASE_HEALTH  : 100,
  PLAYER_BASE_STAMINA : 50,
  PLAYER_BASE_DAMAGE  : 20,
  PLAYER_BASE_SPEED   : 100,

  PLAYER_BASE_STRENGTH  : 0,
  PLAYER_BASE_AGILITY   : 0,
  PLAYER_BASE_INTELLECT : 0,

  PLAYER_POINTS_PER_LEVEL: 5,

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
  ENTITY_BASE_HEALTH      : 50,
  ENTITY_BASE_STAMINA     : 50,
  ENTITY_BASE_DAMAGE      : 5,
  ENTITY_BASE_SPEED       : 50,
  ENTITY_TELEPORT_COOLDOWN : 10000,
  ENTITY_DODGE_COOLDOWN : 5000,

  /*
  * Enemy Stats 
  */
  AI_PATH_UPDATE_FREQUENCY : 5,

  /*
  *   Variables for the GA settings
  */
  PLAYER_ADVANTAGE: 10,
  NUMBER_OF_GENES: 3,
  /**
  * Calculates the score of an enemy based on statistical attributes.
  *
  * @method Darwinator#EVALUATE_ENEMY
  * @param {Phaser.Sprite} - An enemy sprite
  * @return {Number} - The score of the enemy for a given game round.
  */
  EVALUATE_ENEMY: function(enemy) { 
    var score = undefined;
    var categories = Darwinator.Enemy.prototype.categories;

    if (enemy.surviveMode) {
      score = enemy.alive ? enemy.initialHealth + enemy.health*2 : enemy.damageDone; 
    } else {
      if (enemy.category === categories.INTELLIGENT){
        score = enemy.alive ? enemy.damageDone*4 + enemy.abilityScore*4 : 
                              enemy.damageDone*4 + enemy.abilityScore;
        console.log("intelligence: " + score);
      } else if (enemy.category === categories.STRONG) {
        score = enemy.alive ? enemy.damageDone*2 + enemy.abilityScore : 
                              enemy.damageDone + enemy.abilityScore;  
        console.log("strength: " + score);
      }  else if (enemy.category === categories.AGILE) {
        score = enemy.alive ? enemy.damageDone*2 + enemy.abilityScore: 
                              enemy.damageDone + enemy.abilityScore;  
        console.log("agility: " + score);
      }  else {
        score = enemy.alive ? enemy.damageDone*2 + enemy.abilityScore : 
                              enemy.damageDone + enemy.abilityScore;  
        console.log("default: " + score);

      }

    }
    return score;
  }, 
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
