import Vue from 'vue';
import Vuex from 'vuex';
import * as d3 from 'd3';

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    selectedYear: 1984,
    selectedStates: [],
    disposablePersonaleIncome: [],
    burglaryRates: [],
    usStatesGeo: {},
  },
  mutations: {
    changeSelectedYear (state, year) {
      state.selectedYear = year;
    },
    changeSelectedState(state, val) {
      state.selectedStates.push(val);
    }
  },
  getters: {
    selectedYear: (state) => state.selectedYear,
    selectedStates: (state) => state.selectedStates,
    usStatesGeo: (state) => state.usStatesGeo,
    disposablePersonaleIncome (state) {
      let result = [];
      for (let i = 0; i < state.disposablePersonaleIncome.length; i++) {
        if (state.selectedYear in state.disposablePersonaleIncome[i]) {
          result.push({
            state: state.disposablePersonaleIncome[i].State,
            value: +state.disposablePersonaleIncome[i][state.selectedYear]
          })
        }
      }
      return result;
    },
    burglaryRates (state) {
      let result = [];
      for (let i = 0; i < state.burglaryRates.length; i++) {
        if (state.selectedYear in state.burglaryRates[i]) {
          result.push({
            state: state.burglaryRates[i].State,
            value: state.burglaryRates[i][state.selectedYear]
          })
        }
      }
      return result;
    },
    ratesAndIncomes(state) {
      const rates = state.burglaryRates.map(row => {
        return {
          state: row.State,
          rate: row[state.selectedYear] ?? undefined
        }
      });
      const incomes = state.disposablePersonaleIncome.map(row => {
        return {
          state: row.State,
          income: row[state.selectedYear] ?? undefined
        }
      });
      const result = rates.map(row => {
        const income = incomes.find(rowIncome => rowIncome.state === row.state)?.income;
        return {
          state: row.state,
          rate: row.rate ? Number(String(row.rate).trim()) : undefined,
          income: income ? Number(String(income).trim()) : undefined
        }
      });
      return result
    }
  },
  actions: {
    loadData({state}) {
      d3.csv('./usa_disposable_personal_income_1984_2014.csv').then((data) => { 
        state.disposablePersonaleIncome = data;
      })

      d3.csv('./usa_burglary_rates_1984-2014.csv').then((data) => { 
        state.burglaryRates = data;
      })

      d3.json('./us-states-geo.json').then((data) => { 
        state.usStatesGeo = data;
      })
    },
  }
})

export default store;
