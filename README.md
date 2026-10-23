# game
gamee

---

# Shadow Rift: Last Eclipse — World & Arsenal 2.0

Game action fighter 2D original dan offline untuk browser laptop. Sembilan stage, tiga wilayah, tiga boss, enam peran musuh, dan 12 senjata yang dapat dibeli dan dipakai dalam combat.

## Pembaruan 2.0

- Sembilan lingkungan procedural berbeda, masing-masing tiga lapisan parallax yang mengikuti kamera, partikel lokal, dan transisi masuk stage/boss. Cache dibatasi pada tiga bidang stage aktif; Low effects mengurangi partikel lingkungan dari 36 menjadi 10.
- Enam peran: Stalker menerkam/mundur; Sentinel menjaga depan dan BREAK; Weaver memakai orb/zona; Archer membidik dengan garis telegraph; Assassin melakukan dash untuk flank; Brute berarmor dan menyerang berat. Maksimum tiga musuh per wave. Elite dan boss memberi hadiah ancaman ketika stage dimenangkan.
- Boss mempertahankan fase dan pola lama, ditambah volley bertelegraph pada fase lanjut dan aura berwarna sesuai wilayah/fase.
- Arsenal dapat dibuka dari menu utama, Pause, atau kemenangan. Buy, Equip, inventory, upgrade lima level, ammo/reload, dan sihir memakai transaksi/gameplay nyata. Equip ditolak ketika aksi, stun, cooldown, dash, atau reload masih aktif.
- Save schema 2 memigrasikan schema 1, mempertahankan seluruh progres/settings dan memberikan Rustblade. Nama storage lama dipertahankan agar save terdahulu ditemukan. Inventory dan level divalidasi; backup valid tidak ditimpa data invalid.

## Arsenal dan senjata

Satu senjata aktif. J/K mengikuti kelas; skill U/I/O tetap tersedia pada semua kelas. Sword mempertahankan J → J → K. Gun menggunakan peluru bergerak dan reload otomatis saat kosong atau manual **R**. Magic memakai energi yang sama dengan skill/dash. HUD menampilkan senjata, level, peluru/reload atau biaya energi. Memulai stage mengisi magazen; pergantian equip saat pause tidak memberi isi ulang gratis.

| Kelas | Senjata | Koin | Perilaku |
| --- | --- | ---: | --- |
| Sword | Rustblade | 0 | Seimbang, finisher JJK |
| Sword | Nightfang | 250 | Ayunan cepat, jangkauan pendek |
| Sword | Great Riftblade | 500 | Damage/jangkauan besar, recovery lambat |
| Sword | Eclipse Edge | 1000 | Heavy/finisher melepas tebasan energi |
| Gun | Rift Pistol | 300 | Tembakan tunggal cepat; K memakai dua peluru |
| Gun | Twin Handcannons | 600 | J dua tembakan, K tiga tembakan |
| Gun | Void Rifle | 850 | Peluru cepat menembus hingga tiga target |
| Gun | Eclipse Cannon | 1200 | Ledakan area; K memperluas ledakan |
| Magic | Apprentice Focus | 350 | Bolt hemat energi; K menembus dua target |
| Magic | Storm Staff | 650 | Petir menyambung ke dua target tambahan |
| Magic | Void Grimoire | 900 | Ledakan dan slow sementara |
| Magic | Astral Catalyst | 1300 | Damage tinggi, penetrasi/ledakan, energi mahal |

Upgrade senjata maksimal level 5: +8% damage dan −2,5% waktu serangan per level, tambahan satu kapasitas peluru untuk Gun, serta −5% biaya energi Magic (dibulatkan ke atas). Harga upgrade = 60 + 10% harga senjata + 65 × level saat ini. Harga, damage, recovery, kapasitas, dan efek ada di `js/weapons.js`; aturan transaksi ada di `js/shop.js`. Kartu menampilkan statistik dasar senjata; level karakter dan upgrade Forge juga memengaruhi damage akhir.

## Pembaruan 1.1

