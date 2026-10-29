document.addEventListener("DOMContentLoaded", function () {
  // 1. Logika Login
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      const user = dataPengguna.find((u) => u.email === email && u.password === password);

      if (user) {
        localStorage.setItem("userLoggedIn", user.nama);
        window.location.href = "dashboard.html";
      } else {
        alert("email/password yang anda masukkan salah");
      }
    });
  }

  // 2. Greeting Berdasarkan Waktu
  const greetingText = document.getElementById("greetingText");
  if (greetingText) {
    const hour = new Date().getHours();
    let greeting = "Selamat Malam";
    if (hour >= 5 && hour < 11) greeting = "Selamat Pagi";
    else if (hour >= 11 && hour < 15) greeting = "Selamat Siang";
    else if (hour >= 15 && hour < 18) greeting = "Selamat Sore";

    const userName = localStorage.getItem("userLoggedIn") || "Pengguna";
    greetingText.textContent = `${greeting}, ${userName}`;
  }

  // 3. Menampilkan Stok Bahan Ajar
  const stokGrid = document.getElementById("stokGrid");
  if (stokGrid) {
    renderStokGrid();

    const formTambahStok = document.getElementById("formTambahStok");
    formTambahStok.addEventListener("submit", function (e) {
      e.preventDefault();
      const newItem = {
        kodeLokasi: document.getElementById("kodeLokasi").value,
        kodeBarang: document.getElementById("kodeBarang").value,
        namaBarang: document.getElementById("namaBarang").value,
        jenisBarang: document.getElementById("jenisBarang").value,
        edisi: document.getElementById("edisi").value,
        stok: parseInt(document.getElementById("stok").value),
        cover: "img/pengantar_komunikasi.jpg", // default cover
      };

      dataBahanAjar.push(newItem);
      renderStokGrid();
      formTambahStok.reset();
      alert("Data bahan ajar berhasil ditambahkan!");
    });
  }
});

function renderStokGrid() {
  const stokGrid = document.getElementById("stokGrid");
  stokGrid.innerHTML = "";
  dataBahanAjar.forEach((item) => {
    const card = document.createElement("div");
    card.className = "grid-card";
    card.innerHTML = `
      <img src="${item.cover}" alt="${item.namaBarang}" onerror="this.src='assets/logo-ut.png'">
      <h4 style="margin: 10px 0;">${item.namaBarang}</h4>
      <p><small>Kode Lokasi: ${item.kodeLokasi}</small></p>
      <p><small>Kode Barang: ${item.kodeBarang}</small></p>
      <p><small>Jenis: ${item.jenisBarang} | Edisi: ${item.edisi}</small></p>
      <p><strong>Stok: ${item.stok}</strong></p>
    `;
    stokGrid.appendChild(card);
  });
}

// 4. Modal Functions
function openModal(id) {
  document.getElementById(id).style.display = "flex";
}

function closeModal(id) {
  document.getElementById(id).style.display = "none";
}

// 5. Tracking Function
function cariTracking() {
  const nomorDO = document.getElementById("nomorDO").value.trim();
  const trackingResult = document.getElementById("trackingResult");

  if (dataTracking[nomorDO]) {
    const data = dataTracking[nomorDO];
    document.getElementById("namaMahasiswa").textContent = `Nama: ${data.nama}`;
    document.getElementById("statusPengiriman").textContent = data.status;
    document.getElementById("ekspedisi").textContent = data.ekspedisi;
    document.getElementById("tanggalKirim").textContent = data.tanggalKirim;
    document.getElementById("jenisPaket").textContent = data.paket;
    document.getElementById("totalPembayaran").textContent = data.total;

    const riwayatList = document.getElementById("riwayatPerjalanan");
    riwayatList.innerHTML = "";
    data.perjalanan.forEach((p) => {
      const li = document.createElement("li");
      li.textContent = `[${p.waktu}] ${p.keterangan}`;
      riwayatList.appendChild(li);
    });

    trackingResult.style.display = "block";
  } else {
    alert("Nomor Delivery Order tidak ditemukan!");
    trackingResult.style.display = "none";
  }
}
