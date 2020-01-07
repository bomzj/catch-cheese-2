<template>
    <div class="text-center">
      <button type="button" class="bg-blue-500 hover:bg-blue-700 xl:text-2xl text-white font-bold py-2 px-4 rounded" @click="toggleTraining">{{buttonTitle}}</button>
    </div>
</template>

<script>
export default {
  name: 'TrainAgentButton',
  props: ['game', 'agent'],
  data() {
    return {
      initialWaitTimeBetweenUpdates: this.game.waitTimeBetweenUpdates,
      autoStopTraining: true
    }
  },
  watch: { 
    'agent.stats.trainingMoves': function(value) {
      // Automatically stop training once the mouse reaches 5k moves, that gives ~98% win rate
      if (this.autoStopTraining && value >= 5000) {
        this.toggleTraining();
        this.autoStopTraining = false;
      }
    }
  },
  computed: {
    buttonTitle() {
      return this.agent.isTraining ? "Stop Training..." : "Train Agent";
    }
  },
  methods: {
    toggleTraining() {
      if (this.agent.isTraining) this.agent.disableTraining();
      else this.agent.enableTraining();

      // speed up the game during training
      this.game.waitTimeBetweenUpdates = this.agent.isTraining ? 0 : this.initialWaitTimeBetweenUpdates;
    },
  }
}
</script>