- Collision diperbaiki agar dua aktor tidak overlap di dinding arena; musuh yang stun mempertahankan knockback meski di luar layar.
- Menu menampilkan **Resume Battle** jika ada pertarungan aktif di sesi tab yang sama. Membuka menu atau mengeklik logo tidak me-reload game. Setelah browser ditutup, Continue tetap memulai stage tertinggi dari awal.
- Settings tersedia dari Pause. Back/Esc kembali ke Pause tanpa mereset pertarungan. Esc bekerja ketika slider atau pilihan Settings memiliki fokus.
- Sound Off, volume, music off, dan pause langsung mengubah kanal audio, termasuk nada yang sedang berbunyi.
- Satu cadangan save valid sebelumnya disimpan otomatis. Jika save utama rusak/tidak tersedia, game mencoba memulihkan cadangan dan menampilkan pemberitahuan. Jika keduanya rusak, game memakai progres baru yang aman.
- Import file yang selesai setelah pemain meninggalkan Settings diabaikan. Import yang berhasil mengakhiri pertarungan aktif karena progres sudah diganti.
- New Game menghapus progression, tetapi mempertahankan pengaturan audio/visual. Save versi 1.0 tetap kompatibel.

## Mainkan di Windows

1. Ekstrak `Shadow-Rift-Last-Eclipse.zip` dengan **Extract All**.
2. Buka folder hasil ekstraksi.
3. Klik dua kali **RUN-GAME.bat**, atau buka **Shadow-Rift-Last-Eclipse.html** dengan Edge, Chrome, atau Firefox modern.
4. Klik **New Game** untuk mulai; **Continue** melanjutkan ke stage tertinggi yang terbuka (bukan posisi di tengah pertarungan).

HTML tunggal sudah memuat seluruh kode, CSS, grafis Canvas, dan suara sintetis. Tidak membutuhkan internet, CDN, Python, Node, atau instalasi. `index.html` adalah versi modular untuk pengembangan; pertahankan folder `js/` dan `style.css` jika menggunakannya.

Jika browser memblokir file lokal, jalankan `RUN-GAME.bat server` dari Command Prompt. Mode server membutuhkan **Python 3.8+ yang sudah terpasang**, tanpa mengunduh paket. Server mengikat `127.0.0.1:8765` dan membuka browser. Port tetap mempertahankan origin save antar-run. Biarkan terminal terbuka; Ctrl+C menghentikan server. Jika port dipakai, tutup instance server lama terlebih dahulu. Alternatif: `python serve.py`; `--port N` memilih port lain, tetapi save browser pada port lama tidak otomatis berpindah. `--no-browser` mencegah pembukaan browser otomatis.

Launcher BAT disiapkan dengan path terkutip dan CRLF untuk Windows; pengujian runtime dilakukan pada Linux/Chromium, bukan Windows langsung. Browser cloud memblokir navigasi file lokal; isi HTML tunggal diuji secara terisolasi tanpa jaringan.

## Kontrol

| Tombol | Aksi |
| --- | --- |
| A / D | Bergerak dan menghadap kiri/kanan |
| W | Lompat dari tanah |
| J | Serangan utama senjata aktif; Rustblade base damage 15 |
| K | Serangan berat/alternatif; Rustblade base damage 32 |
| R | Reload manual Gun |
| J → J → K | Rift Breaker, finisher base damage 52 |
| L | Dash, 20 energi, cooldown 0,8 detik |
| Space tahan | Block dari depan ketika di tanah |
| U | Rift Lance: jangkauan 300, damage 26, biaya 25, cooldown 4 detik |
| I | Umbral Nova: dua arah, jangkauan 185, damage 38, biaya 40, cooldown 7 detik |
| O | Last Eclipse: dua arah, jangkauan 360, damage 75, biaya 85, cooldown 16 detik |
| Esc | Pause/resume; kembali ke menu dari panel lain |

U tersedia sejak awal. I terbuka setelah menyelesaikan **stage 2**, O setelah **stage 6**. Statistik damage/cooldown dipengaruhi level dan upgrade. Serangan hanya memberi damage jika hitbox menyentuh target; serangan area dapat mengenai beberapa target, masing-masing sekali per ayunan.

Input berulang dari menahan tombol tidak memicu auto-attack. Combo membutuhkan J, J, K dengan jeda antarawal aksi maksimal 1,25 detik. Input gagal tidak memajukan urutan. Satu input J/K boleh diantrikan pada 180 ms terakhir pemulihan. Dash/skill, terkena serangan, input salah, atau jeda terlalu lama memutus combo.

Dash berlangsung 180 ms dengan invulnerability selama 160 ms awal; boleh melewati musuh, tidak batas arena. Block menghabiskan 8 energi/detik dan 14 energi per hit, menurunkan damage biasa menjadi 20%. Block tidak melindungi belakang atau serangan **BREAK**. Guard break memberi stun dan menonaktifkan guard sementara. Regenerasi energi 13/detik setelah jeda 0,65 detik; berhenti saat serangan, stun, dash, atau block. Ultimate memberi invulnerability 0,65 detik sejak aktivasi.

## Campaign

