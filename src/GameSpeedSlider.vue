<template>
  <div class="text-center">
    <h2 class="text-lg xl:text-2xl text-gray-600 font-medium">Game Speed</h2>
    <input type="range" v-model="gameSpeed" min="0" :max="MaxGameSpeed" 
      class="appearance-none w-full max-w-sm h-1 bg-gray-400 rounded outline-none slider-thumb">
  </div>
</template>

<script>
export default {
  name: 'GameSpeedSlider',
  props: ['game'],
  created() {
    this.MaxGameSpeed = 1000;
  },
  computed: {
    gameSpeed: {
      get() {
        return this.MaxGameSpeed - this.game.waitTimeBetweenUpdates;
      },
      set(value) {
        this.game.waitTimeBetweenUpdates = this.MaxGameSpeed - value;
      }
    }
  }
}
</script>

<style lang="scss">
  .slider-thumb::-webkit-slider-thumb {
    appearance: none;
    width: 25px;
    height: 25px;
    border-radius: 50%;
    background: #4299e1;
    cursor: pointer;
  }
  
  .slider-thumb::-webkit-slider-thumb:hover {
    background: #2b6cb0;
  }
</style>