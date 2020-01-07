<template>
  <div class="text-lg xl:text-2xl text-gray-600 font-medium text-center">
    <span class="p-3">Game {{ round }}</span>
    <span class="p-3">Score 
      <transition name="pulse" mode="out-in">
        <span :key="score" :class="scoreCssClass" class="inline-block">{{ score }}</span>
      </transition> 
    </span>
  </div>
</template>

<script>
export default {
  name: 'GameScore',
  props: ['score', 'round'],
  computed: {
    scoreCssClass() {
      return this.score >= 0 ? 'text-green-600': 'text-red-600';
    }
  }
}
</script>

<style>
.pulse-enter-active, .pulse-leave-active  {
  transition: all 0.1s;
}

.pulse-enter, .pulse-leave-to {
  transform: scale(1.1);
}
</style>