| Stage | Wilayah | Lokasi / boss |
| --- | --- | --- |
| 1 | The Fallen Kingdom | Ashen Village |
| 2 | The Fallen Kingdom | Bloodwood Forest |
| 3 | The Fallen Kingdom | Ruined Citadel — Veyr, the Hollow Crown |
| 4 | The Cursed Abyss | Hollow Temple |
| 5 | The Cursed Abyss | Crystal Catacombs |
| 6 | The Cursed Abyss | Abyss Gate — Nhal, Abyss Keeper |
| 7 | The Eternal Eclipse | Ember Fortress |
| 8 | The Eternal Eclipse | Throne of Shadows |
| 9 | The Eternal Eclipse | The Last Eclipse — Astrael, Eclipse Sovereign |

Tiap stage mempunyai dua wave. Stalker mengejar cepat, Sentinel menyerang berat, Hex Weaver memakai sihir jarak menengah. Musuh hanya memulai serangan ketika terlihat; spawn diberi jeda. Kalahkan seluruh wave untuk membuka stage berikutnya. Antarwave memberi +20 HP dan +25 energi, dibatasi kapasitas maksimum.

Boss memiliki armor yang mencegah stun lock. Veyr memakai heavy strike dan sweep, Nhal menambahkan zona rift di lokasi pemain, Astrael memadukan pola tersebut dengan tiga fase dan zona tambahan pada fase akhir. Indikator merah muncul sebelum serangan; keluar dari zona atau melompat. Dua boss pertama memiliki dua fase; final boss tiga fase. Wilayah memakai palet berbeda, kristal di Abyss, bara di Eclipse, serta pohon Bloodwood.

## Progression, hadiah, dan save

- Kemenangan pertama: stage 1 memberi 70 koin / 90 XP, bertambah 15 koin / 20 XP per stage.
- Hadiah dasar replay hanya 25% koin dan 30% XP (dibulatkan ke bawah). Bonus ancaman musuh dibayarkan setelah stage benar-benar selesai: Stalker 12/8, Sentinel 20/14, Weaver 22/16, Archer 20/14, Assassin 25/18, Brute 40/28 koin/XP; boss 90/60 ditambah 35/20 per wilayah berikutnya. Bonus ini berlaku juga pada replay. Kekalahan tidak memberi hadiah. Settlement menjaga hadiah tidak terulang dalam pertarungan yang sama.
- Level naik setiap 250 XP: setiap level tambahan memberi +4 HP dan +2,5% damage.
- Forge menjual empat upgrade, maksimal 5 tingkat masing-masing: HP +20; damage +12%; energi +15; cooldown skill −8%. Harga mulai 70 koin, naik 50 per tingkat. Berlaku pada pertarungan berikutnya.
- Rank S: tanpa damage dan waktu <120 detik. A: damage diterima <60 dan waktu <160 detik. B: damage <140. Selain itu C. Rank terbaik disimpan per stage.
- Save otomatis setelah kemenangan, upgrade, perubahan settings, dan mulai permainan. Retry mengulang stage dari awal dengan HP/energi penuh. Tidak ada save posisi pertarungan.
- New Game meminta konfirmasi sebelum menghapus progres, dan mempertahankan pengaturan audio/visual. Settings menyediakan **Export Save** / **Import Save** JSON. Import divalidasi; save invalid tidak mengganti progres aktif.
- Save memakai `localStorage` dengan versi/schema, angka terbatas, validasi urutan stage, upgrade, rank, dan settings. Save utama rusak memicu pemulihan cadangan jika tersedia; jika tidak, game menampilkan pemberitahuan dan memakai progres baru yang aman. Data lama tidak ditimpa sampai ada aksi save berikutnya.
- Save terikat browser dan origin/path file. File HTML, versi server, browser lain, atau port lain dapat mempunyai save berbeda. **Export Save sebelum memindahkan/menimpa file atau berpindah browser**, lalu import di lokasi baru. Jika storage ditolak/private mode, game tetap berjalan dan menampilkan peringatan; export manual sebelum menutup.

## Audio dan pengaturan

Klik Sound Off untuk mengaktifkan audio melalui interaksi pengguna. Efek hit dan frase musik ambient original disintesis Web Audio, tanpa berkas musik online. Settings menyediakan volume, music on/off, low/high effects, dan screen shake. Pause/kehilangan fokus membekukan simulasi, regen, cooldown, penjadwalan musik, serta membisukan output audio sampai dilanjutkan. Volume dan music off juga berlaku langsung pada nada yang sedang dimainkan. Exit menyimpan dan menampilkan petunjuk menutup tab karena browser tidak mengizinkan penutupan tab manual melalui script.

