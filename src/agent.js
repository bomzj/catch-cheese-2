import * as tf from '@tensorflow/tfjs'
import Mouse from './mouse'
import Cheese from './cheese'
import Cat from './cat'
import Vue from 'vue'

/** AI player based on neural network */
export default class Agent extends Mouse {
  /** Reference to Game object */
  game = null;

  /** neural network based on Q-learning */
  model = null;

  /** Probability to take random action instead of the best one. */
  exploration = 1;

  explorationDecay = 0.9995;

  /** Discount factor of future reward. */
  discount = 0.95;

  /** Replay memory. */
  memory = [];

  /** Is agent in training mode or normal one?*/
  isTraining = false;

  /** Stats to show how the agent performs */
  stats = {
    totalElapsedTime: 0,
    totalMoves: 0,
    totalWins: 0,
    totalGames: 0,
    totalWinsInRow: 0,

    trainingElapsedTime: 0,
    trainingMoves: 0,
    trainingWins: 0,
    trainingGames: 0,
    trainingWinsInRow: 0,
  };

  /** Contains lose or win game result [0, 1] for last 50 games.
   * Is used to display immidiate win rate information for the last games.
    */
  latestGameResults = Array(100).fill(0);
  latestGameIndex = 0;

  constructor() {
    super();
    this.buildModel();
  }

  /** Builds neural network model with one hidden layer consisted of 6 hidden neurons.
    Optimal number of hidden neurons based on practical tests.
   * */
  buildModel() {
    this.model = tf.sequential({
      layers: [tf.layers.dense({units: 6, inputShape: 16, activation: 'relu'}),
               tf.layers.dense({units: 4, activation: 'linear'})]
              });
    
    this.model.compile({ optimizer: 'sgd', loss: 'meanSquaredError' });
  }

  /** Returns input features tensor for the neural network. */
  getState() {
    let cheesePosition = this.game.objects.find(o => o instanceof Cheese).position;
    let catPosition = this.game.objects.find(o => o instanceof Cat).position;

    // All our input features are categorical(boolean) and one hot encoded
    let featureInputs = [
      /* Where is the cheese? */
      this.position.x > cheesePosition.x, // is cheese on the left?
      this.position.x < cheesePosition.x, // is cheese on the right?
      this.position.y > cheesePosition.y, // is cheese at the top?
      this.position.y < cheesePosition.y, // is cheese at the bottom?
      
      /* Where is the cat? */
      
      // Is cat on the left?
      (this.position.x > catPosition.x) && (this.position.x - catPosition.x <= 2) &&
      (this.position.y == catPosition.y),

      // Is cat on the right?
      (this.position.x < catPosition.x) && (this.position.x - catPosition.x >= -2) &&
      (this.position.y == catPosition.y),
      
      // Is cat at the top?
      (this.position.y > catPosition.y) && (this.position.y - catPosition.y <= 2) &&
      (this.position.x == catPosition.x),

      // Is cat at the bottom?
      (this.position.y < catPosition.y) && (this.position.y - catPosition.y >= -2) &&
      (this.position.x == catPosition.x),

      // Is cat at the top left?
      (this.position.x - 1 == catPosition.x) && (this.position.y - 1 == catPosition.y),
      
      // Is cat at the top right?
      (this.position.x + 1 == catPosition.x) && (this.position.y - 1 == catPosition.y),

      // Is cat at the bottom left?
      (this.position.x - 1 == catPosition.x) && (this.position.y + 1 == catPosition.y),
      
      // Is cat at the bottom right?
      (this.position.x + 1 == catPosition.x) && (this.position.y + 1 == catPosition.y),

      /* Did we reach the wall? */
      
      // Wall is on the left
      this.position.x == 0,
      
      // Wall is on the right
      this.position.x == this.game.fieldSize.width - 1,
      
      // Wall is at the top
      this.position.y == 0,
      
      // Wall is at the bottom
      this.position.y == this.game.fieldSize.height - 1,
    ];

    return tf.tensor([featureInputs]);
  }

  /**
   * Returns the best action for the state based on Q value.
   * @returns [0..3] - left, right, up, down
   */
  getBestAction(state) {
    var actions = this.model.predict(state).arraySync()[0];
    var action = actions.indexOf(Math.max(...actions));
    return action;
  }

