<template>
  <table class="table-auto text-lg xl:text-2xl text-gray-600 mx-auto">
    <thead>
      <tr>
        <th class="px-4 py-2 font-medium"></th>
        <th class="px-4 py-2 font-medium">Total</th>
        <th class="px-4 py-2 font-medium">Training</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="border px-4 py-2">Elapsed Time, sec</td>
        <td class="border px-4 py-2">{{totalElapsedTime}}</td>
        <td class="border px-4 py-2">{{trainingElapsedTime}}</td>
      </tr>
      <tr class="bg-gray-100">
        <td class="border px-4 py-2">Moves</td>
        <td class="border px-4 py-2">{{totalMoves}}</td>
        <td class="border px-4 py-2">{{trainingMoves}}</td>
      </tr>
      <tr>
        <td class="border px-4 py-2">Average Win Rate, %</td>
        <td class="border px-4 py-2">{{totalWinRate | formatValue}}</td>
        <td class="border px-4 py-2">{{trainingWinRate | formatValue}}</td>
      </tr>
      <tr class="bg-gray-100">
        <td class="border px-4 py-2">Current Win Rate, %</td>
        <td class="border px-4 py-2" colspan="2">{{currentWinRate | formatValue}}</td>
      </tr>
      <tr>
        <td class="border px-4 py-2">Wins in a Row</td>
        <td class="border px-4 py-2">{{totalWinsInRow}}</td>
        <td class="border px-4 py-2">{{trainingWinsInRow}}</td>
      </tr>
      <tr class="bg-gray-100">
        <td class="border px-4 py-2">Exploration Rate, %</td>
        <td class="border px-4 py-2">0</td>
        <td class="border px-4 py-2">{{explorationRate}}</td>
      </tr>
    </tbody>
  </table>
</template>

<script>
export default {
  name: 'GameStats',
  props: ['agent'],
  filters: {
    formatValue: function(value) {
      return isNaN(value) ? 0 : value;
    }
  },
  computed: {
    totalElapsedTime() {
      return Math.round(this.agent.stats.totalElapsedTime / 1000);
    },
    totalMoves() {
      return this.agent.stats.totalMoves;
    },
    totalWinRate() {
      let winRate = this.agent.stats.totalWins / this.agent.stats.totalGames;
      return Math.round(winRate * 100);
    },
    currentWinRate() {
      let wins = this.agent.latestGameResults.reduce((accumulator, currentValue) => accumulator + currentValue);
      let games = this.agent.latestGameResults.length > this.agent.stats.totalGames 
        ? this.agent.stats.totalGames
        : this.agent.latestGameResults.length;
            
      return Math.round(wins / games * 100);
    },
    totalWinsInRow() {
      return this.agent.stats.totalWinsInRow;
    },
    trainingElapsedTime() {
      return Math.round(this.agent.stats.trainingElapsedTime / 1000);
    },
    trainingMoves() {
      return this.agent.stats.trainingMoves;
    },
    trainingWinRate() {
      let winRate = this.agent.stats.trainingWins / this.agent.stats.trainingGames;
      return Math.round(winRate * 100);
    },
    trainingWinsInRow() {
      return this.agent.stats.trainingWinsInRow;
    },
    explorationRate() {
      return Math.round(this.agent.exploration * 100);
    }
  }
}
</script>