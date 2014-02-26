'use strict'

window.Darwinator.GeneticAlgorithm = window.Darwinator.GeneticAlgorithm || {

  POPULATION_SIZE:          100,
  NUMBER_OF_GENES:          60,
  CROSSOVER_PROBABILITY:    0.8,
  MUTATION_PROBABILITY:     0.025,
  TOURNAMENT_PARAMETER:     0.75,
  VARIABLE_RANGE:           5.0,       // Might not need later?
  NUMBER_OF_GENERATIONS:    100,
  NUMBER_OF_VARIABLES:      2,
  TOURNAMENT_SIZE:          4,
  ELITISM_DEGREE:           1,

  generatePopulation: function(goalFunction, population, singleGeneration) {
    population = population || initPopulation(NUMBER_OF_GENES, POPULATION_SIZE);
    var fitnessLevels = [];


    for (var i = singleGeneration ? 1 : NUMBER_OF_GENERATIONS; i > 0; i--) {

      var maxFit = 0.0;
      var bestIndividual = population[0];
      for(var l = 0; l < population.length; l++) {
        var decodedInd = decodeIndividual(population[l], NUMBER_OF_VARIABLES, VARIABLE_RANGE);
        fitnessLevels[l] = goalFunction(decodeIndividual);
        if(fitnessLevels[l] > maxFit) {
          maxFit = fitnessLevels[l];
          bestIndividual = population[l];
        }
      }

      // TO BE REMOVED (we think?)
      tmpPopulation = population;

      for(l = 0; l < population.length; l += 2) {
        ind1 = selection(fitnessLevels, TOURNAMENT_PARAMETER, TOURNAMENT_SIZE);
        ind2 = selection(fitnessLevels, TOURNAMENT_PARAMETER, TOURNAMENT_SIZE);

        if (Math.random() < CROSSOVER_PROBABILITY) {
          var chromePair = cross(population[ind1], population[ind2]);
          tmpPopulation[l] = chromePair[0];
          tmpPopulation[l + 1] = chromePair[1];
        } else {
          tmpPopulation[l] = population[ind1];
          tmpPopulation[l + 1] = population[ind2];
        }
      }

      for(l = 0; l < population.length; l++) {
        tmpPopulation[l] = mutate(tmpPopulation[l], MUTATION_PROBABILITY);
      }

      for(l = 0; l < ELITISM_DEGREE; l++) {
        tmpPopulation[l] = bestIndividual;
      }

      return tmpPopulation;
    }
  },

  initPopulation: function(nrOfGenes, popSize) {
    var population = [];
    for(var i = 0; i < popSize; i++) {
      population[i] = [];
      for(var l = 0; l < nrOfGenes; l++) {
        population[i][l] = Math.round(Math.random());
      }
    } 

    return population;
  }

};