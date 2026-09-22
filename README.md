# 🛒 RetailInsight — Intelligent Retail & Wholesale SaaS Platform

**RetailInsight** is a full-stack SaaS web application designed for small shop owners (Retailers) and suppliers (Wholesalers). It provides real-time stock management, live profit and gross margin calculations, BCG matrix product profitability classification, automated low-stock replenishment via a B2B Wholesaler Marketplace, fast POS barcode scanning & billing, and downloadable PDF reports & tax invoices.

---

## 🌟 Key Features

### 🏪 1. Retail Shopkeeper Operations
- **Live Product Catalog & Stock Management**: Real-time inventory tracking with safety thresholds, unit pricing, cost prices (CP), and selling prices (MRP).
- **POS Checkout & Billing Terminal**:
  - Lightning-fast barcode scanner (device camera + manual simulator) and instant search.
  - Interactive shopping cart with customizable GST/tax rates (0%, 5%, 12%, 18%) and discount amount.
  - **Live Cashier Margin Badge**: Shows the shopkeeper the exact net profit and profit margin percentage generated for each transaction before checkout.
  - Instant printable thermal/A4 cash receipt with Code128 barcode and PDF download.
- **Stock Audit & Loss Logging**: Track restocks, damaged goods, physical count adjustments, and historical logs.

### 📊 2. Profitability Analytics & BCG Matrix Intelligence
- **BCG 4-Quadrant Profitability Classification**:
  - ⭐ **Stars**: High Volume & High Margin *(Hero products — prioritize shelf display and zero stockouts)*.
  - 💵 **Cash Cows**: High Volume & Moderate/Low Margin *(Traffic drivers — negotiate wholesale discounts or cross-sell)*.
  - 💡 **Opportunities**: Low Volume & High Margin *(Hidden gems — run promotions or combo offers)*.
  - ⚠️ **Underperformers**: Low Volume & Low Margin *(Slow movers — bundle or liquidate)*.
- **Dead Inventory & Trapped Capital Analysis**: Automatically detects unsold products over 30+ days and calculates tied-up capital.
- **Interactive Revenue Trends**: Recharts line/area visualizations for Daily (7D), Monthly (30D), and Quarterly (90D) periods.
- **Category Sales Breakdown**: Donut chart and revenue percentage share.

### 🏭 3. B2B Wholesaler - Retailer Restock Marketplace
- **Wholesale Bulk Catalog**: Wholesalers list products in bulk cartons/boxes with Minimum Order Quantities (MOQ) and volume discounts.
- **1-Click Restock from Low-Stock Alert**: Retailers can click a single button on low-stock items to auto-populate a Purchase Order with a supplier.
- **Supplier Fulfillment Pipeline**: Wholesalers manage incoming orders through statuses: `PENDING` ➔ `CONFIRMED` ➔ `SHIPPED` ➔ `DELIVERED`.
- **Automatic Inventory Replenishment**: When a Wholesaler marks a Purchase Order as `DELIVERED`, the retailer's product stock is **automatically updated** in the database!

### 🏷️ 4. Barcode & PDF Report Studio
- **ZXing & JsBarcode Engine**: Generate universal **Code128** and **EAN-13** barcodes.
- **Printable Sticker Sheets**: Generate multi-sticker label sheets ready for printing on physical packaging.
- **OpenPDF Invoicing**: Download professional PDF sales invoices and P&L audit reports directly from the backend.

### 🔐 5. Role-Based Access Control (RBAC) & 1-Click Demo
- Three dedicated roles: `ROLE_RETAILER`, `ROLE_WHOLESALER`, and `ROLE_ADMIN`.
- **Instant Demo Switcher**: Seamlessly switch between Retailer and Wholesaler views from the top navigation bar without manual login.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Backend** | Java 21 LTS, Spring Boot 3.3.2, Spring Security 6, Spring Data JPA, Hibernate, JWT (JJWT 0.12.5) |
| **Database** | PostgreSQL (Production/Docker) & H2 Database (Default local zero-config fallback) |
| **Barcode / PDF** | Google ZXing (3.5.3), OpenPDF (1.3.39), JsBarcode, Html5-Qrcode |
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS, Lucide React, Recharts |
| **DevOps & Cloud** | Docker, Docker Compose, Render Blueprint (`render.yaml`), Nginx |

