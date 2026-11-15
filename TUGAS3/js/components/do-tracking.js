Vue.component('do-tracking', {
  template: '#tpl-tracking',
  props: {
    data: { type: Array, required: true }
  },
  data() {
    return {
      searchQuery: '',
      submittedQuery: '',
      newKeterangan: ''
    };
  },
  filters: {
    rupiah(val) {
      if (!val) return 'Rp 0';
      return 'Rp ' + Number(val).toLocaleString('id-ID');
    }
  },
  computed: {
    // Meratakan array of objects tracking menjadi daftar yang mudah dicari
    flattenedTracking() {
      const list = [];
      this.data.forEach((entry, idx) => {
        const doNumber = Object.keys(entry)[0];
        if (doNumber) {
          list.push({
            index: idx,
            nomorDO: doNumber,
            detail: entry[doNumber]
          });
        }
      });
      return list;
    },
    searchResults() {
      const q = this.submittedQuery.trim().toLowerCase();
      if (!q) return this.flattenedTracking;
      return this.flattenedTracking.filter(item =>
        item.nomorDO.toLowerCase().includes(q) ||
        item.detail.nim.toLowerCase().includes(q)
      );
    }
  },
  methods: {
    executeSearch() {
      this.submittedQuery = this.searchQuery;
      if (this.searchResults.length === 0) {
        this.$emit('notify', `Data tidak ditemukan untuk pencarian "${this.searchQuery}".`, 'danger');
      } else if (this.searchQuery.trim() !== '') {
        this.$emit('notify', `Ditemukan ${this.searchResults.length} data pengiriman.`, 'success');
      }
    },
    clearSearch() {
      this.searchQuery = '';
      this.submittedQuery = '';
      this.$emit('notify', 'Pencarian DO telah di-reset.', 'success');
    },
    addProgress(item) {
      if (!this.newKeterangan.trim()) {
        this.$emit('notify', 'Validasi Gagal: Keterangan status perjalanan tidak boleh kosong!', 'danger');
        return;
      }

      const now = new Date();
      const pad = n => String(n).padStart(2, '0');
      const waktuLocal = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

      this.$emit('add-progress', {
        index: item.index,
        nomorDO: item.nomorDO,
        log: {
          waktu: waktuLocal,
          keterangan: this.newKeterangan.trim()
        }
      });

      this.$emit('notify', `Berhasil! Status perjalanan untuk ${item.nomorDO} telah ditambahkan.`, 'success');
      this.newKeterangan = '';
    }
  }
});