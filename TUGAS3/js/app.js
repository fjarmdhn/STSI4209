new Vue({
  el: '#app',
  data: {
    tab: 'stok',
    isLoading: true,
    toast: {
      show: false,
      message: '',
      type: 'success', // 'success' | 'danger'
      timer: null
    },
    state: {
      upbjjList: [],
      kategoriList: [],
      pengirimanList: [],
      paket: [],
      stok: [],
      tracking: []
    }
  },
  async created() {
    const jsonData = await ApiService.fetchDataBahanAjar();
    this.state = jsonData;
    this.isLoading = false;
  },
  methods: {
    showToast(message, type = 'success') {
      if (this.toast.timer) clearTimeout(this.toast.timer);
      this.toast.message = message;
      this.toast.type = type;
      this.toast.show = true;

      this.toast.timer = setTimeout(() => {
        this.toast.show = false;
      }, 4000);
    },
    handleAddStock(newItem) {
      this.state.stok.push(newItem);
    },
    handleUpdateStock({ index, updated }) {
      if (index !== -1) {
        Vue.set(this.state.stok, index, updated);
      }
    },
    handleRequestDelete({ index, judul, kode }) {
      // Memanggil komponen <app-modal> melalui $refs
      this.$refs.modal.open(
        'Konfirmasi Penghapusan Data',
        `Apakah Anda yakin ingin menghapus bahan ajar "${judul}" (${kode}) dari daftar stok?`,
        () => {
          if (index !== -1) {
            this.state.stok.splice(index, 1);
            this.showToast(`Data bahan ajar "${judul}" berhasil dihapus.`, 'success');
          }
        }
      );
    },
    handleNewDO(newDOEntry) {
      this.state.tracking.push(newDOEntry);
      // Otomatis arahkan ke tab Tracking DO agar mahasiswa/petugas bisa langsung melihat hasilnya
      this.tab = 'tracking';
    },
    handleAddProgress({ index, nomorDO, log }) {
      const targetObj = this.state.tracking[index][nomorDO];
      if (targetObj) {
        targetObj.perjalanan.push(log);
        targetObj.status = 'Dalam Perjalanan (Updated)';
      }
    }
  }
});