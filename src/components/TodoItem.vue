<template>
  <li class="todo" :class="{ completed: todo.done, editing: editing }">
    <div class="view">
      <input
        type="checkbox"
        class="toggle"
        :checked="todo.done"
        @change="toggleTodo(todo);"
      />
      <label v-text="todo.text" @dblclick="editing = true;"></label>
      <button class="destroy" @click="removeTodo(todo);"></button>
    </div>

    <input
      class="edit"
      v-show="editing"
      v-focus="editing"
      :value="todo.text"
      @keyup.enter="doneEdit"
      @keyup.esc="cancelEdit"
      @blur="doneEdit"
    />
  </li>
</template>

<script>
import { mapActions } from "vuex";
export default {
  name: "Todo",

  props: ["todo"],

  data() {
    return {
      editing: false
    };
  },

  directives: {
    focus(el, { value }, { context }) {
      // el, binding, vnode
      if (value) {
        context.$nextTick(() => {
          // vue中DOM更新是异步的，改变数据不是立刻重新渲染
          // created里面进行DOM操作就要放在nextTick中
          // 此处editing在dblclick之后变成true，让input显示，发生DOM变化，所以要放nextTick保证在DOM生成后再focus
          el.focus();
        });

        // await context.$nextTick()
        // el.focus()
      }
    }
  },

  methods: {
    ...mapActions(["editTodo", "toggleTodo", "removeTodo"]),

    doneEdit(e) {
      const value = e.target.value.trim();
      const { todo } = this;
      if (!value) {
        this.removeTodo(todo);
      } else if (this.editing) {
        this.editTodo({
          todo,
          value
        });
        this.editing = false;
      }
    },

    cancelEdit(e) {
      e.target.value = this.todo.text; // ul事件委托，e.target指向触发事件的元素<li>, e.currentTarget和this指向绑定事件的元素<ul>
      this.editing = false;
    }
  }
};
</script>