---

## 🚀 Quick Start Guide

### Demo Credentials

| Role | Username | Email | Password |
|---|---|---|---|
| **Retailer (Shopkeeper)** | `retailer` | `retailer@retailinsight.com` | `password123` |
| **Wholesaler (Supplier)** | `wholesaler` | `wholesaler@retailinsight.com` | `password123` |
| **System Admin** | `admin` | `admin@retailinsight.com` | `password123` |

*(Note: The login page includes 1-Click Demo buttons for instant access.)*

---

### Running Locally

#### 1. Backend (Spring Boot)
```bash
cd backend
# Set JAVA_HOME if not already configured in your shell
mvnw.cmd spring-boot:run
# Or on Linux/macOS: ./mvnw spring-boot:run
```
- API Base URL: `http://localhost:8080`
- Swagger UI Documentation: `http://localhost:8080/swagger-ui.html`
- H2 Console (for local inspection): `http://localhost:8080/h2-console` *(JDBC URL: `jdbc:h2:file:./data/retailinsightdb`, user: `sa`, password: empty)*

#### 2. Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
- Frontend UI: `http://localhost:5173` (with `/api` proxied to port 8080).

---

### Running with Docker Compose

To launch the full stack (PostgreSQL + Spring Boot Backend + React/Nginx Frontend) in containers:

```bash
docker-compose up --build
```
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8080`
- PostgreSQL: `localhost:5432`

---

## ☁️ Deployment Guide (Render + GitHub)

1. Push your repository to **GitHub**.
2. Log into [Render.com](https://render.com) and click **New > Blueprint**.
3. Connect your GitHub repository containing `render.yaml`.
4. Render will automatically provision:
   - **PostgreSQL Database** (`retailinsight-postgres`)
   - **Spring Boot Web Service** (`retailinsight-backend`)
   - **React Static Site / Web Service** (`retailinsight-frontend`)
5. Click **Apply** to deploy!

---

## 📡 REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/login` | Authenticate user and get JWT |
| `POST` | `/api/auth/register` | Register new Retailer or Wholesaler |
| `GET` | `/api/auth/me` | Get current user profile |
| `GET` | `/api/products` | List all inventory products |
| `GET` | `/api/products/barcode/{barcode}` | Find product by barcode or SKU |
| `POST` | `/api/products` | Create product with cost & selling price |
| `POST` | `/api/products/stock-adjust` | Adjust stock count with audit reason |
| `POST` | `/api/sales/checkout` | Process POS billing & calculate margins |
| `GET` | `/api/sales/orders` | View past transaction invoices |
| `GET` | `/api/analytics/summary` | Get lifetime & daily KPI metrics |
| `GET` | `/api/analytics/profitability-matrix` | Get BCG 4-quadrant product matrix |
| `GET` | `/api/analytics/dead-inventory` | Get unsold products & trapped capital |
| `GET` | `/api/wholesale/listings` | Browse wholesale bulk listings |
| `POST` | `/api/wholesale/orders` | Place B2B purchase restock order |
| `PATCH` | `/api/wholesale/orders/{id}/status` | Update PO status (Auto-restocks on `DELIVERED`) |
| `GET` | `/api/pdf/invoice/{id}` | Stream downloadable PDF Invoice |
| `GET` | `/api/pdf/profit-loss-report` | Stream downloadable P&L Audit Report |
| `GET` | `/api/barcode/generate` | Generate raw PNG barcode stream |

---

## 📄 License
This project is licensed under the MIT License.
