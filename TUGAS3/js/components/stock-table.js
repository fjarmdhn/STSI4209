Vue.component('ba-stock-table', {
  template: '#tpl-stock',
  props: {
    items: { type: Array, required: true },
    upbjjList: { type: Array, required: true },
    kategoriList: { type: Array, required: true }
  },
  data() {
    return {
      filterUpbjj: '',
      filterKategori: '',
      onlyReorder: false,
      sortBy: 'judul',
      watcherNotif: '',
      // Form Tambah Data Baru
      newItem: {
        kode: '',
        judul: '',
        kategori: '',
        upbjj: '',
        lokasiRak: '',
        harga: '',
        qty: '',
        safety: '',
        catatanHTML: ''
      },
      // State Edit Inline / Form Update
      editingIndex: null,
      editItem: {}
    };
  },
  filters: {
    rupiah(val) {
      if (val === null || val === undefined || val === '') return 'Rp 0';
      return 'Rp ' + Number(val).toLocaleString('id-ID');
    },
    satuanBuah(val) {
      return `${val} buah`;
    }
  },
  computed: {
    // Computed otomatis meng-cache hasil filter & sort (tidak recompute jika dependensi tidak berubah)
    processedStock() {
      let result = this.items.slice();

      // 1. Filter UT-Daerah
      if (this.filterUpbjj) {
        result = result.filter(item => item.upbjj === this.filterUpbjj);
      }

      // 2. Dependent Filter Kategori (hanya aktif jika filterUpbjj terpilih)
      if (this.filterUpbjj && this.filterKategori) {
        result = result.filter(item => item.kategori === this.filterKategori);
      }

      // 3. Filter Re-order (qty < safety atau qty === 0)
      if (this.onlyReorder) {
        result = result.filter(item => item.qty < item.safety || item.qty === 0);
      }

      // 4. Sorting (judul, stock, harga)
      result.sort((a, b) => {
        if (this.sortBy === 'judul') {
          return a.judul.localeCompare(b.judul);
        } else if (this.sortBy === 'stock') {
          return a.qty - b.qty;
        } else if (this.sortBy === 'harga') {
          return a.harga - b.harga;
        }
        return 0;
      });

      return result;
    }
  },
  watch: {
    // Watcher 1: Reset kategori jika pilihan UT-Daerah berubah atau dikosongkan
    filterUpbjj(newVal, oldVal) {
      if (newVal !== oldVal) {
        this.filterKategori = '';
        this.watcherNotif = newVal
          ? `Filter wilayah aktif: UT ${newVal}. Silakan pilih sub-filter Kategori jika diperlukan.`
          : '';
      }
    },
    // Watcher 2: Deep watcher untuk memantau stok kosong pada array items
    items: {
      deep: true,
      handler(newItems) {
        const kosongCount = newItems.filter(i => i.qty === 0).length;
        if (kosongCount > 0) {
          this.watcherNotif = `Peringatan Sistem: Terdapat ${kosongCount} mata kuliah dengan stok KOSONG (0 buah). Segera lakukan re-order!`;
        }
      }
    }
  },
  methods: {
    resetFilters() {
      this.filterUpbjj = '';
      this.filterKategori = '';
      this.onlyReorder = false;
      this.sortBy = 'judul';
      this.watcherNotif = '';
    },
    addStock() {
      // Validasi JavaScript dengan pesan alert bahasa Indonesia
      const f = this.newItem;
      if (!f.kode.trim() || !f.judul.trim() || !f.kategori || !f.upbjj || !f.lokasiRak.trim()) {
        alert('Validasi Gagal: Kode MK, Judul, Kategori, UT-Daerah, dan Lokasi Rak wajib diisi!');
        return;
      }
      if (f.harga === '' || Number(f.harga) < 0 || f.qty === '' || Number(f.qty) < 0 || f.safety === '' || Number(f.safety) < 0) {
        alert('Validasi Gagal: Harga, Jumlah Stok, dan Safety Stok harus berupa angka valid (minimal 0)!');
        return;
      }

      this.$emit('add-stock', {
        kode: f.kode.trim().toUpperCase(),
        judul: f.judul.trim(),
        kategori: f.kategori,
        upbjj: f.upbjj,
        lokasiRak: f.lokasiRak.trim().toUpperCase(),
        harga: Number(f.harga),
        qty: Number(f.qty),
        safety: Number(f.safety),
        catatanHTML: f.catatanHTML.trim() || '<em>Tidak ada catatan</em>'
      });

      alert(`Berhasil! Bahan ajar "${f.judul}" telah ditambahkan ke daftar stok.`);

      // Reset form
      this.newItem = {
        kode: '', judul: '', kategori: '', upbjj: '', lokasiRak: '',
        harga: '', qty: '', safety: '', catatanHTML: ''
      };
    },
    startEdit(item) {
      // Cari index asli pada array items
      const realIndex = this.items.findIndex(i => i.kode === item.kode && i.upbjj === item.upbjj);
      this.editingIndex = realIndex;
      this.editItem = Object.assign({}, item);
    },
    cancelEdit() {
      this.editingIndex = null;
      this.editItem = {};
    },
    saveEdit() {
      if (!this.editItem.judul.trim() || !this.editItem.lokasiRak.trim()) {
        alert('Validasi Gagal: Judul dan Lokasi Rak tidak boleh kosong!');
        return;
      }
      if (Number(this.editItem.qty) < 0 || Number(this.editItem.safety) < 0 || Number(this.editItem.harga) < 0) {
        alert('Validasi Gagal: Harga, Stok, dan Safety Stok tidak boleh bernilai negatif!');
        return;
      }

      this.$emit('update-stock', {
        index: this.editingIndex,
        updated: {
          ...this.editItem,
          harga: Number(this.editItem.harga),
          qty: Number(this.editItem.qty),
          safety: Number(this.editItem.safety)
        }
      });

      alert(`Berhasil! Data bahan ajar "${this.editItem.judul}" telah diperbarui.`);
      this.cancelEdit();
    },
    confirmDelete(item) {
      const realIndex = this.items.findIndex(i => i.kode === item.kode && i.upbjj === item.upbjj);
      this.$emit('request-delete', {
        index: realIndex,
        judul: item.judul,
        kode: item.kode
      });
    }
  }
});