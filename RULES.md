# Project Rules and Development Constraints

These rules are mandatory for the entire project. Follow them during every implementation phase.

## 1. Strict MERN stack

The application must use only the following core stack:

- MongoDB
- Express.js
- React.js
- Node.js

Supporting libraries permitted for basic implementation:
- Mongoose
- Vite
- React Router DOM
- `bcryptjs`
- `jsonwebtoken`
- Axios or Fetch
- React Context API
- CSS3
- Multer
- Lucide React
- `cookie-parser`
- `cors`
- `dotenv`

Do not introduce another backend, database or frontend framework.

## 2. No third-party application APIs

- Do not use Firebase or Supabase.
- Do not use third-party authentication.
- Do not use Google or social login.
- Do not use external product APIs.
- Do not use payment gateway APIs.
- Do not use AI APIs.
- Do not use external recommendation services.
- Do not use external services for core application data.

The project's own Express REST API is required and allowed.

## 3. Keep functionality basic

Implement only:
- Basic registration/login/logout.
- Product CRUD.
- Basic customer management.
- Basic order management.
- Cart add/update/remove.
- COD checkout.
- Customer order history.
- Basic admin dashboard.
- Basic activity logs.

Do not add advanced features without explicit approval.

## 4. Code organization

- Keep frontend and backend separate.
- Use MVC-style organization in Express.
- Keep database models separate from controllers.
- Keep routes separate from business logic.
- Use reusable React components.
- Keep API calls in a service module.
- Use clear, descriptive names.
- Avoid unnecessary abstractions and overengineering.
- Do not duplicate code when a small reusable function is appropriate.

## 5. Authentication and authorization

- Hash passwords with `bcryptjs`.
- Never store plain-text passwords.
- Use JWT for login sessions.
- Prefer HTTP-only cookies for JWT storage.
- Use authentication middleware for protected endpoints.
- Use admin middleware for admin-only endpoints.
- Never trust a role supplied by the frontend.
- Public registration must always assign the `user` role.
- Create the initial admin through a seed script.
- Never return password hashes in API responses.
- Do not store secrets in source code.

## 6. Data and business rules

- MongoDB is the source of truth.
- Validate all important input on the backend.
- Normalize email addresses.
- Product price and stock must be valid non-negative numbers.
- Cart quantity must be a positive integer.
- Check stock before order placement.
- Calculate order totals on the backend.
- Save product name and price snapshots in orders.
- Customers may access only their own carts and orders.
- Admins may access administrative records.
- Do not permanently erase historical order information when a product is removed.
- Prevent stock from becoming negative.
- Restore stock on cancellation only once.
- Prevent deletion/deactivation of the last active admin.

## 7. Activity logs

- Create activity logs on the backend.
- Do not allow customers to edit or delete activity logs.
- Do not log passwords, JWTs, secrets or sensitive authentication data.
- Store a clear action, description, actor and timestamp.
- Admins can read activity logs.

## 8. Frontend rules

- Every visible button must work.
- Every form must validate and submit.
- Show loading and error states.
- Do not leave placeholder links or dead buttons.
- Do not use hardcoded mock data as the final application data source.
- Sample data may be inserted through seed scripts.
- Handle empty lists and failed requests gracefully.
- Keep responsive layouts.

## 9. Development workflow

Implement in this order:
1. Project setup and database connection.
2. Landing page and shared design system.
3. Authentication.
4. Product CRUD.
5. Cart.
6. Checkout and orders.
7. Customer dashboard.
8. Admin dashboard and activity logs.
9. Testing and documentation.

After each phase:
- Run the application.
- Check frontend/backend communication.
- Test the implemented feature.
- Fix errors before moving on.
- Do not break previously working features.

## 10. Scope control

If a feature is not listed in the PRD, do not invent or implement it. Ask for approval before expanding the scope.

Do not introduce:
- Microservices.
- Complex state-management frameworks.
- Complex analytics.
- Background job systems.
- WebSockets.
- Docker as a requirement.
- Payment integrations.
- AI functionality.

Keep the project small, clear, functional and easy to explain in an academic demonstration.
