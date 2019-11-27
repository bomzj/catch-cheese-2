<template>
  <div class="flex flex-wrap overflow-hidden my-3">
    <div class="w-2/3 overflow-hidden text-center">
      <div class="pb-4">
        <GameStats :score="score" :round="round"/>
      </div>
      <GameField :fieldSize="fieldSize" :objects="objects"/>
    </div>
    <div class="w-1/3 overflow-hidden">
      <Trainer :game="this" :agent="getMouse()" />
    </div>
  </div>
</template>

<script>
import GameStats from './GameStats.vue'
import GameField from './GameField.vue'
import Mouse from './mouse'
import Cheese from './cheese'
import Cat from './cat'
import Agent from './agent'
import Player from './player'
import Trainer from './Trainer.vue'

export default {
  name: 'app',
  components: {
    GameStats, GameField, Trainer
  },
  
  data()  {
    return {
      fieldSize: { width: 10, height: 10 },
      objects: [],
      score: 0,
      round: 1,
      lastElapsedTime: 0,
      pace: 100, // how much to wait in ms before next game loop iteration
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
      console.log(dt);
      // Throttle game speed to perceive game play
      if (dt < this.pace) return;
      this.lastElapsedTime = elapsedTime;
    
      for (let obj of this.objects) {
        obj.update(dt);
        
        // Do not let objects go outside the field boundaries
        obj.position.x = Math.min(Math.max(obj.position.x, 0), this.fieldSize.width - 1);
        obj.position.y = Math.min(Math.max(obj.position.y, 0), this.fieldSize.height - 1);
      }

      let mouse = this.objects.find(o => o instanceof Mouse);
      let cat = this.objects.find(o => o instanceof Cat);
      let cheese = this.objects.find(o => o instanceof Cheese);
      
      // Check if cat hits the mouse
      if (mouse.position.x == cat.position.x && 
          mouse.position.y == cat.position.y) { 
            this.score--;
            this.round++;
            // Generate new positon for mouse
            let usedPositions = this.objects.filter(o => !(o instanceof Mouse)).map(o => o.position);
            mouse.position = this.generateFreePosition(usedPositions);
      }

      // Check if mouse hits the cheese
      if (mouse.position.x == cheese.position.x && 
          mouse.position.y == cheese.position.y) { 
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
        if (positions.length == 1) gameObject = Cat;
        if (positions.length == 2) gameObject = Cheese;
        
        gameObject = new gameObject();
        gameObject.position = position;
        gameObject.game = this;

        this.objects.push(gameObject);
      }
    }
  }
}
</script>