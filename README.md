# Catch the Cheese 2
In this game mouse itself learns how to run away from the cat and collect cheeses on the game field via **Q-Learning** algorithm by exploring all possible situations and getting either rewards or punishments. The mouse needs just 2 mins to understand the game at decent level to have ~98% win rate.

<p align="center">
	<img src="catch-cheese.gif" alt="Catch Cheese 2 Gameplay"  title="Catch Cheese Gameplay 2" width="400"/>
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
