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

  selection: function(fitnessLevels) {
    var tournamentParticipants = new Array(this.TOURNAMENT_SIZE);

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

  mutate: function(individual) {
    for (var i = 0; i < this.NUMBER_OF_GENES; i++) {
      if (Math.random() < this.MUTATION_PROBABILITY) {
        individual[i] = 1 - individual[i];
      }
    }
    return individual;
  },

  evaluateInd: function(ind) {
    return (1 / this.exampleFunction(ind));
  },

  exampleFunction: function(ind) {
    var x = ind[0];
    var y = ind[1];
    return (1 + Math.pow((x + y + 1), 2) * (19 - 14 * x + 3 * 
            Math.pow(x, 2) - 14 * y + 6 * x * y + 3 * Math.pow(y, 2))) * 
    (30 + Math.pow((2*x - 3*y), 2) * (18 - 32 * x + 12 * 
            Math.pow(x, 2) + 48 * y - 36 * x + 27 * Math.pow(y, 2)));
  }

};