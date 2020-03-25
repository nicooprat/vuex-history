import Vue from "vue";
import Vuex from "vuex";
import { mutations } from "./mutations";
import actions from "./actions";
import plugin from "./plugin";

import { cloneDeep, uniqueId } from "lodash";
import { diff, revertChange } from "deep-diff";

Vue.use(Vuex);

const myPlugin = store => {
  const history = {};

  window.test = history;

  store.registerModule("history", {
    namespaced: true,
    state: {
      history: []
    },
    actions: {
      write: ({ state, commit }, patch) => {
        const id = uniqueId();
        history[id] = patch;
        commit("WRITE", id);
      },
      revert: (
        { state, commit },
        id = state.history[state.history.length - 1]
      ) => {
        const patch = history[id];
        commit("REVERT", patch);
        commit("ERASE", id);
      }
    },
    mutations: {
      WRITE(state, id) {
        state.history.push(id);
      },
      ERASE(state, id) {
        const index = state.history.findIndex(value => value === id);
        state.history.splice(index, 1);
      },
      REVERT(state, patch) {
        patch.forEach(change => revertChange(store.state, true, change));
      }
    }
  });

  store.subscribe((mutation, newState) => {
    if (!mutation.type.startsWith("history/")) {
      const patch = diff(oldState, newState);
      if (patch) {
        store.dispatch("history/write", patch);
      }
    }
    oldState = cloneDeep(newState);
  });

  let oldState = cloneDeep(store.state);
};

export default new Vuex.Store({
  plugins: [myPlugin],
  state: {
    todos: []
  },
  mutations,
  actions,
  plugin
});
