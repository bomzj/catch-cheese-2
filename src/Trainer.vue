<template>
  <div class="text-center">
    <h1 class="text-2xl">Training Info</h1>
    
    <div class="my-5 text-left text-gray-600 text-lg">
      <div class="my-2">Elapsed time, sec: <span class="font-medium">{{elapsedTime}}</span></div>
      <div class="my-2">Total moves: <span class="font-medium">{{totalMoves}}</span></div>
      <div class="my-2">Moves to win (avg): <span class="font-medium">{{movesToWin}}</span></div>
      <div class="my-2">Win rate, %: <span class="font-medium">{{winRate}}</span></div>
      <div class="my-2">Wins in a row: <span class="font-medium">N/A</span></div>
      <div class="my-2">Exploration rate, %: <span class="font-medium">{{explorationRate}}</span></div>
    </div>
    
    <button type="button" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" @click="toggleTraining">{{buttonTitle}}</button>
  </div>
</template>

<script>
export default {
  name: 'Trainer',
  props: ['game', 'agent'],
  data() {
    return {
      initialGamePace: this.game.pace
    }
  },
  computed: {
    buttonTitle() {
      var title = "Train Agent";
      if (this.agent.isTraining && this.agent.isModelValidating) 
        title = "Validating...";
      else if (this.agent.isTraining)
        title = "Stop Training...";
      return title;
    },
    elapsedTime() {
      return (this.agent.trainingSessionTime / 1000).toFixed(2);
    },
    totalMoves() {
      return this.agent.trainingSessionMoves;
    },
    movesToWin() {
      let average = this.agent.trainingSessionMoves / this.agent.trainingSessionWins;
      return average.toFixed(2);
    },
    winRate() {
      let winRate = this.agent.trainingSessionWins / this.agent.trainingSessionGames;
      return (winRate * 100).toFixed(2);
    },
    explorationRate() {
      return (this.agent.exploration * 100).toFixed(2);
    }
  },
  methods: {
    toggleTraining() {
      if (this.agent.isTraining) this.agent.disableTraining();
      else this.agent.enableTraining();

      // speed up the game during training
      this.game.pace = this.agent.isTraining ? 0 : this.initialGamePace;
    },
  }
}
</script>