'use strict';

window.Darwinator.GeneticAlgorithm = window.Darwinator.GeneticAlgorithm || {

  POPULATION_SIZE:          10,
  NUMBER_OF_GENES:          60, // NOTE with real-valued genes (number of genes)  = (number of variables)
  CROSSOVER_PROBABILITY:    0.8,
  MUTATION_PROBABILITY:     0.025,
  TOURNAMENT_PARAMETER:     0.75,
  VARIABLE_RANGE:           100, // should be set to max attribute value (or 5 for exampleFunction)
  NUMBER_OF_GENERATIONS:    100,
  NUMBER_OF_VARIABLES:      3, // set to number of attributes (or 2 for example function)
  TOURNAMENT_SIZE:          4,
  ELITISM_DEGREE:           1, // should probably be really high

  /**
  * Generates a population of individuals from a given population or a randomly created one.
  * The new population is likely to be more better adapted to find a solution to the given
  * goal function.
  *
  * @method Darwinator.GeneticAlgorithm#generatePopulation
  * @param {Phaser.Game} [game] - The game that uses the algorithm.
  * @param {Phaser.Sprite} [target] - The sprite to be attacked by the enemies.
  * @param {Phaser.Group} [enemyGroup] - Optional. If not provided, a group with default values will be set.
  * @param {Boolean} [singleGeneration] - If true, only one iteration will be run, else, this.NUMBER_OF_GENERATIONS is used.
  * @return {Array} The last population generated.
  */
  generatePopulation: function(game, target, enemyGroup, singleGeneration, spawnPositions) {
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
    console.log('Best fitness: ' +  fitnessLevels[bestIndex]);
    //var totalMaxFit       = 0.0;

    // algorithm main loop
    for (var i = 0; i < (singleGeneration ? 1 : this.NUMBER_OF_GENERATIONS); i++) {

      //var maxFit = 0.0;
      //var bestIndividual = population[0];

      /*
      for(var l = 0; l < population.length; l++) {
        var decodedInd = this.decodeIndividual(population[l]);
        fitnessLevels[l] = this.evaluateInd(decodedInd);
        if(fitnessLevels[l] > maxFit) {
          maxFit = fitnessLevels[l];
          bestIndividual = population[l];
          if (maxFit > totalMaxFit) {
            totalMaxFit = maxFit;
          }
        }
      }
      */
      
      // clone population
      var tmpPopulation = new Array(population.length);
      for (var l = 0; l < tmpPopulation.length; l++) {
        tmpPopulation[l] = new Array(population[l].length);
        for(var j = 0; j < population[l].length; j++) {
          tmpPopulation[l][j] = population[l][j];
        }
      }

      // selection
      for(l = 0; l < population.length; l += 2) {
        var ind1 = this.selection(fitnessLevels);
        var ind2 = this.selection(fitnessLevels);
        // crossover
        if (Math.random() < this.CROSSOVER_PROBABILITY) {
          var chromePair = this.cross(population[ind1], population[ind2]);
          tmpPopulation[l] = chromePair[0];
          tmpPopulation[l + 1] = chromePair[1];
        } else {
          tmpPopulation[l] = population[ind1];
          tmpPopulation[l + 1] = population[ind2];
        }
      }

      // mutation
      for(l = 0; l < population.length; l++) {
        tmpPopulation[l] = this.mutate(tmpPopulation[l]);
      }

      // elitism
      for(l = 0; l < this.ELITISM_DEGREE; l++) {
        tmpPopulation[l] = bestIndividual;
      }

      // replace old population
      population = tmpPopulation;
    } //endof algorithm main loop

    //console.log(1/maxFit);
    //console.log(this.decodeIndividual(bestIndividual));
    var nextGeneration = this.translatePopulation(population, enemyGroup, game, target, spawnPositions);
    console.log('GA: Returning the new generation!');
    return nextGeneration;
  },

  /**
  * Generates a binary encoded population at random.
  *
  * @method Darwinator.GeneticAlgorithm#initPopulation
  * @param {Phaser.Group} [enemyGroup] - The enemy group to fill with enemies.
  * @param {Phaser.Game} [game] - The game that uses the algorithm.
  * @param {Phaser.Sprite} [target] - The sprite to be attacked by the enemies.
  * @return {Array} An enemy population with default attribute values.
  */
  initPopulation: function(enemyGroup, game, target, spawnPositions) {
    // 4 different enemy initial set of attributes - just an example, not permanent!
    var enemiesPerType = this.POPULATION_SIZE / 5;
    var pos = [];
    for(var i = 0; i < this.POPULATION_SIZE; i++){
      pos = spawnPositions[i];
      if(i < enemiesPerType){
        // smart and quick but weak
        enemyGroup.add(new Darwinator.Enemy(game, target, pos.x, pos.y, undefined, 1, 15, 14));
      }else if(i < enemiesPerType*2){
        // strong but slow and stupid
        enemyGroup.add(new Darwinator.Enemy(game, target, pos.x, pos.y, undefined, 20, 5, 5));
      }else if(i < enemiesPerType*3){
        // strong and quick but stupid
        enemyGroup.add(new Darwinator.Enemy(game, target, pos.x, pos.y, undefined, 15, 15, 0));
      }else{
        // hybrid
        enemyGroup.add(new Darwinator.Enemy(game, target, pos.x, pos.y, undefined, 10, 10, 10));
      }
    }
    return enemyGroup;
  },

  /**
  * Decodes a individual from binary encoding to real numbers. The values of each
  * variable will lie in the range [1, this.VARIABLE_RANGE].
  *
  * @method Darwinator.GeneticAlgorithm#decodeIndividual
  * @param {Array} [individual] - The binary encoded individual to be decoded
  * @return {Array} The decoded individual. Will have a length of this.NUMBER_OF_VARIABLES
  */
  decodeIndividual: function(individual) {
    // make sure each attribute is in the range [1, this.VARIABLE_RANGE] by reserving 1 point per attribute
    var pointsToSpend = (this.NUMBER_OF_VARIABLES * this.VARIABLE_RANGE) - this.NUMBER_OF_VARIABLES;

    var bitsPerVar = this.NUMBER_OF_GENES / this.NUMBER_OF_VARIABLES;
    var decoded = [];

    for(var i = 1; i <= this.NUMBER_OF_VARIABLES; i++) {
      decoded[i - 1] = 0;
      for(var l = 1; l <= bitsPerVar; l++) {

        var startVar = (i-1) * bitsPerVar;
        decoded[i-1] += individual[startVar + l - 1] * Math.pow(2, -l);
      }
      // reserved point + [0, range]
      decoded[i-1] = pointsToSpend * decoded[i-1]/(1 - Math.pow(2,-bitsPerVar));
      if(pointsToSpend > 0){
        pointsToSpend -= decoded[i-1];
      }
    }
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
    var newInd1 = [];
    var newInd2 = [];

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
      if (Math.random() < this.MUTATION_PROBABILITY) {
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
    // TODO need better evaluation..
    return enemy.damageDone;
  },

  /* Example function for testing and debugging. */
  /*exampleFunction: function(ind) {
    var x = ind[0];
    var y = ind[1];
    return (1 + Math.pow((x + y + 1), 2) * (19 - 14 * x + 3 *
            Math.pow(x, 2) - 14 * y + 6 * x * y + 3 * Math.pow(y, 2))) *
    (30 + Math.pow((2*x - 3*y), 2) * (18 - 32 * x + 12 *
            Math.pow(x, 2) + 48 * y - 36 * x + 27 * Math.pow(y, 2)));
  },*/

  /**
  *
  * Tranlates the attributes of an enemy to a binary chromosome.
  *
  * @method Darwinator.GeneticAlgorithm#cross
  * @param {Phaser.Sprite} - An enemy sprite
  * @return {Number} - The enemy represented as a binary chromosome
  */
  enemyToChromosome: function (enemy){
    // concatenate the translation of all attributes - NOTE: order matters!
    var chrom = this.attrToGenes(enemy.attributes.strength)
                  .concat(this.attrToGenes(enemy.attributes.agility))
                  .concat(this.attrToGenes(enemy.attributes.intellect));

    if(chrom.length !== this.NUMBER_OF_GENES){ // just in case
      console.log('Illegal length of chromosome: ' + chrom.length);
    }else{
      return chrom;
    }
  },

  /**
  * Translates an enemy group of sprites to chromosomes and fitnessLevels.
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
      fitness[i]    = this.evaluateInd(enemy); //eval score rather than strength etc.
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
  * @return {Phaser.Group} The new group of enemies.
  */    
  translatePopulation: function(population, enemyGroup, game, target, spawnPositions){ 
    enemyGroup.removeAll(); // clear all since the length of the new population may differ
    var pos = [];
    for(var i = 0; i < population.length; i++){
      pos = spawnPositions[i];
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
      var base = 2;
      var binaryString = Number(attr).toString(base).split('').
                map(function(str){return parseInt(str, base);});

      var bitsPerVar = this.NUMBER_OF_GENES / this.NUMBER_OF_VARIABLES;
      if (binaryString.length < bitsPerVar){
        var nbrInitialZeros = bitsPerVar - binaryString.length;
        var zeros = new Array(nbrInitialZeros);
        for(var i = 0; i < nbrInitialZeros; i++){
          zeros[i] = 0;
        }
        // add zeros in beginning to get correct length
        binaryString = zeros.concat(binaryString);
      }else if(binaryString.length > bitsPerVar){
        // keep last bitsPerVar bits
        binaryString = binaryString.slice(-bitsPerVar);
      }
      return binaryString;
  }

};
