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
    population = population || initPopulation();
    var fitnessLevels = [];

    for (var i = singleGeneration ? 1 : this.NUMBER_OF_GENERATIONS; i > 0; i--) {

      var maxFit = 0.0;
      var bestIndividual = population[0];
      for(var l = 0; l < population.length; l++) {
        var decodedInd = decodeIndividual(population[l]);
        fitnessLevels[l] = goalFunction(decodedInd);
        if(fitnessLevels[l] > maxFit) {
          maxFit = fitnessLevels[l];
          bestIndividual = population[l];
        }
      }

      // TO BE REMOVED (we think?)
      tmpPopulation = population;

      for(l = 0; l < population.length; l += 2) {
        ind1 = selection(fitnessLevels, this.TOURNAMENT_PARAMETER, this.TOURNAMENT_SIZE);
        ind2 = selection(fitnessLevels, this.TOURNAMENT_PARAMETER, this.TOURNAMENT_SIZE);

        if (Math.random() < this.CROSSOVER_PROBABILITY) {
          var chromePair = cross(population[ind1], population[ind2]);
          tmpPopulation[l] = chromePair[0];
          tmpPopulation[l + 1] = chromePair[1];
        } else {
          tmpPopulation[l] = population[ind1];
          tmpPopulation[l + 1] = population[ind2];
        }
      }

      for(l = 0; l < population.length; l++) {
        tmpPopulation[l] = mutate(tmpPopulation[l], this.MUTATION_PROBABILITY);
      }

      for(l = 0; l < this.ELITISM_DEGREE; l++) {
        tmpPopulation[l] = bestIndividual;
      }

      return tmpPopulation;
    }
  },

  initPopulation: function() {
    var population = [];
    for(var i = 0; i < this.POPULATION_SIZE; i++) {
      population[i] = [];
      for(var l = 0; l < this.NUMBER_OF_GENES; l++) {
        population[i][l] = Math.round(Math.random());
      }
    } 

    return population;
  },

  decodeIndividual: function(individual) {
    var bitsPerVar = this.NUMBER_OF_GENES / this.NUMBER_OF_VARIABLES;
    var decoded = [];

    for(var i = 0; i < this.NUMBER_OF_VARIABLES; i++) {
      decoded[i] = 0;
      for(var l = 0; l < bitsPerVar; l++) {

        var startVar = (i - 1) * bitsPerVar;
        decoded[i] = decoded[i] + individual[startVar + l] * Math.pow(2, -l);
      }
      decoded[i] = -this.VARIABLE_RANGE + 2*this.VARIABLE_RANGE * decoded[i]/(1 - Math.pow(2,-bitsPerVar));
    }

    return decoded;
  }

};