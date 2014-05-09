'use strict';

Darwinator.GeneticAlgorithm = {

  // GA parameter constants
  POPULATION_SIZE:          10,
  CROSSOVER_PROBABILITY:    0.8,
  MUTATION_PROBABILITY:     0.025,
  TOURNAMENT_PARAMETER:     0.75,
  NUMBER_OF_GENERATIONS:    100,
  NUMBER_OF_GENES:          3,
  TOURNAMENT_SIZE:          4,
  ELITISM_DEGREE:           2,

  // GA parameter variables
  mutationRate:            undefined,

  // Other constants
  POOR_MAX_FITNESS:         0.1,

  /**
  * Generates a population of individuals. If no population is provided, or the population is empty, 
  * an initial population will be generated randomly.
  *
  * @method Darwinator.GeneticAlgorithm#generatePopulation
  * @param {Number} [population] - The current population.
  * @param {Object} [options] - Options for the GA. Supported options: preEvaluated (true/false), varRange
  * @param {Object} [targetFunction] - The target function used for evaluation. Only used is options.preEvaluated is false.
  * @return {Array} The next generation of individuals.
  */
  generatePopulation: function(population, options, targetFunction) {
    if(!population || !population.length){
      population = this.initPopulation(options.varRange);
      console.log('GA: Enemy group not provided. Initializing with default values.');
      return population;
    }
    console.log('GA: Starting GA run..');
    
    // weak population => more mutation
    this.mutationRate = population.maxFit <= this.POOR_MAX_FITNESS ? 20 : 1;

    // algorithm main loop
    for (var i = 0; i < (options.preEvaluated ? 1 : this.NUMBER_OF_GENERATIONS); i++) {

      if (!options.preEvaluated) {
        evaluatePopulation(population, targetFunction);
        population.bestInd = population[0];
        population.maxFit = population.bestInd.fitness;
      }

      var tmpPopulation = [];
      tmpPopulation.fitness = population.fitness.slice(0);

      // selection
      for(var l = 0; l < population.length; l += 2) {
        var index1 = this.selection(population.fitness);
        var index2 = this.selection(population.fitness);
        // crossover
        if (Math.random() < this.CROSSOVER_PROBABILITY) {
          var chromePair        = this.cross(population[index1], population[index2]);
          tmpPopulation[l]      = chromePair[0];
          tmpPopulation[l + 1]  = chromePair[1];
        } else {
          tmpPopulation[l]      = population[index1];
          tmpPopulation[l + 1]  = population[index2];
        }
        // mutation
        tmpPopulation[l]    = this.mutate(tmpPopulation[l]);
        tmpPopulation[l+1]  = this.mutate(tmpPopulation[l+1]);
      }

        // elitism
      for(l = 0; l < this.ELITISM_DEGREE; l++) {
        tmpPopulation[l] = population.bestInd;
      }

      // replace old population
      population = tmpPopulation;
    }

    console.log('GA: Returning the new generation!');
    console.log("Population: ", population);
    return population;
  },

  /**
  * Generates a population randomly with gene values within the given range.
  *
  * @method Darwinator.GeneticAlgorithm#initPopulation
  * @param {Number} [variableRange] - The range in which gene values are allowed to be generated
  * @return {Array} - A random initial population.
  */
  initPopulation: function(variableRange) {
    var population, i, l;
    population = [];  
    for (i = 0; i < this.POPULATION_SIZE; i++) {
      population[i] = [];
      for (l = 0; l < this.NUMBER_OF_GENES; l++) {
        population[i][l] = Math.random() * variableRange;
      }
    }

    return population;
  },

  /**
  * Cross two individuals to create two new ones by performing a tradeoff between
  * two randomly selected genes in each individual.
  *
  * Example: Select index of x and y.
  * First individual: decrease x and increase y
  * Second individual: decrease y and increase x
  *
  * @method Darwinator.GeneticAlgorithm#cross
  * @param {Array} [firstInd] - The first individual to be crossed
  * @param {Array} [secondInd] - The second individual to be crossed
  * @return {Array} - A tuple containing the two new individuals.
  */
  cross: function(firstInd, secondInd) {
    var crossPoint1 = Math.round(Math.random()*(this.NUMBER_OF_GENES - 1));
    var crossPoint2 = Math.round(Math.random()*(this.NUMBER_OF_GENES - 1));

    var tradeOff        = Math.random();
    var tradeOffAmount1 = Math.round(tradeOff * firstInd[crossPoint1]);
    var tradeOffAmount2 = Math.round(tradeOff * secondInd[crossPoint2]);

    var newInd1 = firstInd.slice(0);
    var newInd2 = secondInd.slice(0);

    newInd1[crossPoint1] -= tradeOffAmount1;
    newInd1[crossPoint2] += tradeOffAmount1;

    newInd2[crossPoint2] -= tradeOffAmount2;
    newInd2[crossPoint1] += tradeOffAmount2;

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
    var tournamentParticipants = [];

    /* Select individuals at random, and represent them as a touple containing their indexes and their
    * fitness levels. */
    for (var i = 0; i < this.TOURNAMENT_SIZE; i++) {
      tournamentParticipants[i]    = [];
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
  * Mutate a given individual by performing a tradeoff between two randomly selected genes.
  *
  * @method Darwinator.GeneticAlgorithm#mutate
  * @param {Array} - The individual to be mutated
  * @return {Array} - The mutated individual.
  */
  mutate: function(individual) {
    if (Math.random() < this.MUTATION_PROBABILITY * this.mutationRate) {
      var gene1 = Math.round(Math.random()*(this.NUMBER_OF_GENES - 1));
      var gene2 = Math.round(Math.random()*(this.NUMBER_OF_GENES - 1));
      var tradeOffAmount = Math.round(Math.random() * individual[gene1]);

      individual[gene1] -= tradeOffAmount;
      individual[gene2] += tradeOffAmount;
    }
    return individual;
  },

  /**
  * Evaluates an individual based on the given target function. 
  * A higher target function value will give a higher fitness.
  *
  * @method Darwinator.GeneticAlgorithm#evaluateInd
  * @param {Array} - The individual to be evaluated
  * @return {Number} - The fitness level of the individual
  */
  evaluateInd: function(individual, targetFunction) { 
    var fitness = 1 - (1 / targetFunction(individual));
    return fitness === -Infinity ? 0 : fitness;
  }

};
