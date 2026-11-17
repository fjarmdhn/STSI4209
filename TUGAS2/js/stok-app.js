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
    upbjjList: ["Jakarta", "Surabaya", "Makassar", "Padang", "Denpasar"],
    kategoriList: ["MK Wajib", "MK Pilihan", "Praktikum", "Problem-Based"],
    stok: [
      {
        kode: "EKMA4116",
        judul: "Pengantar Manajemen",
        kategori: "MK Wajib",
        upbjj: "Jakarta",
        lokasiRak: "R1-A3",
        harga: 65000,
        qty: 28,
        safety: 20,
        catatanHTML: "<em>Edisi 2024, cetak ulang</em>",
      },
      {
        kode: "EKMA4115",
        judul: "Pengantar Akuntansi",
        kategori: "MK Wajib",
        upbjj: "Jakarta",
        lokasiRak: "R1-A4",
        harga: 60000,
        qty: 7,
        safety: 15,
        catatanHTML: "<strong>Cover baru</strong>",
      },
      {
        kode: "BIOL4201",
        judul: "Biologi Umum (Praktikum)",
        kategori: "Praktikum",
        upbjj: "Surabaya",
        lokasiRak: "R3-B2",
        harga: 80000,
        qty: 12,
        safety: 10,
        catatanHTML: "Butuh <u>pendingin</u> untuk kit basah",
      },
      {
        kode: "FISIP4001",
        judul: "Dasar-Dasar Sosiologi",
        kategori: "MK Pilihan",
        upbjj: "Makassar",
        lokasiRak: "R2-C1",
        harga: 55000,
        qty: 2,
        safety: 8,
        catatanHTML: "Stok <i>menipis</i>, prioritaskan reorder",
      },
    ],
    // State Filter & Sort
    selectedUpbjj: "",
    selectedKategori: "",
    filterReorder: "all",
    sortBy: "judul",

    // State Edit & Form Tambah
    editIndex: null,
    pesanWatcher: "",
    formBaru: {
      kode: "",
      judul: "",
      kategori: "",
      upbjj: "",
      lokasiRak: "",
      harga: "",
      qty: "",
      safety: "",
      catatanHTML: "",
    },
  },

  computed: {
    stokFilteredAndSorted() {
      let result = this.stok.filter((item) => {
        if (this.selectedUpbjj && item.upbjj !== this.selectedUpbjj) return false;
        if (this.selectedUpbjj && this.selectedKategori && item.kategori !== this.selectedKategori) return false;

        if (this.filterReorder === "below_safety") {
          return item.qty < item.safety;
        } else if (this.filterReorder === "empty") {
          return item.qty === 0;
        }
        return true;
      });

      return result.sort((a, b) => {
        if (this.sortBy === "judul") {
          return a.judul.localeCompare(b.judul);
        } else if (this.sortBy === "qty") {
          return a.qty - b.qty;
        } else if (this.sortBy === "harga") {
          return a.harga - b.harga;
        }
        return 0;
      });
    },
  },

  watch: {
    selectedUpbjj(newVal) {
      if (!newVal) {
        this.selectedKategori = "";
        this.pesanWatcher = "Filter UPBJJ dibersihkan. Kategori di-reset.";
      } else {
        this.pesanWatcher = `Filter diterapkan untuk UPBJJ ${newVal}. Kategori sekarang aktif.`;
      }
    },
    stok: {
      handler(newStok) {
        const itemKosong = newStok.filter((i) => i.qty === 0).length;
        if (itemKosong > 0) {
          this.pesanWatcher = `Peringatan stok: Terdeteksi ${itemKosong} mata kuliah dengan stok KOSONG!`;
        }
      },
      deep: true,
    },
  },

  methods: {
    resetFilter() {
      this.selectedUpbjj = "";
      this.selectedKategori = "";
      this.filterReorder = "all";
      this.sortBy = "judul";
      this.pesanWatcher = "Seluruh filter dan kriteria pengurutan telah di-reset.";
    },

    tambahStok() {
      if (!this.formBaru.kode || !this.formBaru.judul || !this.formBaru.upbjj) {
        showAppAlert("Mohon lengkapi Kode, Judul, dan UPBJJ terlebih dahulu!", "error");
        return;
      }
      if (this.formBaru.harga <= 0 || this.formBaru.qty < 0) {
        showAppAlert("Harga dan Qty harus berisi angka positif yang valid!", "error");
        return;
      }

      this.stok.push({ ...this.formBaru });

      this.formBaru = {
        kode: "",
        judul: "",
        kategori: "",
        upbjj: "",
        lokasiRak: "",
        harga: "",
        qty: "",
        safety: "",
        catatanHTML: "",
      };
      showAppAlert("Bahan Ajar baru berhasil ditambahkan!", "success");
    },
  },
});
