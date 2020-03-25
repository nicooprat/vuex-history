import { STORAGE_KEY } from "./mutations";
import createLogger from "./plugins/logger";

const localStoragePlugin = store => {
  store.subscribe((mutation, { todos }) => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  });
};

export default [createLogger(), localStoragePlugin];
