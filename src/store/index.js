import {createStore} from 'vuex';

export const store = createStore({
  state: {
    count: 0,
    entities: []
  },
  mutations: {
    increment(state) {
      state.count++;
    }  
  },
  getters: {
    count(state) {
      return state.count;
    }
  }
});
