function showAppAlert(message, type = "info") {
  const existingAlert = document.querySelector(".app-alert-overlay");
  if (existingAlert) {
    existingAlert.remove();
  }

  const overlay = document.createElement("div");
  overlay.className = "app-alert-overlay";

  const dialog = document.createElement("section");
  dialog.className = `app-alert app-alert-${type}`;
  dialog.setAttribute("role", "alertdialog");
  dialog.setAttribute("aria-modal", "true");
  dialog.setAttribute("aria-labelledby", "app-alert-title");
  dialog.setAttribute("aria-describedby", "app-alert-message");

  const title = document.createElement("h2");
  title.id = "app-alert-title";
  title.className = "app-alert-title";
  title.textContent = type === "success" ? "Berhasil" : type === "error" ? "Perhatian" : "Informasi";

  const text = document.createElement("p");
  text.id = "app-alert-message";
  text.className = "app-alert-message";
  text.textContent = message;

  const closeButton = document.createElement("button");
  closeButton.type = "button";
  closeButton.className = "btn btn-primary app-alert-close";
  closeButton.textContent = "Tutup";
  closeButton.addEventListener("click", () => overlay.remove());

  dialog.append(title, text, closeButton);
  overlay.appendChild(dialog);
  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) {
      overlay.remove();
    }
  });
  document.body.appendChild(overlay);
  closeButton.focus();
}

document.addEventListener("keydown", (event) => {
  const alert = document.querySelector(".app-alert-overlay");
  if (event.key === "Escape" && alert) {
    alert.remove();
  }
});

new Vue({
  el: "#app",
  data: {
    pengirimanList: [
      { kode: "REG", nama: "JNE Regular" },
      { kode: "EXP", nama: "JNE Express" },
    ],
    paket: [
      { kode: "PAKET-UT-001", nama: "PAKET IPS Dasar", isi: ["EKMA4116", "EKMA4115"], harga: 120000 },
      { kode: "PAKET-UT-002", nama: "PAKET IPA Dasar", isi: ["BIOL4201", "FISIP4001"], harga: 140000 },
    ],
    tracking: {
      "DO2025-001": {
        nim: "123456789",
        nama: "Rina Wulandari",
        status: "Dalam Perjalanan",
        ekspedisi: "JNE Regular",
        tanggalKirim: "2025-08-25",
        paket: "PAKET-UT-001",
        total: 120000,
        perjalanan: [
          { waktu: "2025-08-25 10:12:20", keterangan: "Penerimaan di Loket: TANGSEL" },
          { waktu: "2025-08-25 14:07:56", keterangan: "Tiba di Hub: JAKSEL" },
        ],
      },
    },

    // State Tracking
    selectedPaketKode: "",
    sequenceNumber: 2,
    searchDONomor: "",
    detailTracking: null,
    searched: false,
    pesanWatcher: "",

    formDO: {
      nim: "",
      nama: "",
      ekspedisi: "",
      tanggalKirim: new Date().toISOString().slice(0, 10),
    },
  },

  computed: {
    // Automatic Sequence DO Generator
    generatedNomorDO() {
      const seqStr = String(this.sequenceNumber).padStart(3, "0");
      return `DO2025-${seqStr}`;
    },

    // Get Object Paket berdasarkan Kode
    selectedPaketObj() {
      return this.paket.find((p) => p.kode === this.selectedPaketKode) || null;
    },
  },

  watch: {
    // Watcher 1: Memantau pemilhan paket DO
    selectedPaketKode(newVal) {
      if (newVal) {
        const pkt = this.selectedPaketObj;
        this.pesanWatcher = `Paket terpilih: ${pkt.nama} (Harga: Rp ${pkt.harga.toLocaleString("id-ID")})`;
      } else {
        this.pesanWatcher = "Silakan pilih Paket Bahan Ajar.";
      }
    },
    // Watcher 2: Memantau pencarian DO
    searchDONomor(newVal) {
      if (newVal === "") {
        this.detailTracking = null;
        this.searched = false;
        this.pesanWatcher = "Pencarian DO dibersihkan.";
      }
    },
  },

  methods: {
    tambahDO() {
      // Validasi Input Sederhana
      if (!this.formDO.nim || !this.formDO.nama || !this.formDO.ekspedisi || !this.selectedPaketKode) {
        showAppAlert("Mohon lengkapi seluruh field input formulir DO!", "error");
        return;
      }

      const noDO = this.generatedNomorDO;
      this.tracking[noDO] = {
        nim: this.formDO.nim,
        nama: this.formDO.nama,
        status: "Diproses di Hub",
        ekspedisi: this.formDO.ekspedisi,
        tanggalKirim: this.formDO.tanggalKirim,
        paket: this.selectedPaketKode,
        total: this.selectedPaketObj ? this.selectedPaketObj.harga : 0,
        perjalanan: [
          {
            waktu: new Date().toLocaleString("sv-SE"),
            keterangan: `Penerimaan DO di Loket UT Pusat. Pengirim: ${this.formDO.nama}`,
          },
        ],
      };

      showAppAlert(`Transaksi berhasil! Nomor DO Anda: ${noDO}`, "success");
      this.sequenceNumber++;

      // Reset Form Input
      this.formDO.nim = "";
      this.formDO.nama = "";
      this.formDO.ekspedisi = "";
      this.selectedPaketKode = "";
    },

    cariTracking() {
      this.searched = true;
      const key = this.searchDONomor.trim();
      if (this.tracking[key]) {
        this.detailTracking = this.tracking[key];
        this.activeDONomor = key;
      } else {
        this.detailTracking = null;
      }
    },
  },
});
