<template>
  <div class="grid border-t border-l text-2xl">
    <div class="border-r border-b text-center w-10 h-10" v-for="(item, i) in getCells()" :key="i">{{item}}</div>
  </div>
</template>

<script>
export default {
  name: 'GameField',
  props: ['fieldSize', 'objects'],
  data() {
    return {
      cells: Array(this.fieldSize.width * this.fieldSize.height)
    }
  },
  methods: {
    getCells() {
      // clear the field
      this.cells.fill();
      
      for (let obj of this.objects) {
        let index = obj.position.y * this.fieldSize.width + obj.position.x;
        this.cells[index] = obj.icon;
      }

      return this.cells;
    }
  }
}
</script>

<style lang="scss">
  .grid {
    display: inline-grid;
    grid-template-columns: repeat(10, auto);
  }
</style>