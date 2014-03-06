'use strict';

window.Darwinator.GeneticAlgorithm = window.Darwinator.GeneticAlgorithm || {

  POPULATION_SIZE:          100,
  NUMBER_OF_GENES:          60, // NOTE with real-valued genes (number of genes)  = (number of variables)
  CROSSOVER_PROBABILITY:    0.8,
  MUTATION_PROBABILITY:     0.025,
  TOURNAMENT_PARAMETER:     0.75,
  VARIABLE_RANGE:           100, // should be set to max attribute value (or 5 for exampleFunction)
  NUMBER_OF_GENERATIONS:    100,
  NUMBER_OF_VARIABLES:      4, // set to number of attributes (or 2 for example function)
  TOURNAMENT_SIZE:          4,
  ELITISM_DEGREE:           1, // should probably be really high

  //TODO how can multiple generations be evaluated if evaluation is based on game score?
  //TODO update javadoc
  /**
  * Generates a population of individuals from a given population or a randomly created one.
  * The new population is likely to be more better adapted to find a solution to the given
  * goal function.
  * @method Darwinator.GeneticAlgorithm#generatePopulation
  * @param {function} [goalFunction] - The function with which to evaluate a given population.
  * @param {Array} [population] - Optional. If not provided, a randomly created population will be used for first iteration.
  * @param {Boolean} [singleGeneration] - If true, only one iteration will be run, else, this.NUMBER_OF_GENERATIONS is used.
  * @return {Array} The last population generated.
  */
  generatePopulation: function(game, target, goalFunction, enemyGroup, singleGeneration) { 
    if(!enemyGroup){
      // generate the initial population and return it
      // can't be evaluated since they don't have any game score yet
      enemyGroup = this.initPopulation(game.add.group(), game, target);
      return enemyGroup;
    }
    var translatedEnemies = this.translatedWave(population);
    var population = translatedEnemies[0];
    var fitnessLevels = translatedEnemies[1];
    var totalMaxFit = 0.0;

    // algorithm main loop
    for (var i = 0; i < (singleGeneration ? 1 : this.NUMBER_OF_GENERATIONS); i++) {

      var maxFit = 0.0;
      var bestIndividual = population[0];

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
      for (l = 0; l < tmpPopulation.length; l++) {
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

    console.log(1/maxFit);
    console.log(this.decodeIndividual(bestIndividual));
    nextGeneration = this.translatePopulation(population, enemyGroup);
    return nextGeneration;
  },

  /**
  * Generates a binary encoded population at random.
  * @method Darwinator.GeneticAlgorithm#initPopulation
  * @return {Array} The randomly created population, binary encoded (Array of 0s and 1s).
  */
  initPopulation: function(enemyGroup, game, target) { //TODO update javadoc
    // 4 different enemy initial set of attributes - just an example, not permanent!
    var enemiesPerType = this.POPULATION_SIZE / 4;
    for(var i = 0; i < this.POPULATION_SIZE; i++){
      if(i < enemiesPerType){
        // hybrid
        enemyGroup.add(new Darwinator.Enemy(game, target, 0, 0, 100, 100, 100, 100));
      }else if(i < enemiesPerType*2){
        // strong and durable but slow and stupid
        enemyGroup.add(new Darwinator.Enemy(game, target, 0, 0, 190, 190, 10, 10));
      }else if(i < enemiesPerType*3){
        // strong and quick but fragile and stupid
        enemyGroup.add(new Darwinator.Enemy(game, target, 0, 0, 10, 190, 190, 10));
      }else{
        // smart and quick but weak and fragile
        enemyGroup.add(new Darwinator.Enemy(game, target, 0, 0, 10, 10, 190, 190));
      }
    }
    return enemyGroup;
  },

  /* NOTE We probably don't need this before evaluation. 
   * Fitness is based on progress made, not the actual attributes.
   * There is no need to encode damage done etc. to evaluate it.
   * We do however need to decode the attributes after the GA run to
   * translate the chromosomes back to enemies.
  */ 
  /**
  * Decodes a individual from binary encoding to real numbers. The values of each
  * variable will lie in the range -this.VARIABLE_RANGE - this.VARIABLE_RANGE.
  * @method Darwinator.GeneticAlgorithm#decodeIndividual
  * @param {Array} [individual] - The binary encoded individual to be decoded 
  * @return {Array} The decoded individual. Will have a length of this.NUMBER_OF_VARIABLES
  */
  decodeIndividual: function(individual) {
    // make sure each attribute is in the range [1, this.VARIABLE_RANGE]
    var pointsToSpend = (this.NUMBER_OF_VARIABLES * this.VARIABLE_RANGE) - this.NUMBER_OF_VARIABLES;

    var bitsPerVar = this.NUMBER_OF_GENES / this.NUMBER_OF_VARIABLES;
    var decoded = [];

    for(var i = 1; i <= this.NUMBER_OF_VARIABLES; i++) {
      decoded[i - 1] = 1;
      for(var l = 1; l <= bitsPerVar; l++) {

        var startVar = (i-1) * bitsPerVar;
        decoded[i-1] = decoded[i-1] + individual[startVar + l - 1] * Math.pow(2, -l);
      }
      decoded[i-1] = -pointsToSpend + 2 * pointsToSpend * decoded[i-1]/(1 - Math.pow(2,-bitsPerVar));
      if(pointsToSpend > 0){
        pointsToSpend -= decoded[i-1];
      }
    }

    return decoded;
  },

  //NOTE crossover is easier with binary chromosomes than with real-valued ones
  /**
  * Cross two individuals to create two new ones. Will select a crossing point at random,
  * and swap the binary encoded values between the individuals from the selected point.
  * @method Darwinator.GeneticAlgorithm#cross
  * @param {Array} - The first individual to be crossed
  * @param {Array} - The second individual to be crossed
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
  * @method Darwinator.GeneticAlgorithm#selection
  * @param {Array} - The fitness levels of the entire population
  * @return {Number} - The index of the selected individual.
  */
  selection: function(fitnessLevels) {
    var tournamentParticipants = new Array(this.TOURNAMENT_SIZE);

    /* Select individuals at random, and represent them as a touple containing their indexes and their 
    * fitness levels. */
    for (var i = 0; i < this.TOURNAMENT_SIZE; i++) {
      tournamentParticipants[i] = new Array(2);
      tournamentParticipants[i][0] = Math.round(Math.random() * (this.POPULATION_SIZE - 1));
      tournamentParticipants[i][1] = fitnessLevels[tournamentParticipants[i][0]];
    }

    /* Sort by fitness levels */
    tournamentParticipants.sort(function(a,b){return b[1]-a[1]});

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
  * Evaluates a individual accoarding to the goal and the goal function.
  * @method Darwinator.GeneticAlgorithm#cross
  * @param {Array} - The individual to be evaluated
  * @return {Number} - The fitness level of the individual
  */
  evaluateInd: function(ind) {  // NOTE param is an enemy sprite rather than decoded variables!
    return 1 - (1 / this.enemyScore(ind)); // maximize fitness based on enemy score
  },

  // goal function - calculates the score of an enemy based on collected data
  // perhaps move this to the actual enemy prototype?
  enemyScore: function(enemy) {
    /*
    (good stuff) -  (bad -stuff)
    Remember to restrict each score to a certain range
    If they are not set within a range, one score property may be too dominant e.g. survived ms.
    */
    //TODO implement
    /*
    perhaps time the play time of the level and check difference between 
        playTime and enemy.timeSurvivedMs as well as restricting the difference

    still need to figure out a fair comparison though
    */
  },

  /* Example function for testing and debugging. */
  exampleFunction: function(ind) {
    var x = ind[0];
    var y = ind[1];
    return (1 + Math.pow((x + y + 1), 2) * (19 - 14 * x + 3 * 
            Math.pow(x, 2) - 14 * y + 6 * x * y + 3 * Math.pow(y, 2))) * 
    (30 + Math.pow((2*x - 3*y), 2) * (18 - 32 * x + 12 * 
            Math.pow(x, 2) + 48 * y - 36 * x + 27 * Math.pow(y, 2)));
  },

  // tranlates the attributes of an enemy to a binary chromosome
  enemyToChromosome: function (enemy){
    // concatenate the translation of all attributes - NOTE: order matters!
    var chrom = this.attrToGenes(enemy.health)
                  .concat(this.attrToGenes(enemy.strength))
                  .concat(this.attrToGenes(enemy.agility))
                  .concat(this.attrToGenes(enemy.intellect));

    if(chrom.length !== this.NUMBER_OF_GENES){ // just in case
      console.log('Illegal length of chromosome: ' + chrom.length);
    }else{
      return chrom;
    }
  },

  /*
      returns [population, fitness, bestIndividual]
  */
  translateEnemyWave: function(enemyGroup){
    var currentSize = enemyGroup.length;
    var population  = new Array(currentSize);
    var fitness     = new Array(currentSize);
    for(var i = 0; i < enemyGroup.length - 1; i++){
      var enemy     = enemyGroup.getAt(i);
      population[i] = this.enemyToChromosome(enemy);
      fitness[i]    = this.evaluateInd(enemy); //eval score rather than strength etc.
    }
    return [population, fitness];
  },

  /*
    Translates the chromosomes to a new sprite group.
  */
  translatePopulation: function(population, enemyGroup){
    // arguments needed for constructor
    var game = enemyGroup.getAt(0).game;
    var target = enemyGroup.getAt(0).target;
    var x = 0;
    var y = 0;

    enemyGroup.destroy(true); // clear all since the length of the new population may differ
    for(var i = 0; i < population.length; i++){
      var attributes  = this.decodeIndividual(population[i]);
      var health      = attrbutes[0];
      var strength    = attrbutes[1];
      var agility     = attrbutes[2];
      var intellect   = attrbutes[3];
      var enemy       = new Darwinator.Enemy(game, target, x, y, health, strength, agility, intellect);
      enemyGroup.add(enemy);
    }
    return enemyGroup;
  },

  // translate an attribute to a binary string
  // TODO real number encoding would simplify (and perhaps improve) this quite a bit..
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