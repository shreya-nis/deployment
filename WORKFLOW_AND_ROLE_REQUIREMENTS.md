# APPLICATION WORKFLOW & ROLE REQUIREMENTS
## Public Storefront, Customer Panel, Admin Panel, Cart and Order Lifecycle

**Document type:** Supplemental functional specification  
**Applies to:** Existing `PRD.md`, `ARCHITECTURE.md`, `DESIGN.md`, `RULES.md` and `TECH_STACK.md`  
**Technology constraint:** Strict MERN only — MongoDB, Express.js, React.js and Node.js.

This document clarifies the exact user experience, access rules, panels, cart behaviour, order workflow and CRUD responsibilities. It supplements the other project documents; it does not replace them.

---

# 1. Overall application structure

The website must have three clearly separated areas:

1. **Public website / storefront** — accessible to everyone without logging in.
2. **Customer panel** — accessible only to authenticated customers.
3. **Admin panel** — accessible only to authenticated administrators.

The application must be fully connected to MongoDB through its own Express backend. Do not build only a static UI prototype.

## 1.1 Public website

Visitors who are not logged in can:
- Open the landing page.
- View navigation and footer.
- Browse the product catalogue.
- Open product detail pages.
- View product images, descriptions, prices and availability.
- Navigate to Login and Register.

Visitors who are not logged in cannot:
- Add products to a cart.
- Open or use the customer cart.
- Place orders.
- Open the customer dashboard.
- View private order history or profile information.
- Access admin pages or admin APIs.

### Login requirement for shopping

When a logged-out visitor clicks **Add to Cart**:
1. Do not add the item to a cart.
2. Redirect to Login or show a clear login-required message with a Login button.
3. After successful login, return to the product page where practical.
4. The customer can then add the item.

Do not create a guest cart. The cart belongs to an authenticated customer and is stored in MongoDB.

---

# 2. Customer panel

The customer panel is available only after successful customer login.

## 2.1 Customer navigation

Provide:
- Home
- Shop
- Cart (with item count)
- My Account / Dashboard
- My Orders
- Profile
- Logout

Links may be grouped in an account menu, but their functionality must remain available.

## 2.2 Customer permissions

A customer can:
- Browse public products.
- Add active products to their own cart.
- View their own cart.
- Change quantities in their own cart.
- Remove cart items or clear their cart.
- Place COD orders.
- View only their own orders and order details.
- View current order statuses.
- Update permitted fields in their own profile.
- Log out.

A customer cannot:
- Create, edit or delete products.
- Change product prices or stock directly.
- View another customer's cart, profile or orders.
- Change an order's administrative fulfilment status.
- Access admin routes or APIs.
- Change their own role to admin.

## 2.3 Customer dashboard

Create a dedicated dashboard showing:
- Welcome message using the customer's name.
- Profile summary.
- Total number of the customer's orders.
- Recent orders.
- Link to all orders.
- Current status of each order.
- Profile details and edit option.

Use actual data from the logged-in customer's MongoDB records. Do not use hardcoded dashboard statistics.

## 2.4 Customer order history

Each order entry should show:
- Order ID.
- Order date.
- Ordered items or item summary.
- Total amount.
- Payment method (COD).
- Current order status.
- View Details action.

Order details must show delivery information, ordered items, quantities, saved item prices and current status.

Customers must never be able to update an order's administrative status.

---

# 3. Cart behaviour

## 3.1 Cart ownership

- Only authenticated customers can use a cart.
- Each customer has one active cart.
- Store each cart in MongoDB and associate it with the customer's user ID.
- A customer can only read or modify their own cart.
- Do not implement a guest cart.

## 3.2 Cart functions

The cart page must allow customers to:
- View all cart items.
- See product image, name and current unit price.
- Increase/decrease quantity.
- Remove an item.
- View subtotal and total.
- Continue shopping.
- Proceed to checkout.

## 3.3 Cart validation

The backend must validate every cart operation:
- Product exists.
- Product is active.
- Quantity is a positive integer.
- Requested quantity does not exceed available stock.
- Product price is read from MongoDB, not trusted from the frontend.

If a product becomes inactive or stock is insufficient, show a clear message and prevent checkout until the cart is corrected.

---

# 4. Checkout and order placement

Use **Cash on Delivery (COD) only**. Do not integrate an online payment service.

