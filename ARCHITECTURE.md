# System Architecture
## MERN Skincare E-Commerce Website

## 1. Architecture overview

Use a simple three-layer architecture:

1. **Frontend:** React application built with Vite.
2. **Backend:** Node.js and Express REST API.
3. **Database:** MongoDB accessed through Mongoose.

```text
Browser
  |
  | React UI / React Router / Context
  v
Express REST API
  |
  | Routes -> Middleware -> Controllers
  v
Mongoose Models
  |
  v
MongoDB
```

The frontend communicates only with the project's own Express API. Do not connect React directly to MongoDB.

## 2. Suggested repository structure

```text
skincare-store/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── layouts/
│   │   ├── pages/
│   │   │   └── admin/
│   │   ├── services/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   └── package.json
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── seed/
│   ├── utils/
│   ├── uploads/
│   ├── server.js
│   └── package.json
├── .gitignore
└── README.md
```

## 3. Frontend pages

Public:
- `Home`
- `Shop`
- `ProductDetails`
- `Login`
- `Register`

Customer:
- `Cart`
- `Checkout`
- `UserDashboard`
- `MyOrders`
- `OrderDetails`
- `Profile`

Admin:
- `AdminDashboard`
- `AdminProducts`
- `AdminProductForm`
- `AdminOrders`
- `AdminCustomers`
- `AdminActivities`

Shared components:
- `Navbar`
- `Footer`
- `ProductCard`
- `ProductGrid`
- `Hero`
- `Loading`
- `ErrorMessage`
- `ProtectedRoute`
- `AdminRoute`

Use `AuthContext` for the logged-in user and `CartContext` for cart state. Keep API request functions in `services/api.js`.

## 4. Backend modules

- **Models:** Mongoose schemas and database validation.
- **Routes:** HTTP endpoint definitions.
- **Controllers:** Request handling and business logic.
- **Middleware:** Authentication, admin authorization and error handling.
- **Config:** MongoDB connection.
- **Utils:** Activity log helper and small shared utilities.
- **Seed:** Script to create the initial admin and optional sample products.

## 5. MongoDB collections

### User
```js
{
  name: String,
  email: String,       // unique, normalized
  password: String,    // bcrypt hash
  phone: String,
  address: String,
  role: { type: String, enum: ["user", "admin"], default: "user" },
  isActive: { type: Boolean, default: true }
}
```

### Product
```js
{
  name: String,
  description: String,
  price: Number,
  category: String,
  image: String,
  stock: Number,
  isFeatured: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true }
}
```

### Cart
```js
{
  user: { type: ObjectId, ref: "User", unique: true },
  items: [{
    product: { type: ObjectId, ref: "Product" },
    quantity: Number
  }]
}
```

### Order
```js
{
  user: { type: ObjectId, ref: "User" },
  items: [{
    product: { type: ObjectId, ref: "Product" },
    productName: String,
    price: Number,
    quantity: Number,
    image: String
  }],
  customerName: String,
  email: String,
  phone: String,
  deliveryAddress: String,
  note: String,
  paymentMethod: { type: String, enum: ["COD"], default: "COD" },
  subtotal: Number,
  total: Number,
  status: {
    type: String,
    enum: ["Pending", "Confirmed", "Processing", "Shipped", "Delivered", "Cancelled"],
    default: "Pending"
  }
}
```

### ActivityLog
```js
{
  user: { type: ObjectId, ref: "User" },
  userName: String,
  role: String,
  action: String,
  description: String
}
```

Enable Mongoose timestamps where appropriate. Add indexes for fields commonly queried, such as user email, product category and order user/status.

## 6. REST API outline

Base path: `/api`

### Authentication
| Method | Endpoint | Access |
|---|---|---|
| POST | `/auth/register` | Public |
| POST | `/auth/login` | Public |
| POST | `/auth/logout` | Public/authenticated |
| GET | `/auth/me` | Authenticated |

### Products
| Method | Endpoint | Access |
|---|---|---|
| GET | `/products` | Public |
| GET | `/products/:id` | Public |
| POST | `/products` | Admin |
| PUT | `/products/:id` | Admin |
| DELETE | `/products/:id` | Admin |

### Cart
| Method | Endpoint | Access |
|---|---|---|
| GET | `/cart` | Customer |
| POST | `/cart` | Customer |
| PUT | `/cart/:productId` | Customer |
| DELETE | `/cart/:productId` | Customer |
| DELETE | `/cart` | Customer |

### Orders
| Method | Endpoint | Access |
|---|---|---|
| POST | `/orders` | Customer |
| GET | `/orders/my-orders` | Customer |
| GET | `/orders/:id` | Owner or admin |
| GET | `/orders` | Admin |
| PUT | `/orders/:id/status` | Admin |
| DELETE | `/orders/:id` | Admin, with business rules |

### Users
| Method | Endpoint | Access |
|---|---|---|
| GET | `/users/me` | Customer |
| PUT | `/users/me` | Customer |
| GET | `/users` | Admin |
| GET | `/users/:id` | Admin |
| PUT | `/users/:id` | Admin |
| DELETE | `/users/:id` | Admin, with safeguards |

### Admin
| Method | Endpoint | Access |
|---|---|---|
| GET | `/admin/dashboard` | Admin |
| GET | `/admin/activities` | Admin |

## 7. Authentication request flow

1. User submits email and password.
2. Express finds the user by normalized email.
3. `bcryptjs.compare()` verifies the password.
4. Express signs a JWT using a secret from environment variables.
5. JWT is sent as a secure HTTP-only cookie.
6. Authentication middleware verifies the cookie on protected requests.
7. Middleware loads the user and attaches safe user information to the request.
8. Admin middleware checks `role === "admin"`.

For local development, configure cookie `secure` appropriately for HTTP; enable it in production HTTPS. Configure CORS to allow only the frontend origin and credentials.

## 8. Order flow

```text
Customer cart
    |
    v
Checkout details
    |
    v
POST /api/orders
    |
    v
Backend validates user, products and stock
    |
    v
Backend calculates total from database prices
    |
    v
Create order with item snapshots
    |
    v
Reduce stock and clear cart
    |
    v
Create activity log
    |
    v
Return order confirmation
```

Use a MongoDB transaction for order creation, stock changes and cart clearing when the MongoDB deployment supports transactions (for example, a replica set). If using standalone local MongoDB, do not pretend transactions are supported; handle errors carefully and document the limitation.

## 9. Local development

Suggested local URLs:
- React/Vite: `http://localhost:5173`
- Express: `http://localhost:5000`
- MongoDB: `mongodb://127.0.0.1:27017/skincare_store`

Backend environment variables:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/skincare_store
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=1d
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

Frontend:
```env
VITE_API_URL=http://localhost:5000/api
```

Never commit real `.env` files. Provide `.env.example` files instead.