  /** Returns the best action or random one. 
   * @returns [0..3] - left, right, up, down
   */
  getBestActionOrRandom() {
    if (this.exploration > Math.random()) {
      var action = Math.floor(Math.random() * 4);
    } else {
      var state = this.getState();
      action = this.getBestAction(state);
    }
    
    return action;
  }

  update(dt) {
    var state = this.getState();

    if (this.isTraining) {
      var action = this.getBestActionOrRandom();
      this.memory.push({ state, action });

      // Decrease exploration gradually during training
      this.exploration *= this.explorationDecay;
    }
    else {
      action = this.getBestAction(state);
    }

    // Move the mouse
    if (action == 0) this.position.x--;
    if (action == 1) this.position.x++;
    if (action == 2) this.position.y--;
    if (action == 3) this.position.y++;
  }

  /* Late Update is called when all objects did their actions(next state) 
    and is meant for specific auxiliary stuff and should not alter game state. */
  lateUpdate(dt) {
    this.stats.totalMoves++;
    this.stats.totalElapsedTime += dt;

    if (this.isTraining) {
      this.stats.trainingMoves++;
      this.stats.trainingElapsedTime += dt;
      
      // Update last memory sample with default reward and next state
      let sample = this.memory[this.memory.length - 1];
      
      // Set default punishing reward for the mouse wandering if no other reward was set
      sample.reward = sample.reward || -1;
      
      sample.nextState = this.getState();
    }

    if (this.memory.length >= 100) {
      this.fitModel();
      this.memory = [];
    }
  }

  onDie() {
    this.stats.totalGames++;
    this.stats.totalWinsInRow = 0;

    if (this.isTraining) { 
      this.stats.trainingGames++;
      this.stats.trainingWinsInRow = 0;
      
      let sample = this.memory[this.memory.length - 1];
      sample.reward = -200;
    }
    
    this.setLatestGameResult(false);
  }

  onHitCheese() {
    this.stats.totalGames++
    this.stats.totalWins++;
    this.stats.totalWinsInRow++;

    if (this.isTraining) { 
      this.stats.trainingGames++
      this.stats.trainingWins++;
      this.stats.trainingWinsInRow++;

      let sample = this.memory[this.memory.length - 1];
      sample.reward = 100;
    }

    this.setLatestGameResult(true);
  }

  onHitWall() {
    if (this.isTraining) { 
      let sample = this.memory[this.memory.length - 1];
      sample.reward = -100;
    }
  }

  /** Set latest game result safely */
  setLatestGameResult(isWin) {
    this.latestGameIndex = this.latestGameIndex < this.latestGameResults.length 
      ? this.latestGameIndex
      : 0;
    
    Vue.set(this.latestGameResults, this.latestGameIndex++, +isWin);
  }

  enableTraining() {
    this.isTraining = true;
  }

  disableTraining() {
    this.isTraining = false;
  }

  /** Trains model on samples from replay memory. */
  async fitModel() {
    let [inputs, outputs] = [[], []];
    for (let i = 0; i < this.memory.length; i++) {
      let { state, action, reward, nextState } = this.memory[i];

      // Calculate target Q value for the action if it's not terminal state
      if (nextState) {
        var actions = this.model.predict(nextState).arraySync()[0];
        var q = reward + this.discount * Math.max(...actions);
      } else {
        // target Q in terminal state just equals reward
        q = reward;
      }
      
      // Replace current Q value for the action with calculated target Q value
      actions = this.model.predict(state).arraySync()[0];
      actions[action] = q;

      inputs.push(state.arraySync()[0]);
      outputs.push(actions);
    }

    inputs = tf.tensor(inputs);
    outputs = tf.tensor(outputs);
    // shuffle memory samples to disrupt state correlations for better training
    this.model.fit(inputs, outputs,
      {
        epochs: 100,
        batchSize: this.memory.length,
        shuffle: true,
        callbacks: {
          onTrainEnd: function(logs) {
            console.log('training complete');
            // fix issue with continuously running fit()
            this.model.stopTraining = true; 
          }.bind(this)
        }
      });
  }
}