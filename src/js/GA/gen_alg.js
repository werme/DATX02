'use strict';

window.Darwinator.GeneticAlgorithm = window.Darwinator.GeneticAlgorithm || {

  /*
  * Make sure that:
  * NUMBER_OF_GENES is divisible by NUMBER_OF_VARIABLES
  */
  POPULATION_SIZE:          10,
  CROSSOVER_PROBABILITY:    0.8,
  MUTATION_PROBABILITY:     0.025,
  TOURNAMENT_PARAMETER:     0.75,
  NUMBER_OF_GENERATIONS:    100,
  NUMBER_OF_VARIABLES:      3,
  TOURNAMENT_SIZE:          4,
  ELITISM_DEGREE:           2,

  // depends on player attributes
  NUMBER_OF_GENES:          undefined,
  VARIABLE_RANGE:           undefined, // max sum of enemy attributes
  PLAYER_ADVANTAGE:         10, // increase to make enemies weaker

  // depends on population success
  MUTATION_RATE:            undefined,
  POOR_MAX_FITNESS:         0.1,  // used to set mutation rate

  /**
  * Generates a population of individuals from a given population. The new population is likely to be 
  * more adapted to find a solution to the enemyScore() function.
  *
  * @method Darwinator.GeneticAlgorithm#generatePopulation
  * @param {Phaser.Game} [game] - The game that uses the algorithm.
  * @param {Phaser.Sprite} [target] - The sprite to be attacked by the enemies.
  * @param {Phaser.Group} [enemyGroup] - Optional. If not provided, a group with default values will be set.
  * @param {Boolean} [singleGeneration] - If true, only one iteration will be run, else, this.NUMBER_OF_GENERATIONS is used.
  * @param {Array} [spawnPositions] - The positions on which the enemies are allowed to spawn.
  * @return {Array} The last population generated.
  */
  generatePopulation: function(game, target, enemyGroup, singleGeneration, spawnPositions) {
    // some of the constants depend on the current attributes of the player and are set here
    this.initRanges(target.attributes);

    if(!enemyGroup){
      enemyGroup = game.add.group();
      console.log('GA: Enemy group not provided. Initializing with default values.');
      enemyGroup = this.initPopulation(enemyGroup, game, target, spawnPositions);
      return enemyGroup;
    }
    console.log('GA: Starting GA run..');
    var translatedEnemies = this.translateEnemyWave(enemyGroup);
    var population        = translatedEnemies[0];
    var fitnessLevels     = translatedEnemies[1];
    var bestIndex         = translatedEnemies[2];
    var bestIndividual    = population[bestIndex];
    
    // to eliminate weak populations
    if(fitnessLevels[bestIndex] <= this.POOR_MAX_FITNESS){
      this.MUTATION_RATE = 20;
    }else{
      this.MUTATION_RATE = 1;
    }

    // algorithm main loop
    for (var i = 0; i < (singleGeneration ? 1 : this.NUMBER_OF_GENERATIONS); i++) {
      
      // clone population
      var tmpPopulation = population.slice(0);

      // selection
      for(var l = 0; l < population.length; l += 2) {
        var ind1 = this.selection(fitnessLevels);
        var ind2 = this.selection(fitnessLevels);
        // crossover
        if (Math.random() < this.CROSSOVER_PROBABILITY) {
          var chromePair        = this.cross(population[ind1], population[ind2]);
          tmpPopulation[l]      = chromePair[0];
          tmpPopulation[l + 1]  = chromePair[1];
        } else {
          tmpPopulation[l]      = population[ind1];
          tmpPopulation[l + 1]  = population[ind2];
        }
        // mutation
        tmpPopulation[l]    = this.mutate(tmpPopulation[l]);
        tmpPopulation[l+1]  = this.mutate(tmpPopulation[l+1]);
      }

      if(fitnessLevels[bestIndex] > this.POOR_MAX_FITNESS){
        // elitism
        for(l = 0; l < this.ELITISM_DEGREE; l++) {
          tmpPopulation[l] = bestIndividual;
        }
      }

      // replace old population
      population = tmpPopulation;
    } //endof algorithm main loop

    var nextGeneration = this.translatePopulation(population, enemyGroup, game, target, spawnPositions);
    console.log('GA: Returning the new generation!');
    return nextGeneration;
  },

  initRanges: function(attributes){
    this.VARIABLE_RANGE     = attributes.strength + attributes.agility + attributes.intellect - this.PLAYER_ADVANTAGE;
    this.NUMBER_OF_GENES    = new Number(this.VARIABLE_RANGE).toString(2).length * this.NUMBER_OF_VARIABLES;
  },

  /**
  * Generates a group of enemy sprites with some default values.
  *
  * @method Darwinator.GeneticAlgorithm#initPopulation
  * @param {Phaser.Group} [enemyGroup] - The enemy group to fill with enemies.
  * @param {Phaser.Game} [game] - The game that uses the algorithm.
  * @param {Phaser.Sprite} [target] - The sprite to be attacked by the enemies.
  * @param {Array} [spawnPositions] - The positions on which the enemies are allowed to spawn.
  * @return {Array} An enemy population with default attribute values.
  */
  initPopulation: function(enemyGroup, game, target, spawnPositions) {
    // 4 different enemy initial set of attributes - just an example, not permanent!
    var enemiesPerType  = this.POPULATION_SIZE / 5;
    var pos;
    var strength, agility, intellect;
    spawnPositions = this.shuffle(spawnPositions);
    for(var i = 0; i < this.POPULATION_SIZE; i++){
      pos = spawnPositions[i % spawnPositions.length];
      if(i < enemiesPerType){
        // smart but slow and weak
        strength  = 0;
        agility   = 0;
        intellect = this.VARIABLE_RANGE; 
      }else if(i < enemiesPerType*2){
        // strong but slow and stupid
        strength  = this.VARIABLE_RANGE;
        agility   = 0;
        intellect = 0;
      }else if(i < enemiesPerType*3){
        // fast but weak and stupid
        strength  = 0;
        agility   = this.VARIABLE_RANGE;
        intellect = 0;
      }else{
        // hybrid
        strength  = agility = intellect = this.VARIABLE_RANGE / 3;
      }
      enemyGroup.add(new Darwinator.Enemy(game, target, pos.x, pos.y, undefined, strength, agility, intellect));
    }
    return enemyGroup;
  },

  // returns a shuffled version of the given array
  shuffle: function(array){
    array = array.slice(0);
    var shuff = [];

    while(array.length > 0)
      shuff = shuff.concat(array.splice(Math.round(Math.random() * array.length-1), 1));
    return shuff;
  },

  /**
  * Decodes a individual from binary encoding to real numbers. 
  * The sum of the the decoded variables will be equal to this.VARIABLE_RANGE.
  *
  * @method Darwinator.GeneticAlgorithm#decodeIndividual
  * @param {Array} [individual] - The binary encoded individual to be decoded
  * @return {Array} The decoded individual. Will have a length of this.NUMBER_OF_VARIABLES
  */
  decodeIndividual: function(individual) {
    var pointsToSpend = this.VARIABLE_RANGE;
    var bitsPerVar    = this.NUMBER_OF_GENES / this.NUMBER_OF_VARIABLES;
    var decoded       = new Array(this.NUMBER_OF_VARIABLES);

    for(var i = 0; i < this.NUMBER_OF_VARIABLES; i++) {
      decoded[i] = 0;
      for(var l = 0; l < bitsPerVar; l++) {

        var startVar = i * bitsPerVar;
        decoded[i] += individual[startVar + l] * Math.pow(2, -(l+1));
      }
      decoded[i] = Math.round(pointsToSpend * decoded[i]/(1 - Math.pow(2,-bitsPerVar)));
      if(pointsToSpend > 0){
        pointsToSpend -= decoded[i];
      }
    }
    // distribute the remaining points
    while(pointsToSpend-- > 0 ){
        decoded[i++ % this.NUMBER_OF_VARIABLES]++;
    }
    console.log(decoded);
    return decoded;
  },

  /**
  * Cross two individuals to create two new ones. Will select a crossing point at random,
  * and swap the binary encoded values between the individuals from the selected point.
  *
  * @method Darwinator.GeneticAlgorithm#cross
  * @param {Array} [firstInd] - The first individual to be crossed
  * @param {Array} [secondInd] - The second individual to be crossed
  * @return {Array} - A touple containing the two new individuals.
  */
  cross: function(firstInd, secondInd) {
    var crossPoint = Math.round(Math.random()*this.NUMBER_OF_GENES - 1);
    var newInd1 = new Array(this.NUMBER_OF_GENES);
    var newInd2 = new Array(this.NUMBER_OF_GENES);

    for(var i = 0; i < this.NUMBER_OF_GENES; i++) {
      if (i < crossPoint) {
        newInd1[i] = firstInd[i];
        newInd2[i] = secondInd[i];
      } else {
        newInd2[i] = firstInd[i];
        newInd1[i] = secondInd[i];
      }
    }

    return [newInd1, newInd2];
  },

  /**
  * Select a individual based on the fitness levels of the entire population.
  * this.TOURNAMENT_SIZE many individuals will be selected at random, and one of them will
  * be returned. The tournament works in such a way that a individual with a high fitness level
  * is more likely to be returned from the tournament, but is not more likely to participate.
  *
  * @method Darwinator.GeneticAlgorithm#selection
  * @param {Array} - The fitness levels of the entire population
  * @return {Number} - The index of the selected individual.
  */
  selection: function(fitnessLevels) {
    var tournamentParticipants = new Array(this.TOURNAMENT_SIZE);

    /* Select individuals at random, and represent them as a touple containing their indexes and their
    * fitness levels. */
    for (var i = 0; i < this.TOURNAMENT_SIZE; i++) {
      tournamentParticipants[i]    = new Array(2);
      tournamentParticipants[i][0] = Math.round(Math.random() * (this.POPULATION_SIZE - 1));
      tournamentParticipants[i][1] = fitnessLevels[tournamentParticipants[i][0]];
    }

    /* Sort by fitness levels */
    tournamentParticipants.sort(
      function(a,b) {return b[1]-a[1];}
    );

    for(i = 0; i < this.TOURNAMENT_SIZE; i++) {
      if (Math.random() < this.TOURNAMENT_PARAMETER) {
        return tournamentParticipants[i][0];
      }
    }

    return tournamentParticipants[i - 1][0];
  },

  /**
  * Mutate a given individual by swapping some of the binary encoded values at random.
  * The chance of a value swapping is set by this.MUTATION_PROBABILITY.
  *
  * @method Darwinator.GeneticAlgorithm#mutate
  * @param {Array} - The individual to be mutated
  * @return {Array} - The mutated individual.
  */
  mutate: function(individual) {
    for (var i = 0; i < this.NUMBER_OF_GENES; i++) {
      if (Math.random() < this.MUTATION_PROBABILITY * this.MUTATION_RATE) {
        individual[i] = 1 - individual[i];
      }
    }
    return individual;
  },

  /**
  * Evaluates an enemy sprite based on its score.
  *
  * @method Darwinator.GeneticAlgorithm#evaluateInd
  * @param {Phaser.Sprite} - The individual to be evaluated
  * @return {Number} - The fitness level of the individual
  */
  evaluateInd: function(enemy) { 
    var fitness = 1 - (1 / this.enemyScore(enemy));
    return fitness == -Infinity ? 0 : fitness;// maximize fitness based on enemy score
  },

  /**
  * Calculates the score of an enemy based on statistical attributes.
  *
  * @method Darwinator.GeneticAlgorithm#enemyScore
  * @param {Phaser.Sprite} - An enemy sprite
  * @return {Number} - The score of the enemy for a given game round.
  */
  enemyScore: function(enemy) { 
    var score = enemy.alive ? enemy.damageDone*2 : enemy.damageDone;
    return score;
  },

  /**
  *
  * Tranlates the attributes of an enemy to a binary chromosome.
  *
  * @method Darwinator.GeneticAlgorithm#enemyToChromosome
  * @param {Phaser.Sprite} - An enemy sprite
  * @return {Number} - The enemy represented as a binary chromosome
  */
  enemyToChromosome: function (enemy){
    // concatenate the translation of all attributes - NOTE: order matters!
    var chrom = this.attrToGenes(enemy.attributes.strength)
                  .concat(this.attrToGenes(enemy.attributes.agility))
                  .concat(this.attrToGenes(enemy.attributes.intellect));

    if(chrom.length !== this.NUMBER_OF_GENES){
      console.log('Illegal length of chromosome: ' + chrom.length);
    }else{
      return chrom;
    }
  },

  /**
  * Translates an enemy group of sprites to chromosomes and fitness levels. 
  * The index of the most fit individual is also provided.
  *
  * @method Darwinator.GeneticAlgorithm#translateEnemyWave
  * @param {Phaser.Group} - A group of enemy sprites
  * @return {Array} - Chromosomes, fitnessLevels and the index of the fittest individual.
  *                     as [chromosomes, fitnessLevels, fittestIndex]
  */
  translateEnemyWave: function(enemyGroup){
    var currentSize = enemyGroup.length; //could add an extra param for this.
    var population  = new Array(currentSize);
    var fitness     = new Array(currentSize);
    var bestIndex   = 0;
    for(var i = 0; i < currentSize; i++){
      var enemy     = enemyGroup.getAt(i);
      population[i] = this.enemyToChromosome(enemy);
      fitness[i]    = this.evaluateInd(enemy);
      if(fitness[i] > fitness[bestIndex]){
        bestIndex = i;
      }
    }
    return [population, fitness, bestIndex];
  }, 

  /**
  * Replaces the given group of enemy sprites to the next generation of sprites.
  *
  * @method Darwinator.GeneticAlgorithm#translatePopulation
  * @param {Array} [population] - The chromosomes of the new generation.
  * @param {Phaser.Group} [enemyGroup] - The enemy sprite group to replace.
  * @param {Phaser.Game} [game] - The game that uses the algorithm.
  * @param {Phaser.Sprite} [target] - The sprite to be attacked by the enemies.
  * @param {Array} [spawnPositions] - The positions on which the enemies are allowed to spawn.
  * @return {Phaser.Group} The new group of enemies.
  */    
  translatePopulation: function(population, enemyGroup, game, target, spawnPositions){
    // FIXME possible memory leak, should call destroy but it crashes for some reason..
    //game.enemies.destroy(true);
    enemyGroup      = game.add.group();
    spawnPositions  = this.shuffle(spawnPositions);
    for(var i = 0; i < population.length; i++){
      var pos         = spawnPositions[i % spawnPositions.length];
      var attributes  = this.decodeIndividual(population[i]);
      var strength    = attributes[0];
      var agility     = attributes[1];
      var intellect   = attributes[2];
      var enemy       = new Darwinator.Enemy(game, target, pos.x, pos.y, undefined, strength, agility, intellect);
      enemyGroup.add(enemy);
    }
    return enemyGroup;
  },

  /**
  * Translates an enemy attribute to a binary string of length this.NUMBER_OF_GENES / this.NUMBER_OF_VARIABLES.
  *
  * @method Darwinator.GeneticAlgorithm#attrToGenes
  * @param {Number} - An enemy attribute.
  * @return {Array} - A binary string representation of the enemy attribute.
  */
  attrToGenes: function(attr) {
      // binary conversion
      var base = 2;
      var binaryString = Number(attr).toString(base).split('').
                map(function(str){return parseInt(str, base);});

      var bitsPerVar = this.NUMBER_OF_GENES / this.NUMBER_OF_VARIABLES;
      if (binaryString.length < bitsPerVar){
        // add zeros to beginning if the binary string was too short
        var nbrInitialZeros = bitsPerVar - binaryString.length;
        var zeros           = new Array(nbrInitialZeros);
        for(var i = 0; i < nbrInitialZeros; i++){
          zeros[i] = 0;
        }

        binaryString = zeros.concat(binaryString);
      }else if(binaryString.length > bitsPerVar){
        // keep the last bitsPerVar bits if the binary string was too long
        // happens if 2^bitsPerVar - 1 < this.VARIABLE_RANGE
        binaryString = binaryString.slice(-bitsPerVar);
      }
      return binaryString;
  }

};