## 4.1 Checkout form

Collect:
- Customer name.
- Email.
- Phone number.
- Delivery address.
- Optional order note.

Show an order summary with product names, quantities, unit prices, subtotal, total and COD payment method.

## 4.2 Place order process

When the customer clicks **Place Order**:
1. Confirm the customer is authenticated.
2. Load the customer's cart from MongoDB.
3. Validate that the cart is not empty.
4. Check that every product exists and is active.
5. Check that requested quantities are available.
6. Calculate prices and total on the backend.
7. Save an order in MongoDB.
8. Save product name, image and price snapshots in order items.
9. Reduce stock quantities.
10. Clear the customer's cart.
11. Create an activity log entry.
12. Return a successful order response.
13. Show an order confirmation page with the order ID and initial status.

If validation fails, do not create a partial order or clear the cart.

Use a MongoDB transaction for order creation, stock reduction and cart clearing when the deployment supports transactions (such as a replica set). Handle failures safely.

## 4.3 Initial order status

Every successfully placed order starts with:

`Pending`

The customer sees this status in My Orders.

---

# 5. Admin panel

The admin panel is a separate protected area, suggested route prefix: `/admin`.

## 5.1 Admin navigation

Create a sidebar containing:
- Dashboard
- Products
- Orders
- Customers
- Activity Logs
- Logout

## 5.2 Admin dashboard

Show real database statistics:
- Total active products.
- Total customers.
- Total orders.
- Delivered revenue.
- Recent orders.
- Recent activities.

Calculate statistics on the backend. Define delivered revenue as the total of delivered, non-cancelled orders. If displaying another total, label it clearly.

## 5.3 Admin permissions

An administrator can:
- Create, view, update and delete/deactivate products.
- View customers and customer details.
- Update permitted customer fields and account status.
- Activate/deactivate customer accounts.
- Delete customer accounts with safeguards.
- View all orders and order details.
- Accept/confirm pending orders.
- Update order fulfilment status.
- Cancel eligible orders with correct stock restoration.
- View activity logs.

Enforce all admin permissions in Express middleware and controllers, not just by hiding frontend buttons.

---

# 6. Product management — Admin CRUD

The Admin Products page must provide real Create, Read, Update and Delete functionality.

## 6.1 Product fields

- Product name.
- Description.
- Price.
- Category.
- Product image.
- Stock quantity.
- Featured (yes/no).
- Active (yes/no).

## 6.2 Create

Admin completes the Add Product form. The backend validates and saves the product in MongoDB. A new active product appears in the public shop.

## 6.3 Read

Admin can view all products, including inactive products, with image, name, category, price, stock, active status, edit action and delete/deactivate action.

## 6.4 Update

Admin can edit product details, price, category, image, stock and active status. Changes are saved to MongoDB and reflected in the storefront where applicable.

## 6.5 Delete

Show a confirmation dialog before deletion.

- Do not break historical orders when a product is deleted.
- Orders must retain saved product name, image and price snapshots.
- Prefer setting `isActive: false` (soft deletion) for products that have been ordered.
- Inactive products must not appear in the public shop or be added to carts.
- Hard deletion may be allowed for a product that has never been ordered, after a backend check.

---

# 7. Order management and fulfilment status — Admin

The admin must be able to accept an order and update its status as it moves through fulfilment.

## 7.1 Exact order statuses

Use these exact status values everywhere:

1. `Pending` — customer placed the order; admin has not accepted it.
2. `Confirmed` — admin accepted the order.
3. `Packed` — items have been prepared and packed.
4. `Shipped` — order has been dispatched for delivery.
5. `Delivered` — customer received the order.
6. `Cancelled` — order was cancelled.

Do not use conflicting status names in different parts of the application.

## 7.2 Admin order list

Display:
- Order ID.
- Customer name.
- Order date.
- Number of items.
- Total amount.
- Payment method.
- Current status.
- View Details action.
- Status update action.

A simple status filter is optional. Do not build advanced analytics.

## 7.3 Accepting an order

For an order with `Pending` status:
1. Admin opens the order.
2. Admin reviews customer details, delivery address and ordered products.
3. Admin clicks **Accept Order** or selects `Confirmed`.
4. Backend validates the status transition and saves the new status.
5. An activity log is created.
6. Customer sees `Confirmed` in My Orders.

