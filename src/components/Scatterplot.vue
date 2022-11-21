<template>
  <div class="vis-component" ref="chart">
    <div class="placeholder"><b>Here comes the scatterplot</b>.</div>
    <svg id="main-svg" :width="svgWidth" :height="svgHeight">
      <g class="chart-group" ref="chartGroup">
        <g class="axis axis-x" ref="axisX"></g>
        <g class="axis axis-y" ref="axisY"></g>
        <g class="rect-group" ref="rectGroup"></g>
        <g class="circle-group" ref="circleGroup"></g>
        <g class="brush" ref="brush"></g>
      </g>
    </svg>
  </div>
</template>

<script>
import * as d3 from "d3";

export default {
  name: "Scatterplot",
  props: {},
  data() {
    return {
      svgWidth: 0,
      svgHeight: 350,
      svgPadding: {
        top: 10,
        right: 15,
        bottom: 40,
        left: 75,
      },
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
    xScaleRange() {
      return [0, this.svgWidth - this.svgPadding.left - this.svgPadding.right];
    },
    yScaleRange() {
      return [this.svgHeight - this.svgPadding.top - this.svgPadding.bottom, 0];
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
      if (this.$refs.chart) this.svgWidth = this.$refs.chart.clientWidth;
      d3.select(this.$refs.chartGroup).attr(
        "transform",
        `translate(${this.svgPadding.left},${this.svgPadding.top})`
      );
      this.drawXAxis();
      this.drawYAxis();
      this.drawCircles();
      this.drawRects();
    },
    drawXAxis() {
      d3.select(this.$refs.axisX)
        .attr(
          "transform",
          `translate( 0, ${this.svgHeight -
            this.svgPadding.top -
            this.svgPadding.bottom} )`
        )
        .call(
          d3.axisBottom(d3.scaleLinear().range(this.xScaleRange))
          // .tickFormat(d3.format("$.2s"))
        )
        .append("text")
        .attr("x", this.svgWidth - this.svgPadding.left - this.svgPadding.right)
        .attr("y", 35)
        .style("text-anchor", "end")
        .style("fill", "#000")
        .style("font-weight", "bold")
        .text("Median household income");
    },
    drawYAxis() {
      d3.select(this.$refs.axisY)
        .call(
          d3.axisLeft(d3.scaleLinear().range(this.yScaleRange))
          // .tickFormat(d3.format(".0%"))
        )
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", 0)
        .attr("y", -40)
        .style("text-anchor", "end")
        .style("fill", "#000")
        .style("font-weight", "bold")
        .text("Obesity rate");
    },
    drawCircles() {
      if (this.ratesAndIncomes.length === 0) return;

      var vm = this;
      const x = d3.scaleLinear().range(this.xScaleRange);
      const y = d3.scaleLinear().range(this.yScaleRange);
      x.domain(
        d3.extent(this.ratesAndIncomes, function(d) {
          return d.rate;
        })
      ).nice();
      y.domain(
        d3.extent(this.ratesAndIncomes, function(d) {
          return d.income;
        })
      ).nice();

      const circle = d3
        .select(this.$refs.circleGroup)
        .selectAll("circle")
        .data(this.ratesAndIncomes, function(d) {
          return d.state;
        });
      circle.exit().remove();
      circle
        .enter()
        .append("circle")
        .attr("r", 4)
        .style("stroke", "#fff")
        .merge(circle)
        .attr("cx", function(d) {
          return x(d.rate);
        })
        .attr("cy", function(d) {
          return y(d.income);
        })
        .style("fill", function(d) {
          return vm.bivariateColor(d.rate, d.income);
        })
        .style("opacity", function(d) {
          return d.filtered ? 0.5 : 1;
        })
        .style("stroke-width", function(d) {
          return d.filtered ? 1 : 2;
        });
    },
    drawRects() {
      if (this.ratesAndIncomes.length === 0) return;

      var vm = this;
      const x = d3.scaleLinear().range(this.xScaleRange);
      const y = d3.scaleLinear().range(this.yScaleRange);
      x.domain(
        d3.extent(this.ratesAndIncomes, function(d) {
          return d.rate;
        })
      ).nice();
      y.domain(
        d3.extent(this.ratesAndIncomes, function(d) {
          return d.income;
        })
      ).nice();

      const xRectPairs = d3.pairs(
        d3.merge([[x.domain()[0]], vm.xColor.domain(), [x.domain()[1]]])
      );
      const yRectPairs = d3.pairs(
        d3.merge([[y.domain()[0]], vm.yColor.domain(), [y.domain()[1]]])
      );

      xRectPairs.forEach((xd) => {
        yRectPairs.forEach((yd) => {
          d3.select(this.$refs.rectGroup)
            .append("rect")
            .attr("x", x(xd[0]))
            .attr("width", x(xd[1]) - x(xd[0]))
            .attr("y", y(yd[1]))
            .attr("height", y(yd[0]) - y(yd[1]))
            .style("fill", vm.bivariateColor(xd[0], yd[0]));
        });
      });
    },
  },
};
</script>

<style></style>
