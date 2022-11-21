<template>
  <div class="vis-component" ref="chart">
    <div class="placeholder">
      <b>Here comes the choropleth map</b>.
      <p>Selected states by clicking on the bar chart: {{ selectedStates }}</p>
    </div>
    <svg id="main-svg" :width="svgWidth" :height="svgHeight" ref="mainSVG">
      <g class="chart-group" ref="chartGroup">
        <g class="map" ref="map"></g>
      </g>
    </svg>
  </div>
</template>

<script>
import * as d3 from "d3";

export default {
  name: "ChoroplethMap",
  props: {},
  data() {
    return {
      svgWidth: 0,
      svgHeight: 350,
    };
  },
  mounted() {
    this.drawChart();
  },
  computed: {
    ratesAndIncomes: {
      get() {
        return this.$store.getters.ratesAndIncomes;
      },
    },
    selectedStates: {
      get() {
        return this.$store.getters.selectedStates;
      },
    },
    usStatesGeo: {
      get() {
        return this.$store.getters.usStatesGeo;
      },
    },
    xColor() {
      return d3
        .scaleThreshold()
        .domain([600, 1200, 1800])
        .range(["#e8e8e8", "#aed6e0", "#73cfe6", "#37c3e6"]);
    },
    yColor() {
      return d3
        .scaleThreshold()
        .domain([10000, 12000, 16000])
        .range(["#fbb4b9", "#f768a1", "#c51b8a", "#7a0177"]);
    },
  },
  watch: {
    ratesAndIncomes: {
      handler() {
        this.drawChart();
      },
      deep: true,
    },
    usStatesGeo: {
      handler() {
        this.drawChart();
      },
      deep: true,
    },
  },
  methods: {
    bivariateColor(xVal, yVal) {
      const [rA, gA, bA] = this.xColor(xVal)
        .match(/\w\w/g)
        .map((c) => parseInt(c, 16));
      const [rB, gB, bB] = this.yColor(yVal)
        .match(/\w\w/g)
        .map((c) => parseInt(c, 16));
      const r = Math.round(rA + (rB - rA) / 2)
        .toString(16)
        .padStart(2, "0");
      const g = Math.round(gA + (gB - gA) / 2)
        .toString(16)
        .padStart(2, "0");
      const b = Math.round(bA + (bB - bA) / 2)
        .toString(16)
        .padStart(2, "0");
      return "#" + r + g + b;
    },
    drawChart() {


      this.drawMap();
    },
  },
};
</script>

<style></style>
