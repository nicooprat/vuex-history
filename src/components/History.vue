<script>
import { createStore, subscribe } from '@/store/diff';
import { mapActions, mapState, mapGetters } from 'vuex';

export default {
  props: {
    limit: {
      type: Number,
      default: 20,
    },
    include: {
      type: Function,
      default: () => true,
    },
  },
  beforeCreate() {
    this.$store.registerModule('history', createStore({
      limit: this.$options.propsData.limit,
    }));
  },
  created() {
    subscribe(this.$store, this.include);
  },
  destroyed() {
    this.$store.unregisterModule('history');
  },
  computed: {
    ...mapState('history', ['history', 'cursor']),
    ...mapGetters('history', ['canUndo', 'canRedo']),
  },
  methods: {
    ...mapActions('history', ['undo', 'redo', 'travel', 'reapply']),
  },
  render(h) {
    return h('div', this.$scopedSlots.default({
      history: this.history,
      cursor: this.cursor,
      undo: this.undo,
      redo: this.redo,
      canUndo: this.canUndo,
      canRedo: this.canRedo,
      travel: this.travel,
      reapply: this.reapply,
    }));
  },
};
</script>