## Struktur proyek

- `index.html`, `style.css`: UI dan layout; `Shadow-Rift-Last-Eclipse.html`: hasil bundel mandiri.
- `js/input.js`, `player.js`, `combat.js`: input, gerak, combo, skill, hitbox, damage.
- `js/enemies.js`, `bosses.js`, `stages.js`: AI, fase boss, konfigurasi dan spawn wave.
- `js/progression.js`, `save.js`: reward, rank, upgrade, schema dan persistence.
- `js/backgrounds.js`, `render.js`, `audio.js`: lingkungan, visual procedural dan audio lokal.
- `js/weapons.js`, `shop.js`, `projectiles.js`: katalog, transaksi dan proyektil dengan swept collision.
- `js/ui.js`, `game.js`: menu dan loop simulasi fixed step 120 Hz; delta frame dibatasi, objek mati/efek dibersihkan dan partikel dibatasi.
- `RUN-GAME.bat`, `serve.py`: launcher dan server opsional.
- `tests/*.test.cjs`, `tests/browser-smoke.cjs`: tes unit dan campaign browser.
- `tools/package.py`: bundel HTML dan ZIP; `MANIFEST.json` di ZIP memuat SHA-256 seluruh file.

Tidak ada dependensi runtime. Classic scripts berbagi namespace `SR` agar tidak memerlukan server ES modules. Setelah mengubah source, jalankan `python tools/package.py --output ../exports` untuk memperbarui HTML tunggal dan ZIP.

## Pengujian

```sh
node --test tests/*.test.cjs
```

Browser smoke opsional memerlukan Playwright dan Chromium, terpisah dari runtime:

```sh
node tests/browser-smoke.cjs http://127.0.0.1:8765
node tests/browser-reliability.cjs http://127.0.0.1:8765
node tests/browser-backgrounds.cjs http://127.0.0.1:8765
node tests/browser-arsenal.cjs http://127.0.0.1:8765
node tests/browser-classes.cjs http://127.0.0.1:8765
```

`SR_PLAYWRIGHT` menunjuk modul Playwright eksternal; `SR_CHROMIUM_PATH` menunjuk executable Chromium. `SR_STANDALONE` menunjuk HTML tunggal untuk tes via setContent dengan jaringan dimatikan sejak awal; storage about:blank tidak tersedia sehingga pengujian persistence dilakukan pada versi server. `SR_SCREENSHOT` opsional menentukan output screenshot.

Tes browser menjalankan kontrol, sembilan stage dengan input biasa dan pembelian upgrade yang sah, klik Next Stage, ketiga fase final boss, hadiah satu kali, kalah/retry, stage select, settings, export/import valid/invalid, dan pembatalan New Game. Versi server diuji reload save, pemulihan cadangan, serta penanganan ketika kedua save rusak. Runner reliability memeriksa menu/resume, Settings saat pause, kanal audio, import asynchronous yang terlambat, dan preferensi setelah New Game. Bot tidak mengubah HP, damage, atau status unlock. Runner classes menyelesaikan sembilan stage dengan Rustblade sebelum membeli Pistol/Focus dari hadiah sah, lalu memakai kelas itu hingga boss akhir bersama skill/Forge. Runner Arsenal memakai saldo fixture untuk memeriksa UI transaksi, reload, equip, dan persistence. Tes unit mencakup 12 senjata, migration, backup, ekonomi, hit detection, dan batas arena. Ini smoke test fungsional; bukan benchmark semua laptop atau pengujian semua versi browser Windows.

## Troubleshooting

- Layar kosong: ekstrak seluruh ZIP, gunakan browser modern, pastikan JavaScript diizinkan. Alternatif gunakan HTML tunggal atau server lokal.
- Kontrol tidak bekerja: klik arena atau Lanjutkan. Gunakan keyboard fisik; tidak ada kontrol sentuh.
- Skill terkunci: selesaikan stage 2 untuk I, stage 6 untuk O. Lepaskan block dan periksa energi/cooldown.
- Boss terasa kebal: boss tetap menerima damage tetapi tidak terkena stun lock. Perhatikan bar HP, tanda BREAK dan zona merah.
- Save hilang: gunakan browser, path, dan port yang sama; import backup. Jangan mengandalkan private mode untuk save permanen.
- Suara tidak terdengar: aktifkan tombol Sound, cek volume Settings, browser, dan sistem.
- Frame lambat: pilih Low effects, matikan screen shake, tutup tab berat. Musik/visual memakai aset procedural, bukan sprite animasi atau soundtrack rekaman.
