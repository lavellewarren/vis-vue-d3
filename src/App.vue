<template>
  <div id="app">
    <div class="container-fluid">
      <div class="row">
        <div class="col-md-12">
          <YearSlider/>
        </div>
      </div>
      <ScatterplotAndChoroplethMap />
    </div>
  </div>
</template>

<script>
import ScatterplotAndChoroplethMap from './components/ScatterplotAndChoroplethMap.vue';
import YearSlider from './components/YearSlider.vue';

export default {
  name: 'App',
  components: {
    ScatterplotAndChoroplethMap, YearSlider
  },
  mounted() {
    this.$store.dispatch('loadData');
  },
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 20px;
}
</style>
