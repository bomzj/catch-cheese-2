# Simple JavaScript Game with AI powered by Artificial Neural Network

This is a showcase of how AI agent (mouse) itself learns to run away from the cat and collect cheeses in the game.
You can play the game at https://bomzj.github.io/catch-cheese-2/dist/.
<p align="center">
	<img src="https://github.com/bomzj/catch-cheese-2/raw/master/img/catch-cheese.gif" alt="Catch the Cheese 2"  title="Catch the Cheese 2" width="400"/>
</p>

## How Mouse Learns to Play

The mouse uses **Q-Learning** which is the most popular algorithm in **Reinforcement Learning** to explore all possible  situations on the game field to find an optimal play.   

At the beginning, the mouse knows nothing about how to play properly the game and interacts with the environment randomly. The mouse receives rewards or punishments on each its action. This makes the mouse understand which actions were good and which weren't at particular game situations (states). Therefore, the mouse tries to maximize its rewards and avoid punishments during training.

<p align="center">
	<img src="https://github.com/bomzj/catch-cheese-2/raw/master/img/reinforcement-learning.png" alt="How agent interacts with environment in Reinforcement Learning"  title="How agent interacts with environment in Reinforcement Learning" width="600"/>
</p>

Reward values:

- Idling is -1. *We don't want the mouse to wander.*
- Collecting a cheese is +100. 
- The cat hits the mouse -100. 
- The mouse hits the walls -100. *We don't want to see the mouse trying to go out of the game field.*

I tried different values for rewards and selected ones that work the best.

## Neural Network Architecture

### Input Layer
Input layer contains 16 neurons. At the beginning, I tried lesser number of input features that were continuous variables e.g. coordinates of the cat [3, 8], but were getting **Gradient Explosion**, so all weights of the network  were broken, becoming **NaN**. I decided to skip stuff like regularization for that and make more features but simple at the same time to boost learning process. So all 16 features are one-hot encoded (0 or 1) and describe position of the cat, cheese and the boundaries of the game field. 

### 1 Hidden Layer
I tried different number of hidden layers/neurons, the most optimal was 1 hidden layer with 6 neurons. With that configuration the mouse needs just 2 mins (training automatically stops) to understand the game at decent level to have approximately 98% win rate. Increasing the number of neurons didn't give better results, instead it takes longer to train.

### Output Layer
Output layer is vector of Q values for 4 actions, where the mouse can go [left, right, up, down]. An example, [0.9, -1, 0.3, 5], the mouse chooses to go down since Q value for down action is the highest one.

### Activation functions
I chose **Relu** as activation function for hidden layer based on its performance. For output layer I decided not to use  activation function since it allows us to have arbitrary values for reward,  so it's **linear**.

### Interesting Findings
I discovered strange situation with long training process of the mouse. Training the model from the scratch for short period of time (2-5 mins) makes it very good at predictions, but if traininig continues right after that, the model becomes absolutely unusable! I'm not sure if it's somehow relates to **Overfitting** in Machine Learning. So, training it for short period of time makes it pretty good, but continuing training turns it into completely broken stuff. I checked model weights there were no **NaN**s or 0s. I suppose it's neither Gradient Exlosion nor Gradient Vanishing.


## Game Dependencies

This game uses:
- **TensorFlow.js** for machine learning in js
- **Vue.js** as engine for main game loop, game logic, DOM manipulation and rendering
- **Tailwind** for css styling

The code of this game is well commented and flexible being as starter kit. You can implement AI even for cat or adding walls inside the grid to make it as maze.


# Setup


## Prerequisites

- NPM
- Node.js

#### Optional:

- Chrome Browser
- Visual Studio Code
- Visual Studio Code Extensions:
  - Debugger for Chrome
  - Vetur

## Installing
```
npm install
```

## How to Run

### Compiles and hot-reloads for development
```
npm run serve
```
The command starts  dev server at http://localhost:8080/.
> `F5` in Visual Studio Code opens up http://localhost:8080/ in chrome browser.

### Compiles and minifies for production
```
npm run build
```
Compiles project into `/dist` folder
