<template>
  <div class="flex flex-wrap overflow-hidden">
    <div class="w-full lg:w-3/5 overflow-hidden text-center p-3">
      <div class="pb-4">
        <GameScore :score="score" :round="round"/>
      </div>
      <GameField :fieldSize="fieldSize" :objects="objects"/>
    </div>
    <div class="w-full lg:w-2/5 overflow-hidden p-3">
      <GameStats :agent="getMouse()" />
      <div class="p-10">
        <GameSpeedSlider :game="this"/>
      </div>
      <TrainAgentButton :game="this" :agent="getMouse()" />
    </div>
  </div>
</template>

<script>
import GameScore from './GameScore.vue'
import GameField from './GameField.vue'
import GameStats from './GameStats.vue'
import TrainAgentButton from './TrainAgentButton.vue'
import GameSpeedSlider from './GameSpeedSlider.vue'
import Mouse from './mouse'
import Cheese from './cheese'
import Cat from './cat'
import Agent from './agent'
import Player from './player'

export default {
  name: 'app',
  components: {
    GameScore, GameField, GameStats, TrainAgentButton, GameSpeedSlider
  },
  
  data()  {
    return {
      fieldSize: { width: 10, height: 10 },
      objects: [],
      score: 0,
      round: 1,
      lastElapsedTime: 0,
      waitTimeBetweenUpdates: 500, 
    }
  },

  created() {
    this.generateField();

    // workaround to have initial lastElapsedTime always lower than elapsedTime passed into update()
    requestAnimationFrame(elapsedTime => {
      this.lastElapsedTime = elapsedTime;
      requestAnimationFrame(this.update);
    });
  },

  methods: {
    getMouse() {
      return this.objects.find(o => o instanceof Mouse);
    },
        
    /** Runs infinite game loop without blocking Browser Event Loop. */
    update(elapsedTime) {
      // Request next update()
      requestAnimationFrame(this.update);
      
      let dt = elapsedTime - this.lastElapsedTime;
      
      // Slow down the game speed to perceive game play
      if (dt < this.waitTimeBetweenUpdates) return;
      this.lastElapsedTime = elapsedTime;
      
      for (let obj of this.objects) {
        obj.update(dt);
        this.handleCollisions(obj);
      }

      // lateUpdate() is called when all objects did their actions
      // and is meant for very specific auxiliary stuff e.g. updating game stats.
      // Do not change game play logic here. Otherwise use update().
      for (let obj of this.objects) {
        if (obj.lateUpdate) obj.lateUpdate(dt);
      }
    },

    handleCollisions(obj) {
      // Notify object that it passed through the field boundaries
      if (obj.position.x < 0 || obj.position.x >= this.fieldSize.width ||
          obj.position.y < 0 || obj.position.y >= this.fieldSize.height) {
        
        if (obj.onHitWall) obj.onHitWall();
      }

      // Do not let objects go outside the field boundaries
      obj.position.x = Math.min(Math.max(obj.position.x, 0), this.fieldSize.width - 1);
      obj.position.y = Math.min(Math.max(obj.position.y, 0), this.fieldSize.height - 1);

      let mouse = this.objects.find(o => o instanceof Mouse);
      let cat = this.objects.find(o => o instanceof Cat);
      let cheese = this.objects.find(o => o instanceof Cheese);
      
      // Check if cat hits the mouse
      if (mouse.position.x == cat.position.x && 
          mouse.position.y == cat.position.y) {
            mouse.onDie(); 
            
            this.score--;
            this.round++;
            
            // Generate new positon for mouse
            let usedPositions = this.objects.filter(o => !(o instanceof Mouse)).map(o => o.position);
            mouse.position = this.generateFreePosition(usedPositions);
      } 
      
      // Check if mouse hits the cheese
      if (mouse.position.x == cheese.position.x && 
          mouse.position.y == cheese.position.y) {
            mouse.onHitCheese();

            this.score++;
            this.round++;

            // Generate new positon for cheese
            let usedPositions = this.objects.filter(o => !(o instanceof Cheese)).map(o => o.position);
            cheese.position = this.generateFreePosition(usedPositions);
      }
    },

    generateFreePosition(...usedPositions) {
      const getRandomInt = (max) => Math.floor(Math.random() * max);
      
      while (true) {
        let position = { 
          x: getRandomInt(this.fieldSize.width),
          y: getRandomInt(this.fieldSize.height) 
        };

        if (!usedPositions.some(p => (p.x == position.x) && (p.y == position.y)))
          return position;
      }
    },

    generateField() {
      this.objects = [];
      
      while (this.objects.length < 3) {
        let positions = this.objects.map(o => o.position);
        let position = this.generateFreePosition(positions);
        let gameObject;
        
        // Uncomment line below to play yourself and comment out line of '... = Agent'
        // if (positions.length == 0) gameObject = Player;
        if (positions.length == 0) gameObject = Agent;
        if (positions.length == 2) gameObject = Cat;
        if (positions.length == 1) gameObject = Cheese;
        
        gameObject = new gameObject();
        gameObject.position = position;
        gameObject.game = this;

        this.objects.push(gameObject);
      }
    }
  }
}
</script>