The admin should not mark an order Delivered without following the normal fulfilment process, except through a deliberate, recorded administrative correction.

## 7.4 Normal status flow

```text
Pending
   | Admin accepts
   v
Confirmed
   | Items prepared
   v
Packed
   | Dispatched
   v
Shipped
   | Customer receives order
   v
Delivered
```

Allowed normal transitions:
- Pending -> Confirmed
- Confirmed -> Packed
- Packed -> Shipped
- Shipped -> Delivered

Allowed cancellation:
- Pending -> Cancelled
- Confirmed -> Cancelled
- Packed -> Cancelled only if it has not been dispatched and admin policy permits it.

Do not allow normal status updates such as:
- Delivered -> Packed
- Delivered -> Shipped
- Cancelled -> Confirmed
- Cancelled -> Packed
- Shipped -> Cancelled through the normal status selector

Any exceptional correction must be a deliberate admin-only operation with a recorded reason. Do not silently rewrite order history.

## 7.5 Stock handling on cancellation

- Reduce stock when an order is successfully placed.
- If an order is cancelled before delivery, restore item quantities exactly once.
- Repeated cancellation requests must never restore stock more than once.
- Do not restore stock if the order is already cancelled.
- Do not cancel delivered orders through the normal cancellation action.

## 7.6 Customer status visibility

Customers can see the current status in:
- Dashboard recent orders.
- My Orders list.
- Individual order details.

Customers cannot change the status. Use readable status labels and do not rely on colour alone.

---

# 8. Customer management — Admin CRUD

The Customers page must display:
- Customer name.
- Email.
- Phone.
- Registration date.
- Account status.
- View details.
- Edit.
- Activate/deactivate.
- Delete.

Rules:
- Never display or edit a password hash.
- Do not allow public or customer forms to set arbitrary roles.
- Do not allow the last active admin to be deleted or deactivated.
- Deactivated customers cannot log in or use protected customer actions.
- Preserve historical orders if an account is deleted; use safe references/snapshots rather than deleting order history.

---

# 9. Activity monitoring

The admin Activity Logs page must show events created by the backend.

Track at least:
- Customer registered.
- Customer logged in.
- Product added to cart.
- Order placed.
- Order accepted/confirmed.
- Order marked packed.
- Order marked shipped.
- Order marked delivered.
- Order cancelled.
- Product created, updated or deactivated/deleted.
- Customer updated or deactivated.

Each row displays:
- Date and time.
- User/admin name where available.
- Role.
- Action.
- Short description.
- Related order or product ID where relevant.

Activity logs are read-only in the admin interface. Do not build edit/delete controls for logs. Never log passwords, JWTs or secrets.

---

# 10. Route access matrix

| Page/action | Visitor | Customer | Admin |
|---|---:|---:|---:|
| Landing page | Yes | Yes | Yes |
| Browse products | Yes | Yes | Yes |
| View product details | Yes | Yes | Yes |
| Register | Yes | — | — |
| Login | Yes | Yes | Yes |
| Add to cart | No | Yes | Not required |
| View cart | No | Own cart | Not required |
| Checkout/place order | No | Yes | Not required |
| Customer dashboard | No | Own account | Admin panel |
| View own orders | No | Yes | Can view all |
| Manage products | No | No | Yes |
| Manage customers | No | No | Yes |
| Manage all orders/status | No | No | Yes |
| View activity logs | No | No | Yes |

The backend must enforce these permissions even if someone manually enters a URL or sends an API request.

---

# 11. Required frontend routes

```text
/                         Public landing page
/shop                     Public product catalogue
/products/:id             Public product detail
/login                    Login
/register                 Registration

/cart                     Authenticated customer only
/checkout                 Authenticated customer only
/account                  Customer dashboard
/account/profile          Customer profile
/account/orders           Customer order list
/account/orders/:id       Own order details only

/admin                    Admin dashboard
/admin/products           Admin product list
/admin/products/new       Create product
/admin/products/:id/edit  Edit product
/admin/orders             Admin order list
/admin/orders/:id         Admin order details/status
/admin/customers          Admin customer list
/admin/customers/:id      Admin customer details/edit
/admin/activities         Admin activity logs
```

