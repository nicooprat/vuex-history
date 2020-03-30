<script>
import { uniqueId } from 'lodash';
import { mapActions, mapState, mapGetters } from 'vuex';
import createHistory from '@/store/diff';

const id = `history-${uniqueId()}`;

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
  // Need beforeCreate to have vuex mapped
  beforeCreate() {
    const { register, subscribe } = createHistory({
      id,
      store: this.$store,
      limit: this.$options.propsData.limit,
      include: this.$options.propsData.include,
    });
    register();
    this.unsubscribe = subscribe();
  },
  destroyed() {
    this.$store.unregisterModule(id);
    this.unsubscribe();
  },
  computed: {
    ...mapState(id, ['history', 'cursor']),
    ...mapGetters(id, ['canUndo', 'canRedo']),
  },
  methods: {
    ...mapActions(id, ['undo', 'redo', 'travel', 'reapply']),
  },
  render(h) {
    return h('div', this.$scopedSlots.default({
      history: this.history,
      cursor: this.cursor,
      canUndo: this.canUndo,
      canRedo: this.canRedo,
      undo: this.undo,
      redo: this.redo,
      travel: this.travel,
      reapply: this.reapply,
    }));
  },
};
</script>
