# 🛍️ Ansari Store — Full-Stack Multi-Vendor E-Commerce Platform

[![Live Demo](https://img.shields.io/badge/Live%20Store-Visit%20Website-blue?style=for-the-badge&logo=vercel)](https://ansari-store-indol.vercel.app)
[![API Backend](https://img.shields.io/badge/Backend%20API-Render-black?style=for-the-badge&logo=render)](https://ansari-store.onrender.com)
[![GitHub Repo](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github)](https://github.com/Abdulla1202/Ansari-Store)

> **Live Website:** [https://ansari-store-indol.vercel.app](https://ansari-store-indol.vercel.app)  
> **API Server:** [https://ansari-store.onrender.com](https://ansari-store.onrender.com)

---

## 📌 Overview

**Ansari Store** is a production-ready, full-stack Multi-Vendor E-Commerce web application built using **Django REST Framework (DRF)** on the backend and **React (Vite)** on the frontend. 

It provides an Amazon/Flipkart-style dual ecosystem:
1. **Customer Experience:** Search, filter, wishlist, add to cart, apply coupon discounts, pay securely via Stripe, and track packages in real-time.
2. **Vendor Portal:** Complete merchant workspace with sales charts, inventory management, product creation/updating, coupon generation, and order fulfillment.

---

## 🚀 Key Features

### 🛒 Customer Storefront
- **Product Discovery:** Categorized collections, dynamic filters, brand sorting, and instant search.
- **Cart & Wishlist:** Real-time cart management, persistent sessions, and wishlist toggling.
- **Live Order Tracking:** In-app logistics telemetry showing carrier tracking numbers, live status checkpoints (Order Confirmed, Shipped, In Transit, Delivered).
- **Secure Checkout:** Stripe payment gateway integration with instant receipt generation.
- **Reviews & Ratings:** Customer product reviews with star ratings and feedback history.

### 🏢 Vendor Workspace & Dashboard
- **Analytics & Revenue:** Interactive Chart.js graphs displaying monthly sales volume, order trends, and revenue growth.
- **Product Management:** Full CRUD operations for products with variants (colors, sizes, specifications) and gallery images.
- **Smart Category Autofill:** Seamless pre-population and automatic mapping when editing existing products.
- **Coupons & Promotions:** Create, toggle, and track custom discount percentage codes.
- **Notifications Hub:** Instant alerts for new orders with unread badge counters.
- **Mobile-First Layout:** Tailored product cards and responsive tables designed for mobile screens.

### 🛡️ Security & Cloud Storage
- **JWT Authentication:** Secure user authentication using SimpleJWT access and refresh tokens.
- **Permanent Cloudinary Media Storage:** Cloud-hosted images with automated fallback protection, ensuring product media is never lost during server deployments.
- **Production-Hardened Database:** Powered by cloud-managed PostgreSQL with connection pooling.

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, React Router v6, Axios, Bootstrap 5, Chart.js, SweetAlert2, Moment.js |
| **Backend** | Python, Django, Django REST Framework (DRF), SimpleJWT, Django Cors Headers |
| **Database** | PostgreSQL (Production) / SQLite (Local development) |
| **Media Storage** | Cloudinary (Cloud media storage & CDN) |
| **Static Files** | WhiteNoise (Compressed static assets) |
| **Hosting** | Vercel (Frontend SPA) + Render (Backend Web Service) |

---

## 📂 Project Structure

```bash
Django_React_Ecomerse_project/
├── backend/
│   ├── backend/            # Django root configuration & settings
│   │   ├── settings.py     # Database, Cloudinary, JWT, & CORS config
│   │   ├── storage.py      # Resilient Cloudinary storage backend
│   │   └── urls.py         # Main URL router
│   ├── store/              # Core e-commerce models, serializers & views
│   ├── vendor/             # Vendor dashboard, analytics & management endpoints
│   ├── customer/           # Customer profiles, tracking & order history
│   ├── userauths/          # Custom User model & JWT authentication
│   └── requirements.txt    # Python dependencies
│
└── frontend/
    ├── src/
    │   ├── views/
    │   │   ├── store/      # Products, Detail, Cart, Checkout, Payment
    │   │   ├── vendor/     # Dashboard, Products, Add/Edit Product, Orders, Earning
    │   │   ├── customer/   # TrackOrder, Orders, Account Settings
    │   │   └── auth/       # Login, Register, Forgot Password
    │   ├── utils/          # Axios instance & JWT auth interceptors
    │   ├── App.jsx         # Routes & Layout configuration
    │   └── main.jsx        # App entry point
    ├── index.html
    ├── package.json
    └── vite.config.js
```

---

## ⚙️ Local Setup & Installation

### Prerequisites
- Python 3.10+
- Node.js 18+ & npm
- Git

### 1. Backend Setup
```bash
# Clone the repository
git clone https://github.com/Abdulla1202/Ansari-Store.git
cd Ansari-Store/backend

# Create and activate virtual environment
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Start development server
python manage.py runserver
```
Backend will be live at: `http://127.0.0.1:8000/`

### 2. Frontend Setup
```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install

# Start development server
npm run dev
```
Frontend will be live at: `http://localhost:5173/`

---

## 🔑 Environment Variables

### Backend (`backend/.env`)
```env
DJANGO_SECRET_KEY=your_secret_key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1,.onrender.com
DATABASE_URL=postgresql://user:password@host/dbname

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Stripe
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# Frontend URL
SITE_URL=https://ansari-store-indol.vercel.app
```

---

## 👨‍💻 Author

- **GitHub:** [@Abdulla1202](https://github.com/Abdulla1202)
- **Repository:** [Ansari-Store](https://github.com/Abdulla1202/Ansari-Store)
- **Live Demo:** [https://ansari-store-indol.vercel.app](https://ansari-store-indol.vercel.app)

---

## 📄 License

This project is licensed under the MIT License - feel free to use and customize it for your own projects!