Vue.component('order-form', {
  template: '#tpl-order',
  props: {
    paket: { type: Array, required: true },
    ekspedisi: { type: Array, required: true },
    trackingCount: { type: Number, required: true }
  },
  data() {
    return {
      nim: '',
      nama: '',
      selectedEkspedisi: '',
      selectedPaketKode: '',
      tanggalInput: this.getTodayISO()
    };
  },
  filters: {
    rupiah(val) {
      if (!val) return 'Rp 0';
      return 'Rp ' + Number(val).toLocaleString('id-ID');
    }
  },
  computed: {
    // Generate Nomor DO otomatis: DO[TahunBerjalan]-[Sequence 3 digit]
    autoNomorDO() {
      const year = new Date().getFullYear();
      const nextSeq = String(this.trackingCount + 1).padStart(3, '0');
      return `DO${year}-${nextSeq}`;
    },
    selectedPaketObj() {
      return this.paket.find(p => p.kode === this.selectedPaketKode) || null;
    },
    formattedTanggalKirim() {
      if (!this.tanggalInput) return '-';
      const bulanIndo = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
      ];
      const d = new Date(this.tanggalInput);
      if (isNaN(d.getTime())) return this.tanggalInput;
      return `${d.getDate()} ${bulanIndo[d.getMonth()]} ${d.getFullYear()}`;
    }
  },
  methods: {
    getTodayISO() {
      const now = new Date();
      return now.toISOString().split('T')[0];
    },
    submitOrder() {
      if (!this.nim.trim() || !this.nama.trim()) {
        this.$emit('notify', 'Validasi Gagal: NIM dan Nama Mahasiswa wajib diisi!', 'danger');
        return;
      }
      if (!/^\d+$/.test(this.nim.trim())) {
        this.$emit('notify', 'Validasi Gagal: NIM harus berupa angka!', 'danger');
        return;
      }
      if (!this.selectedEkspedisi) {
        this.$emit('notify', 'Validasi Gagal: Silakan pilih layanan Ekspedisi terlebih dahulu!', 'danger');
        return;
      }
      if (!this.selectedPaketObj) {
        this.$emit('notify', 'Validasi Gagal: Silakan pilih Paket Bahan Ajar terlebih dahulu!', 'danger');
        return;
      }

      const now = new Date();
      const pad = n => String(n).padStart(2, '0');
      const timestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

      const nomorDibuat = this.autoNomorDO;
      const newDOEntry = {};
      newDOEntry[nomorDibuat] = {
        nim: this.nim.trim(),
        nama: this.nama.trim(),
        status: 'Pesanan Dibuat',
        ekspedisi: this.selectedEkspedisi,
        tanggalKirim: this.formattedTanggalKirim,
        paket: this.selectedPaketObj.kode,
        total: this.selectedPaketObj.harga,
        perjalanan: [
          {
            waktu: timestamp,
            keterangan: `Penerimaan Order Baru di Loket UT (${this.selectedEkspedisi})`
          }
        ]
      };

      this.$emit('created', newDOEntry);
      this.$emit('notify', `Berhasil! Pesanan Delivery Order dengan nomor ${nomorDibuat} telah dibuat.`, 'success');

      // Reset formulir
      this.nim = '';
      this.nama = '';
      this.selectedEkspedisi = '';
      this.selectedPaketKode = '';
      this.tanggalInput = this.getTodayISO();
    }
  }
});