# Product Requirements Document (PRD)
## Skincare E-Commerce Website

**Project type:** Basic full-stack e-commerce website  
**Design reference:** CeraVe website (visual inspiration only)  
**Required stack:** MERN — MongoDB, Express.js, React.js, Node.js  
**Primary roles:** Customer and Admin

## 1. Project summary

Build a simple skincare e-commerce website with a CeraVe-inspired visual direction. Customers can browse products, register, log in, manage a cart, place Cash on Delivery (COD) orders and view their own order history. Administrators can manage products, customers and orders, and view basic activity records.

The application must be a real, database-backed MERN application—not just a static UI prototype.

## 2. Goals

- Build a responsive storefront and landing page.
- Implement basic registration, login and logout.
- Hash passwords with `bcryptjs` and authenticate with JWT.
- Implement basic CRUD for products, users and orders, with role restrictions.
- Allow customers to add items to a cart and place COD orders.
- Give administrators a dashboard to manage records and review activity.
- Keep the implementation understandable and suitable for a student project.

## 3. User roles

### 3.1 Visitor
- View the landing page.
- Browse active products and product details.
- Register or log in.
- Must log in before using a persistent cart or placing an order.

### 3.2 Customer
- Log in and log out.
- View and update their own basic profile.
- Browse products.
- Add products to their cart.
- Change cart quantities and remove cart items.
- Checkout using COD.
- View only their own orders and order details.
- View the current status of their orders.

### 3.3 Administrator
- Log in to the admin area.
- View dashboard counts and recent records.
- Create, view, update and delete products.
- View customers and update permitted customer fields/status.
- View orders and update order status.
- View basic activity logs.

Admin accounts must be created through a seed script or another trusted setup process. Public registration must never allow a visitor to choose the `admin` role.

## 4. Functional requirements

### FR-01: Landing page
The public landing page must include:
- Announcement bar (optional).
- Header with logo/brand name and navigation.
- Hero section with headline, image and Shop Now link.
- Product category links.
- Featured products.
- Brand/about section.
- Footer with basic navigation.

### FR-02: Product catalogue
- Display active products in a responsive grid.
- Each card displays image, name, price and a product link.
- Product detail page displays description, category, price, stock availability and quantity/add-to-cart controls.
- Products are stored in MongoDB and retrieved through the Express API.

### FR-03: Authentication
Registration fields:
- Name
- Email
- Password
- Confirm password (frontend validation)

Login fields:
- Email
- Password

Requirements:
- Hash passwords using `bcryptjs`.
- Verify passwords using `bcryptjs.compare`.
- Issue JWT after successful login.
- Store JWT in an HTTP-only cookie.
- Provide logout and a current-user endpoint.
- Protect private routes and admin routes on the backend.

### FR-04: Cart
- One active cart per customer.
- Add a product to the cart.
- Increase/decrease quantity.
- Remove a cart item.
- View item quantities and subtotal.
- Validate product existence, active status and stock on the backend.
- Calculate prices on the backend; never trust totals sent by the browser.

### FR-05: Checkout and orders
- Checkout collects customer name, email, phone and delivery address.
- Payment method for this version is Cash on Delivery only.
- Customer confirms the order.
- Backend rechecks stock and calculates the total.
- Save order item snapshots (product name and price at time of purchase).
- Update stock and clear the cart after a successful order.
- Show an order confirmation page.
- Default order status: `Pending`.

Order statuses:
- `Pending`
- `Confirmed`
- `Processing`
- `Shipped`
- `Delivered`
- `Cancelled`

### FR-06: Customer dashboard
- Show a welcome message and basic profile information.
- Show recent orders and order history.
- Allow the customer to view order details and status.
- Customer must never access another customer's data.

### FR-07: Admin dashboard
Show simple summary cards:
- Total products
- Total customers
- Total orders
- Total revenue from non-cancelled orders (define calculation consistently)

Provide pages for:
- Product management
- Customer management
- Order management
- Activity logs

### FR-08: Activity records
Record basic events such as:
- User registration
- Successful login
- Product added to cart
- Order placed
- Order cancelled
- Order status changed
- Product created, updated or deleted
- Customer record updated or deleted

Each record should include the actor (when available), role, action, short description and timestamp. Do not record passwords, tokens or other secrets.

## 5. Non-functional requirements

- Responsive on desktop, tablet and mobile.
- Clear loading, success, error and empty states.
- Validate input on both frontend and backend.
- Use reusable React components.
- Use Express routes, controllers, models and middleware.
- Keep secrets in environment variables.
- Return safe error messages and do not expose password hashes.
- Use pagination for admin tables if needed.

## 6. Out of scope

Do not build:
- Online payment gateway or card processing.
- Social/Google login.
- AI chatbot or AI recommendations.
- Skin analysis.
- Wishlist or loyalty points.
- Product reviews or ratings.
- Live delivery tracking.
- Email/SMS integrations.
- Third-party product or authentication APIs.
- Complex analytics or microservices.

## 7. Acceptance criteria

The project is complete when:
- A visitor can browse the landing page and active products.
- A customer can register, log in and log out.
- Passwords are stored as bcrypt hashes.
- Customers can add, update and remove cart items.
- Customers can place COD orders and view only their own orders.
- Admin can perform the required CRUD operations.
- Admin routes are protected on the backend.
- Product, cart, order and user data persist in MongoDB.
- Activity records appear in the admin panel.
- Core pages work at desktop and mobile sizes.
- README instructions allow another person to run the project locally.
