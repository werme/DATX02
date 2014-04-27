'use strict';

window.Darwinator.GeneticAlgorithm = window.Darwinator.GeneticAlgorithm || {

  // GA parameter constants
  POPULATION_SIZE:          10,
  CROSSOVER_PROBABILITY:    0.8,
  MUTATION_PROBABILITY:     0.025,
  TOURNAMENT_PARAMETER:     0.75,
  NUMBER_OF_GENERATIONS:    100,
  NUMBER_OF_VARIABLES:      3,
  NUMBER_OF_GENES:          3,
  TOURNAMENT_SIZE:          4,
  ELITISM_DEGREE:           2,

  // GA parameter variables
  variableRange:           undefined,
  mutationRate:            undefined,

  // Other constants
  PLAYER_ADVANTAGE:         10,
  POOR_MAX_FITNESS:         0.1,

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
  * @return {Phaser.Group} The new wave of enemies
  */
  generatePopulation: function(population, options, targetFunction) {
    var singleGeneration = options.singleGeneration;
    var fitnessLevels = [];
    spawnPositions = Phaser.Math.shuffleArray(spawnPositions.slice(0));

    if(!population.length){
      population = this.initPopulation(options.varRange);
      console.log('GA: Enemy group not provided. Initializing with default values.');
      if (singleGeneration) {
        return population;
      }
    }
    console.log('GA: Starting GA run..');

    if (options.preEvaluated) {
      for (var i = 0; i < population.length; i++) {
        fitnessLevels.push(population[i].fitness);
      }
    } else {
      fitnessLevels = evaluatePopulation();
    }
    
    // weak population => more mutation
    if (options.preEvaluated)
    this.mutationRate = fitnessLevels[bestIndex] <= this.POOR_MAX_FITNESS ? 20 : 1;

    // algorithm main loop
    for (var i = 0; i < (singleGeneration ? 1 : this.NUMBER_OF_GENERATIONS); i++) {

      var maxFit = 0.0;
      var bestIndividual = population[0];

      for(var l = 0; l < population.length; l++) {
        var ind = population[l];
        fitnessLevels[l] = this.evaluateInd(decodedInd);
        if(fitnessLevels[l] > maxFit) {
          maxFit = fitnessLevels[l];
          bestIndividual = population[l];
          if (maxFit > totalMaxFit) {
            totalMaxFit = maxFit;
          }
        }
      }

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
    }

    var nextGeneration = this.translatePopulation(population, enemyGroup, game, target, spawnPositions);
    console.log('GA: Returning the new generation!');
    return nextGeneration;
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
    for(var i = 0; i < this.POPULATION_SIZE; i++){
      pos = spawnPositions[i % spawnPositions.length];
      if(i < enemiesPerType){
        // smart but slow and weak
        strength  = 0;
        agility   = 0;
        intellect = this.variableRange; 
      }else if(i < enemiesPerType*2){
        // strong but slow and stupid
        strength  = this.variableRange;
        agility   = 0;
        intellect = 0;
      }else if(i < enemiesPerType*3){
        // fast but weak and stupid
        strength  = 0;
        agility   = this.variableRange;
        intellect = 0;
      }else{
        // hybrid
        strength  = agility = intellect = Math.round(this.variableRange / 3);
      }
      enemyGroup.add(new Darwinator.Enemy(game, target, pos.x, pos.y, undefined, strength, agility, intellect));
    }
    return enemyGroup;
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
  * Evaluates an enemy sprite based on its score.
  *
  * @method Darwinator.GeneticAlgorithm#evaluateInd
  * @param {Phaser.Sprite} - The individual to be evaluated
  * @return {Number} - The fitness level of the individual
  */
  evaluateInd: function(enemy, targetFunction) { 
    var fitness = 1 - (1 / targetFunction(enemy));
    return fitness == -Infinity ? 0 : fitness;// maximize fitness based on enemy score
  }

};
