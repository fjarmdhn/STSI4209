Vue.component('status-badge', {
  template: '#tpl-badge',
  props: {
    qty: { type: Number, required: true },
    safety: { type: Number, required: true },
    catatan: { type: String, default: '' }
  },
  data() {
    return {
      showTooltip: false
    };
  },
  computed: {
    statusInfo() {
      if (this.qty === 0) {
        return { label: '🔴 Kosong', cssClass: 'badge-kosong' };
      } else if (this.qty < this.safety) {
        return { label: '⚠️ Menipis', cssClass: 'badge-menipis' };
      } else {
        return { label: '🟢 Aman', cssClass: 'badge-aman' };
      }
    }
  }
});