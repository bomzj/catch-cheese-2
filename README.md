# Catch the Cheese
Simple 1D turn based game, where AI agent is built upon Artificial Neural Network learns how to play the game on its own by using **Q-Learning** algorithm.  The goal of the game is to collect cheeses as much as possible avoiding cat.

<p align="center">
	<img src="catch-cheese.gif" alt="Catch Cheese Gameplay"  title="Catch Cheese Gameplay" width="600"/>
</p>

This game uses:
- **TensorFlow.js** for machine learning in JavaScript
- **Vue.js** as engine for game logic and rendering

The code is well commented but requires initial knowledge of Reinforcement Learning. 

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