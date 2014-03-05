'use strict';

window.Darwinator.GeneticAlgorithm = window.Darwinator.GeneticAlgorithm || {

  POPULATION_SIZE:          100,
  NUMBER_OF_GENES:          60,
  CROSSOVER_PROBABILITY:    0.8,
  MUTATION_PROBABILITY:     0.025,
  TOURNAMENT_PARAMETER:     0.75,
  VARIABLE_RANGE:           5.0, // should be set to max attribute value
  NUMBER_OF_GENERATIONS:    100,
  NUMBER_OF_VARIABLES:      2,
  TOURNAMENT_SIZE:          4,
  ELITISM_DEGREE:           1,

  /* This function could have an optional fitness array parameter.
      Enemy sprites chromosomes and fitness values can be calculated
      at the same time; no extra loop is needed for that.
  */
  /**
  * Generates a population of individuals from a given population or a randomly created one.
  * The new population is likely to be more better adepted to find a solution to the given
  * goal function.
  * @method Darwinator.GeneticAlgorithm#generatePopulation
  * @param {function} [goalFunction] - The function with wich to evaluate a given population.
  * @param {Array} [population] - Optional. If not provided, a randomly created population will be used for first iteration.
  * @param {Boolean} [singleGeneration] - If true, only one iteration will be run, else, this.NUMBER_OF_GENERATIONS is used.
  * @return {Array} The last population generated.
  */
  generatePopulation: function(goalFunction, population, singleGeneration) {
    population = population || this.initPopulation();
    var fitnessLevels = new Array(this.POPULATION_SIZE);
    var totalMaxFit = 0.0;

    for (var i = 0; i < (singleGeneration ? 1 : this.NUMBER_OF_GENERATIONS); i++) {

      var maxFit = 0.0;
      var bestIndividual = population[0];

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

      var tmpPopulation = new Array(population.length);
      for (l = 0; l < tmpPopulation.length; l++) {
        tmpPopulation[l] = new Array(population[l].length);
        for(var j = 0; j < population[l].length; j++) {
          tmpPopulation[l][j] = population[l][j];
        }
      }

      for(l = 0; l < population.length; l += 2) {
        var ind1 = this.selection(fitnessLevels);
        var ind2 = this.selection(fitnessLevels);
        if (Math.random() < this.CROSSOVER_PROBABILITY) {
          var chromePair = this.cross(population[ind1], population[ind2]);
          tmpPopulation[l] = chromePair[0];
          tmpPopulation[l + 1] = chromePair[1];
        } else {
          tmpPopulation[l] = population[ind1];
          tmpPopulation[l + 1] = population[ind2];
        }
      }

      for(l = 0; l < population.length; l++) {
        tmpPopulation[l] = this.mutate(tmpPopulation[l]);
      }

      for(l = 0; l < this.ELITISM_DEGREE; l++) {
        tmpPopulation[l] = bestIndividual;
      }
      population = tmpPopulation;
    }

    console.log(1/maxFit);
    console.log(this.decodeIndividual(bestIndividual));
    return population;
  },

  /**
  * Generates a binary encoded population at random.
  * @method Darwinator.GeneticAlgorithm#initPopulation
  * @return {Array} The randomly created population, binary encoded (Array of 0s and 1s).
  */
  initPopulation: function() {
    var population = new Array(this.POPULATION_SIZE);
    for(var i = 0; i < population.length; i++) {
      population[i] = new Array(this.NUMBER_OF_GENES);
      for(var l = 0; l < population[i].length; l++) {
        population[i][l] = Math.round(Math.random());
      }
    } 

    return population;
  },

  /* NOTE We probably don't think we need this before evaluation. 
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
    var bitsPerVar = this.NUMBER_OF_GENES / this.NUMBER_OF_VARIABLES;
    var decoded = [];

    for(var i = 1; i <= this.NUMBER_OF_VARIABLES; i++) {
      decoded[i - 1] = 0;
      for(var l = 1; l <= bitsPerVar; l++) {

        var startVar = (i-1) * bitsPerVar;
        decoded[i-1] = decoded[i-1] + individual[startVar + l - 1] * Math.pow(2, -l);
      }
      decoded[i-1] = -this.VARIABLE_RANGE + 2 * this.VARIABLE_RANGE * decoded[i-1]/(1 - Math.pow(2,-bitsPerVar));
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
  evaluateInd: function(ind) {
    /* For now, the example function from labs in FFR105 is used */
    //TODO change to maximization i.e. 1 - 1 / enemyScore
    return (1 / this.exampleFunction(ind));
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
    // TODO add all attributes
    var chrom = this.attrToGenes(enemy.speed);
    chrom = chrom.concat(this.attrToGenes(enemy.damage));

    if(chrom.length !== this.NUMBER_OF_GENES){ // just in case
      console.log('Illegal length of chromosome: ' + chrom.length);
    }else{
      return chrom;
    }
  },

  /* returns a 2d array of the enemy chromosomes array and the fitness array
      with the fitness of chromosome i in fitness[i]

      returns [population, fitness]
  */
  translateEnemyWave: function(enemyGroup){
    var currentSize = enemyGroup.length;
    var population = new Array(currentSize);
    var fitness = new Array(currentSize);
    for(var i = 0; i < enemyGroup.length - 1; i++){
      var enemy = enemyGroup.getAt(i);
      population[i] = enemyToChromosome(enemy);
      fitness[i] = 1 - 1 / this.enemyScore(enemy); //TODO move to evaluate
    }
    return [population, fitness];
  },

  /*
    Translates the population back to a sprite group
  */
  translatePopulation: function(population){
    //TODO implement
    /*
    Use decode to get the new attribute values and pass them to the Enemy constructor.
    */
  },

  // translate an attribute to a binary string
  // TODO real number encoding would simplify (and perhaps improve) this quite a bit..
  attrToGenes: function(attr) {
      var base = 2;
      var binaryString = Number(attr).toString(base).split("").
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