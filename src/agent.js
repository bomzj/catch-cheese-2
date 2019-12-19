import * as tf from '@tensorflow/tfjs'
import Mouse from './mouse'
import Cheese from './cheese'
import Cat from './cat'

/** AI player based on neural network */
export default class Agent extends Mouse {
  /** Reference to Game object */
  game = null;

  /** neural network based on Q-learning */
  model = null;

  /** Probability to take random action instead of the best one. */
  exploration = 1;

  explorationDecay = 0.9999;

  /** Discount factor of future reward. */
  discount = 0.95;

  /** Previous score, is used to determine Score change in order to get reward for last action. */
  oldScore = 0;

  /** Index of action(0 or 1) taken in previous step(iteration).*/
  oldAction = 0;

  /** Previous state, is used in model training.*/
  oldState;

  /** How long takes Agent to respond in milliseconds.*/
  responseTime = 300;

  /** Replay memory. */
  memory = [];

  /** Is agent in training mode or normal one?*/
  isTraining = false;

  /** Is enabled after each model.fit() to check how model is well trained.*/
  isModelValidating = false;

  /** Is used during model validation to show how good model is trained.
  If it equals to 10 then model is considered as well trained.*/
  winsInRow = 0;

  trainingSessionMoves = 0;

  trainingSessionWins = 0;

  trainingSessionGames = 0;

  trainingSessionTime = 0;

  constructor() {
    super();
    this.buildModel();
  }

  /** Builds model of neural network. */
  buildModel() {
    this.model = tf.sequential({
      layers: [tf.layers.dense({units: 7, inputShape: 4, activation: 'relu'}), //kernelRegularizer: tf.regularizers.l2({l2: 0.001})}),
               tf.layers.dense({units: 4, activation: 'linear'})]
              });
    
    this.model.compile({ optimizer: 'sgd', loss: 'meanSquaredError' });
  }

  /** Returns input features tensor for the neural network. */
  getState() {
    let cheesePosition = this.game.objects.find(o => o instanceof Cheese).position;
   //let catPosition = this.game.objects.find(o => o instanceof Cat).position;
    
    let featureInputs = [
      // Cheese position relative to mouse
      //cheesePosition.x - this.position.x,
      //cheesePosition.y - this.position.y

      // Cheese direction 
      this.position.x > cheesePosition.x, // is cheese on the left?
      this.position.x < cheesePosition.x, // is cheese on the right?
      this.position.y > cheesePosition.y, // is cheese at the top?
      this.position.y < cheesePosition.y, // is cheese at the bottom?
      
      // Is cat nearby (not far than 2 cells)?
      //this.position.x - catPosition.x <= 2 && 
      //this.position.y == catPosition.y, // is cat on the left?
      
      //catPosition.x - this.position.x <= 2 && this.position.y == catPosition.y, // is cat on the right?
      //this.position.y - catPosition.y <= 2 && this.position.x == catPosition.x, // is cat at the top?
      //this.position.y - catPosition.y >= -2 && this.position.x == catPosition.x, // is cat at the bottom?
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
  getAction() {
    if (this.exploration > Math.random()) {
      var action = Math.floor(Math.random() * 4);
    } else {
      var state = this.getState();
      action = this.getBestAction(state);
    }
    
    return action;
  }

  /** Evaluates reward for the last action based on score change. */
  GetReward() {
    var reward = -1;
    // Player hit Cheese(+100) or Cat(-100). 
    // Chosen reward value of +/-100 makes training faster and usually requires 1 or 2 training iterations,
    // while values of +/-1 may slow down training for long time or even get stuck.
    if (this.oldScore < this.game.score) reward = 100;
    else if (this.oldScore > this.game.score) reward = -10;
    return reward;
  }

  update(dt) {
    if (this.isTraining) {
      var action = this.handleTraining(dt);
    }
    else {
      let state = this.getState();
      action = this.getBestAction(state);
    }

    if (action == 0) this.position.x--;
    if (action == 1) this.position.x++;
    if (action == 2) this.position.y--;
    if (action == 3) this.position.y++;
  }

  enableTraining() {
    this.memory = [];
    this.oldState = null;
    this.oldAction = null;
    this.oldScore = this.game.score;
    //this.trainingSessionMoves = 0;
    //this.trainingSessionWins = 0;
    //this.trainingSessionGames = 0;
    this.isTraining = true;
  }

  disableTraining() {
    this.isTraining = false;
  }

  /** Collects agent steps into replay memory and then trains on it. */
  handleTraining(dt) {
    let state = this.getState();
    let action = this.getAction();

    if (this.oldState) {
      this.memory.push({ 
        state: this.oldState, 
        action: this.oldAction, 
        reward: this.GetReward(),
        nextState: this.oldScore == this.game.score ? state : null // nextState is null if it's terminal state
      });
    }
    
    if (this.memory.length >= 100) {
      this.fitModel();
      this.memory = [];
      // Start validating training
      //this.isModelValidating = true;
    }

    // Decrease exploration gradually during training
    this.exploration *= this.explorationDecay;

    // Collect training statistics
    this.trainingSessionMoves++;
    if (this.game.score > this.oldScore) this.trainingSessionWins++;
    if (this.game.score != this.oldScore) this.trainingSessionGames++;
    this.trainingSessionTime += dt;

    // Save state/action/score for next iteration
    this.oldState = state;
    this.oldAction = action;
    this.oldScore = this.game.score;
    
    // Validate recent training to determine whether agent plays good, otherwise retrain model one more time.
    //this.validateTraining();
    return action;
  }

  validateTraining() {
    if (!this.isModelValidating) return;
      
    if (this.game.score > this.oldScore) {
        this.winsInRow++;
      }
      else if (this.game.score < this.oldScore) {
        // Continue training until agent wins 20 times in row
        this.isModelValidating = false;
        this.winsInRow = 0;
      }

      // Stop training once model wins 20 times in row
      if (this.winsInRow == 20) {
        this.isTraining = false;
        this.isModelValidating = false;
        this.memory = [];
        this.winsInRow = 0;
      }
  }

  /** Trains model on samples from replay memory. */
  fitModel() {
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
    return this.model.fit(inputs, outputs,
      {
        epochs: 100,
        batchSize: this.memory.length,
        shuffle: true,
        callbacks: {
          onTrainEnd: function(logs) {
            console.log('training complete');
            //this.model.stopTraining = true;
          }.bind(this)
        }
      });
  }
}