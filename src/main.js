import Vue from 'vue'
import Game from './Game.vue'

Vue.config.productionTip = false

new Vue({
  render: h => h(Game),
}).$mount('#app')