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
    var score;
    var categories = Darwinator.Enemy.prototype.categories;

    if (enemy.surviveMode) {
      score = enemy.alive ? enemy.initialHealth + enemy.health * 2 : enemy.damageDone; 
    } else {
        score = enemy.alive ? (enemy.damageDone * 1.2) : enemy.damageDone;
    }
    return score;
  }, 
  /*
  * Other Stats 
  */
  ROUND_LENGTH_SECONDS: 40,

  TILE_WIDTH: 0,
  TILE_HEIGHT: 0,

  MENU_BACKGROUND_COLOR: 0x222d42,
  HEALTHBAR_BACKGROUND_COLOR: 0xff0000,

  setTileSize: function(w,h) {
    this.TILE_WIDTH = w;
    this.TILE_HEIGHT = h;
  },

  currentWave: 0,
  enemyStats: [],

  saveWaveStats: function(population)
  {
    var i, enemy, enemyAttr;
    var wave = [];
    for (i = 0; i < population.length; i++) 
    {
        enemyAttr = population.getAt(i).attributes;
        enemy = population.getAt(i);
        wave[i] = {
            strength: enemyAttr.strength,
            intelligence: enemyAttr.intellect,
            agility: enemyAttr.agility,
            category: enemy.category
        };

    }
    this.enemyStats.push(wave);
  },

  getStats: function(from, to) 
  {
    var i, j, wave, levelStats, waveSize;
    var start = !!from ? from : 0;
    var stop = !!to ? to : this.enemyStats.length;
    
    var total = {
                str: 0,
                ag: 0,
                inte: 0,
                nrInt: 0,
                nrAg: 0,
                nrStr: 0
             };

    for(i = start; i < stop; i++) 
    {
        levelStats = {
            totInt: 0,
            totStr: 0,
            totAg: 0,
            nrInt: 0,
            nrAg: 0,
            nrStr: 0
        };
        wave = this.enemyStats[i];
        waveSize = wave.length;
        
        for (j = 0; j < waveSize; j++) 
        {
            levelStats.totAg += wave[j].agility;
            levelStats.totStr += wave[j].strength;
            levelStats.totInt += wave[j].intelligence;
            switch(wave[j].category) 
            {
                case 'enemy_intellect' :
                    levelStats.nrInt++;
                    break;
                case 'enemy_agility':
                    levelStats.nrAg++;
                    break;
                case 'enemy_strength':
                    levelStats.nrStr++;
                    break;
                default:
            }
        }

        total.str += levelStats.totStr;
        total.ag += levelStats.totAg;
        total.inte += levelStats.totInt;
        total.nrStr += levelStats.nrStr;
        total.nrAg += levelStats.nrAg;
        total.nrInt += levelStats.nrInt;


        console.log('\nGeneration: ' + (i + 1));
        console.log('Average Strength: ' + levelStats.totStr / 10);
        console.log('Average Agility: ' + levelStats.totAg / 10);
        console.log('Average Intelligence: ' + levelStats.totInt / 10);
        console.log('Total Strength: ' + levelStats.nrStr);
        console.log('Total Agility: ' + levelStats.nrAg);
        console.log('Total Intelligence: ' + levelStats.nrInt);

    }
  console.log('\nTotal over all generations: ');
  console.log('Total Strength: ' + total.nrStr);
  console.log('Total Agility: ' + total.nrAg);
  console.log('Total Intelligence: ' + total.nrInt);
  console.log('\nAverage enemy over all waves (weighted towards later generations): ');
  console.log('Strength: ' + total.str / 10);
  console.log('Agility: ' + total.ag / 10);
  console.log('Intelligence: ' + total.inte / 10);
  }

};