An admin login can use the same login form as customers; after authentication, redirect according to the user's database role. Route guards improve user experience, but Express must enforce authorization.

---

# 12. Required backend API behaviour

All endpoints belong to the project's own Express API under `/api`.

- Public product GET endpoints return active products only.
- Cart endpoints require authentication.
- Customer order endpoints require authentication and must scope queries to the logged-in user's ID.
- Admin CRUD endpoints require authentication and admin authorization.
- Order status updates must validate allowed transitions on the backend.
- Product prices and stock must be read from MongoDB.
- Activity logs must be created by backend code.

Suggested order endpoints:

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | `/api/orders` | Customer | Place order |
| GET | `/api/orders/my-orders` | Customer | List own orders |
| GET | `/api/orders/:id` | Owner/Admin | Read order details |
| GET | `/api/orders` | Admin | List all orders |
| PATCH | `/api/orders/:id/status` | Admin | Accept/update status |
| PATCH | `/api/orders/:id/cancel` | Customer/Admin per rules | Request permitted cancellation |

Suggested product endpoints:

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | `/api/products` | Public | List active products |
| GET | `/api/products/:id` | Public | Read active product |
| POST | `/api/products` | Admin | Create |
| PUT | `/api/products/:id` | Admin | Update |
| DELETE | `/api/products/:id` | Admin | Safely deactivate/delete |

---

# 13. End-to-end acceptance tests

Do not mark the website complete until these scenarios work with MongoDB data.

## Public visitor
- [ ] Visitor can open the landing page.
- [ ] Visitor can browse products and open details.
- [ ] Visitor clicks Add to Cart while logged out and is asked to log in.
- [ ] Visitor cannot open `/cart`, `/checkout` or customer account pages.
- [ ] Visitor cannot access admin pages or APIs.

## Customer
- [ ] Customer can register and log in.
- [ ] Password is stored as a bcrypt hash.
- [ ] Customer can add a product to their own cart.
- [ ] Customer can update quantity and remove items.
- [ ] Customer cannot exceed available stock.
- [ ] Customer can place a COD order.
- [ ] Order is saved in MongoDB.
- [ ] Stock is reduced correctly.
- [ ] Cart is cleared after successful order placement.
- [ ] Customer can see their own order and current status.
- [ ] Customer cannot view another customer's order.
- [ ] Customer cannot change order status.
- [ ] Customer cannot access admin functions.

## Admin
- [ ] Admin can log in.
- [ ] Admin dashboard shows real database counts.
- [ ] Admin can create a product and see it in the public shop.
- [ ] Admin can update product information.
- [ ] Admin can deactivate/delete a product safely.
- [ ] Admin can view and update/deactivate customers.
- [ ] Admin can view all orders.
- [ ] Admin can accept a pending order.
- [ ] Admin can change Confirmed to Packed.
- [ ] Admin can change Packed to Shipped.
- [ ] Admin can change Shipped to Delivered.
- [ ] Customer sees each updated status.
- [ ] Admin can cancel an eligible order.
- [ ] Stock is restored once on cancellation.
- [ ] Admin can view activity logs.

## Data and security
- [ ] Refreshing the browser does not lose persisted cart/order data.
- [ ] Users cannot change their role through registration or profile editing.
- [ ] Backend rejects unauthorized requests.
- [ ] Backend calculates order totals.
- [ ] Historical order item prices remain unchanged after product edits.
- [ ] No secrets or passwords appear in API responses or activity logs.

---

# 14. Instructions to the coding agent

Read this file together with:
- `PRD.md`
- `ARCHITECTURE.md`
- `DESIGN.md`
- `RULES.md`
- `TECH_STACK.md`

Treat all six documents as the project specification.

Priority:
1. Follow the strict MERN technology requirement.
2. Implement three separate access areas: public, customer and admin.
3. Enforce login before cart and checkout.
4. Implement real MongoDB-backed CRUD.
5. Implement the admin order acceptance and fulfilment status flow.
6. Make customers able to see order status updates.
7. Test complete workflows end to end.

Do not replace missing functionality with static mockups. Do not add features outside the agreed scope.

If documents conflict, this supplemental workflow document is the source of truth for role permissions, cart access and order fulfilment statuses. The strict technology restrictions in `RULES.md` and `TECH_STACK.md` remain mandatory.

Build a complete working website, not just a design prototype.
