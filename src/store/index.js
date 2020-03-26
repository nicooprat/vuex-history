import Vue from 'vue';
import Vuex from 'vuex';
import { mutations } from './mutations';
import actions from './actions';
import plugin from './plugin';
import diff from './diff';

Vue.use(Vuex);

export default new Vuex.Store({
  plugins: [diff({ limit: 10 })],
  state: {
    todos: [],
  },
  mutations,
  actions,
  plugin,
});
