import Vue from 'vue';
import { cloneDeep, uniqueId } from 'lodash';
import { diff, revertChange, applyChange } from 'deep-diff';

export default ({
  limit = 20,
  include = null,
  exclude = null,
} = {}) => (store) => {
  store.registerModule('history', {
    namespaced: true,
    state: {
      patches: {},
      history: [],
      cursor: -1,
    },
    actions: {
      write({ state, commit }, patch) {
        const id = uniqueId();
        commit('ERASE_FUTURE');
        commit('ADD_PATCH', { id, patch });
        commit('WRITE', id);
        commit('SET_CURSOR', state.history.length - 1);
      },
      revert({ state, commit, getters }, id) {
        const patch = getters.getPatchById(id);
        commit('REVERT', patch);
        commit('SET_CURSOR', state.cursor - 1);
      },
      apply({ state, commit, getters }, id) {
        const patch = getters.getPatchById(id);
        commit('APPLY', patch);
        commit('SET_CURSOR', state.cursor + 1);
      },
      undo({ dispatch, getters }) {
        dispatch('revert', getters.getCurrentPatchId);
      },
      redo({ dispatch, getters }) {
        dispatch('apply', getters.getNextPatchId);
      },
      travel({ state, dispatch }, id) {
        const index = state.history.indexOf(id);
        // Rewind
        if (index < state.cursor) {
          const ids = state.history.slice(index + 1);
          ids.reverse().forEach(i => dispatch('revert', i));
        }
        // Fast forward
        if (index > state.cursor) {
          const ids = state.history.slice(state.cursor + 1, index + 1);
          ids.forEach(i => dispatch('apply', i));
        }
      },
    },
    mutations: {
      SET_CURSOR(state, index) {
        state.cursor = index;
      },
      ADD_PATCH(state, { id, patch }) {
        Vue.set(state.patches, id, patch);
      },
      ERASE_FUTURE(state) {
        state.history.splice(state.cursor + 1);
      },
      WRITE(state, id) {
        state.history.push(id);
        if (state.history.length > limit) {
          state.history.shift();
        }
      },
      REVERT(state, patch) {
        patch.forEach(change => revertChange(store.state, true, change));
      },
      APPLY(state, patch) {
        patch.forEach(change => applyChange(store.state, true, change));
      },
    },
    getters: {
      getCurrentPatchId(state) {
        return state.history[state.cursor];
      },
      getPatchById(state) {
        return id => state.patches[id];
      },
      getNextPatchId(state) {
        return state.history[state.cursor + 1];
      },
      canUndo(state, getters) {
        return !!getters.getCurrentPatchId;
      },
      canRedo(state, getters) {
        return !!getters.getNextPatchId;
      },
    },
  });

  // Watch for state changes
  let oldState = cloneDeep(store.state);
  store.subscribe((mutation, newState) => {
    if (
      !mutation.type.startsWith('history/') &&
      (!exclude || !mutation.type.match(new RegExp(exclude))) &&
      (!include || mutation.type.match(new RegExp(include)))
    ) {
      const patch = diff(oldState, newState);
      if (patch) {
        store.dispatch('history/write', patch);
      }
    }
    oldState = cloneDeep(newState);
  });
};
