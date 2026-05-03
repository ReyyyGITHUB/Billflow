# Product Requirements Document (PRD) — Billflow

## 1. Overview

### Product Name
**Billflow**

### Product Vision
Menyediakan platform **Visual Templating** yang memungkinkan user memasukkan data mentah (text, angka, tanggal, item transaksi, branding) dan menghasilkan output berupa desain digital berkualitas tinggi yang siap diunduh atau dibagikan dalam format gambar (**PNG/JPG**).

Billflow bertujuan mengubah invoice/receipt tradisional menjadi aset visual yang lebih menarik, modern, dan shareable.

---

# 2. Problem Statement

Pembuatan invoice, receipt, atau nota digital saat ini memiliki beberapa kendala:

- Template terlalu kaku dan sulit dikustomisasi
- Hasil export sering pecah atau blur
- Tidak ada preview real-time
- Branding (logo/custom style) sulit diintegrasikan
- Tools existing terlalu kompleks untuk user non-desainer

Billflow menyelesaikan masalah ini dengan pendekatan:

**Input Data → Live Visual Preview → Export High Quality Asset**

---

# 3. Goals & Success Metrics

## Primary Goals
- User dapat membuat receipt visual dalam < 2 menit
- Preview berjalan real-time tanpa refresh
- Export gambar tetap tajam di social media/mobile share
- Mendukung branding personal/business

## Success Metrics
- Time to first export < 2 menit
- Export success rate > 95%
- User retention template creation > 40%
- Average exports per user > 3 per session

---

# 4. Target Users

### Individual Users
- Freelancer
- Online sellers
- Content creators
- Small business owners

### Business Users
- UMKM
- Cafe/restaurants
- Ecommerce stores
- SaaS businesses yang butuh invoice visual

---

# 5. Core Features

---

## 5.1 Live Editor

Sidebar berisi input fields:

### Inputs:
- Brand Name
- Transaction ID
- Date
- Currency
- Tax
- Notes (optional)

### Behavior
Setiap perubahan harus langsung meng-update tampilan canvas secara instan tanpa refresh halaman.

### Requirements
- Real-time rendering
- Debounced state update untuk performance
- Form validation

---

# 5.2 Dynamic Table

User dapat menambah atau menghapus item transaksi secara dinamis.

### Fields
- Item Name
- Quantity
- Price
- Subtotal

### Actions
- Add row
- Delete row
- Auto calculate subtotal

### Rules
- Minimum 1 item
- Maximum unlimited rows

---

# 5.3 Asset Uploader

User dapat mengganti logo/header branding.

### Supported Formats
- PNG
- JPG
- SVG

### Requirements
- Local file upload
- Preview before apply
- Convert to base64/url

---

# 5.4 Export Engine

User dapat mengunduh hasil akhir dalam format gambar.

### Export Formats
- PNG
- JPG

### Requirements
- Menggunakan `html-to-image`
- Scale rendering 2x
- Output tidak blur
- Mobile compatible

### CTA
**Generate & Download**

---

# 6. Design Requirements (Figma → Code)

---

## Canvas Resolution

Fixed canvas size:

```javascript
400px x 600px
```

Tujuannya agar rasio export selalu konsisten.

---

## Typography

Harus mendukung custom fonts:

- Inter
- Roboto Mono
- Custom uploaded fonts (future scope)

---

## Design System

Gunakan Tailwind Design Tokens untuk:

- Colors
- Border radius
- Shadows
- Spacing

---

## Supported Visual Themes

### Neo-Brutalism
- Hard shadows
- Bold borders
- Vibrant colors

### Glassmorphism
- Blur backgrounds
- Transparent layers
- Soft gradients

---

# 7. Functional Requirements

---

## Receipt Calculation

System harus otomatis menghitung:

```text
Subtotal = sum(all items)
Tax = subtotal * tax rate
Total = subtotal + tax
```

---

## Currency Formatting

Support:

- IDR
- USD

Future:
- EUR
- SGD
- JPY

---

## Responsive Behavior

### Desktop
Full editor + canvas side by side

### Mobile
Editor collapsible drawer

---

# 8. Technical Architecture

---

## Folder Structure

```plaintext
/src
  /components
    /editor
      Sidebar.tsx
    /canvas
      Frame.tsx
      Branding.tsx
      Table.tsx
    /ui
      Button.tsx
      Input.tsx

  /hooks
    useImageExport.ts
```

---

# 9. State Management Schema

```typescript
{
  brandName: string,
  logo: string,
  transactionId: string,
  date: string,
  items: [
    {
      id: number,
      name: string,
      price: number,
      quantity: number
    }
  ],
  tax: number,
  currency: string,
  notes?: string
}
```

---

# 10. User Flow

### Step 1
User opens Billflow

### Step 2
User fills transaction details

### Step 3
User uploads branding/logo

### Step 4
User edits item list

### Step 5
Live preview updates instantly

### Step 6
User clicks Generate

### Step 7
Download final asset

---

# 11. Non-Functional Requirements

- Fast rendering (<100ms update)
- Export reliability
- Cross-browser compatibility
- Mobile responsiveness
- Secure local file handling

---

# 12. Future Scope

### Template Marketplace
User bisa memilih banyak template desain

### AI Autofill
Input raw receipt text → auto generate design

### PDF Export
Selain image export

### Multi-language Support
Bahasa Indonesia / English

### Cloud Storage
Save previous receipts

---

# 13. Risks

| Risk | Mitigation |
|--------|-------------|
| Export image blur | Use 2x scaling |
| Large image uploads | Compress before render |
| Too many table rows | Add scrolling container |
| Browser incompatibility | Cross-browser testing |

---

# 14. MVP Scope

Included in MVP:

✅ Live editor  
✅ Dynamic table  
✅ Logo upload  
✅ PNG/JPG export  
✅ Fixed canvas template  

Excluded from MVP:

❌ AI autofill  
❌ PDF export  
❌ Marketplace  
❌ Cloud sync  

---

# 15. Tech Stack Recommendation

### Frontend
- NextJS
- TailwindCSS
- ShadCN UI

### Hosting
- Vercel

---

# 16. Definition of Success

Billflow sukses jika user bisa:

> "Masukkan data → lihat hasil cantik → download dalam hitungan detik"

tanpa perlu skill desain sama sekali.