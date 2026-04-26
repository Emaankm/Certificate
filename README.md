# 📜 Certificate Microservice

A professional certificate generation microservice for the EduLearn platform. Generates beautiful, multi-language PDF certificates with customizable templates, golden seals, and secure verification system.

---

## 🚀 Features

✨ **Professional Certificate Design**

- Beautiful A4 landscape certificates with elegant borders
- Golden seal and decorative ornaments
- Customizable branding with logos and watermarks
- Clean, professional typography

🌍 **Multi-language Support**

- English (LTR)
- Urdu (RTL) with proper font rendering
- Easy to extend with additional languages

📄 **PDF Generation**

- High-quality PDF output using Puppeteer
- Print-ready A4 landscape format
- Embedded images (no external dependencies)
- Single-page optimized layout

💾 **Database Storage**

- MongoDB integration for certificate metadata
- Unique certificate IDs for each generation
- Verification URL for each certificate

🔒 **Security & Verification**

- Unique verification URLs
- Certificate ID tracking
- Secure file storage

---

## 🛠️ Prerequisites

Ensure you have the following installed:

1. **Node.js** (v16+)
2. **MongoDB** (v4.4+ or MongoDB Atlas)
3. **npm** or **yarn**

---

⚡ Background Job Processing with Redis & Bull
This microservice uses Redis and Bull for efficient asynchronous certificate generation. When a certificate request is received, it's added to a queue and processed in the background, allowing the API to respond immediately without blocking.
