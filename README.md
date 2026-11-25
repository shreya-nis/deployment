# CeraVe-Inspired Skincare E-Commerce Website (MERN)

A full-stack, database-backed skincare e-commerce website inspired by the clean, clinical, product-focused visual language of CeraVe. Formulated with three essential ceramides, Cash on Delivery (COD) checkout, persistent customer carts, and an administrative fulfilment panel.

---

## 1. Technology Stack

Built strictly adhering to the project requirements:

- **Database:** MongoDB (Local Community Server on port `27017`)
- **ODM:** Mongoose
- **Backend Runtime:** Node.js (v24+)
- **Backend Framework:** Express.js REST API
- **Frontend Framework:** React.js (v18+) with Vite tooling
- **Routing:** React Router DOM (v6+)
- **State Management:** React Context API (`AuthContext`, `CartContext`)
- **Authentication:** `jsonwebtoken` (JWT in HTTP-only cookies) + `bcryptjs` password hashing
- **File Upload:** Multer (Local static image uploads served at `/uploads`)
- **Styling:** Custom CSS3 with CeraVe clinical palette (`#003B70` Navy, `#0076B8` Secondary Blue, `#DCEFFA` Light Blue, `#F4F6F8` Light Grey)
- **Icons:** Lucide React

---

## 2. Key Features & Workflows

### 2.1 Three Distinct Access Areas
1. **Public Storefront (Visitors):**
   - Hero banner with CeraVe clean aesthetic and CTA
   - Category showcase: Cleansers, Moisturizers, Serums, Sunscreens, Eye Care, Body Care
   - Featured products grid with live stock badges
   - Product details page with ceramide benefits, description, and quantity selector
   - Enforced login before cart usage: visitors clicking *Add to Cart* are prompted to sign in
2. **Customer Panel (Authenticated Customers):**
   - Persistent MongoDB cart tied to customer account
   - Dynamic cart calculation on backend; stock validation
   - Cash on Delivery (COD) checkout with delivery details and order notes
   - Customer account dashboard with order count and default address
   - Order history with live fulfilment tracker (`Pending` → `Confirmed` → `Packed` → `Shipped` → `Delivered`)
   - Order cancellation permitted while order is in `Pending` status (restoring warehouse stock)
   - Profile management for recipient name, phone, and delivery address
3. **Admin Panel (Authenticated Administrators):**
   - Dashboard with real DB statistics: Active products count, Total customers, Total orders, Non-cancelled Delivered revenue
   - Full Product CRUD with Multer image upload support, stock management, featured flags, and soft-delete safeguards for historical orders
   - Order fulfilment workflow controller:
     - `Pending` → `Confirmed` (Accept Order)
     - `Confirmed` → `Packed` (Items prepared)
     - `Packed` → `Shipped` (Dispatched with courier)
     - `Shipped` → `Delivered` (Customer received)
     - Cancellation with guaranteed 1-time stock restoration
   - Customer account management with activation toggles and safeguard protecting the last active administrator
   - Read-only activity logs audit trail tracking all major backend events

---

## 3. Demo Credentials

The database seeder pre-configures two functional accounts:

| Role | Email | Password | Access Area |
|---|---|---|---|
| **Administrator** | `shreyakhadka66@gmail.com` | `adminpassword123` | `/admin` (Admin Panel) |
| **Customer** | `customer@example.com` | `customerpassword123` | Storefront, `/cart`, `/account` |

*Note: You can also register a new customer anytime from the `/register` page.*

---

## 4. Project Structure

```text
MERN_PROJECT/
├── backend/
│   ├── config/             # MongoDB connection (db.js)
│   ├── controllers/        # Express request handlers (auth, product, cart, order, user, admin)
│   ├── middleware/         # auth (protect, admin), upload (Multer), error handler
│   ├── models/             # Mongoose schemas (User, Product, Cart, Order, ActivityLog)
│   ├── routes/             # REST API endpoints
│   ├── seed/               # Seed script with 12 products, demo accounts, and sample orders
│   ├── uploads/            # Downloaded skincare images & admin uploads
│   ├── utils/              # Immutable activity logger helper
│   ├── server.js           # Express application entrypoint
│   ├── package.json
│   └── .env
├── frontend/
│   ├── public/
│   │   └── images/         # Category & banner image assets
│   ├── src/
│   │   ├── components/     # Navbar, Footer, ProductCard, ProtectedRoute, AdminRoute, AdminLayout
│   │   ├── context/        # AuthContext, CartContext
│   │   ├── pages/          # Home, Shop, ProductDetails, Login, Register, Cart, Checkout, UserDashboard, MyOrders, OrderDetails, Profile
│   │   │   └── admin/      # AdminDashboard, AdminProducts, AdminProductForm, AdminOrders, AdminOrderDetails, AdminCustomers, AdminActivities
│   │   ├── services/       # Axios API client with withCredentials: true
│   │   ├── App.jsx         # React Router route definitions
│   │   ├── main.jsx        # App root
│   │   └── index.css       # CeraVe clinical design system styling
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
├── memory.md               # Project progress & verification memory
└── README.md
```

---

## 5. Local Setup & Execution Guide

### Prerequisites
- Node.js (v18 or higher)
- Local MongoDB running on `mongodb://127.0.0.1:27017`

### Step 1: Install Dependencies
In the root directory, install both backend and frontend packages:

```bash
# Backend dependencies
npm --prefix backend install

# Frontend dependencies
npm --prefix frontend install
```

### Step 2: Seed the Database
Populate the database with the administrator, demo customer, 12 CeraVe-inspired products, and initial audit logs:

```bash
npm --prefix backend run seed
```

### Step 3: Run the Application
Open two terminal windows:

**Terminal 1 (Backend API):**
```bash
npm --prefix backend run dev
# Express server runs on http://localhost:5000
```

**Terminal 2 (Frontend UI):**
```bash
npm --prefix frontend run dev
# Vite development server runs on http://localhost:5173
```

Visit **`http://localhost:5173`** in your browser.

---

## 6. End-to-End Automated Testing

Run the comprehensive integration test suite to verify all 10 API and business logic domains:

```bash
node backend/test-integration.js
```
