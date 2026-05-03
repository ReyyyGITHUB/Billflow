# Instructions: Figma to UI Frontend (Billflow - Phase 1)

## 1. Canvas Specification
AI Agent wajib mengikuti ukuran fixed canvas agar hasil export 1:1 dengan desain Figma:
- **Width:** 412px[cite: 1, 3]
- **Height:** 917px[cite: 1, 3]
- **Unit:** Pixels (px)[cite: 1, 3]
- **Font-Family:** 'Roboto', sans-serif (Ensure Google Fonts is integrated in Next.js)[cite: 1, 3]

## 2. Dynamic State Mapping
Bangun sistem sinkronisasi data dengan skema berikut:
- **Input Field (Sidebar):** 
  - `nominal`: Number/String input.
  - `tanggal`: Date/String input.
- **UI Display (Canvas):** 
  - Pastikan element `<span>` atau `<div>` yang menampilkan nominal dan tanggal ter-update secara real-time saat state berubah[cite: 1, 3].

## 3. Implementation Logic
1. **Layouting:** Gunakan Flexbox atau Grid Tailwind untuk meniru layout Figma secara presisi[cite: 1, 3].
2. **Ref Reference:** Gunakan `useRef` pada kontainer Canvas (ID: `receipt-canvas`) untuk keperluan export gambar[cite: 1, 2].
3. **Data Binding:** Pastikan tidak ada hardcoded text pada area dinamis; semua harus bersumber dari state `nominal` dan `tanggal`[cite: 1, 3].

## 4. Export Configuration
- **Library:** `html-to-image`[cite: 1, 3]
- **Scaling:** Gunakan `pixelRatio: 2` untuk memastikan teks Roboto tetap tajam pada ukuran 412x917 saat diunduh sebagai PNG[cite: 1, 2].
- **Filename:** `Billflow-Export-[timestamp].png`[cite: 1, 3]