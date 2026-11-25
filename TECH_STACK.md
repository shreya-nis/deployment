# Technology Stack
## Strict MERN Implementation

## 1. Core stack

| Layer | Required technology | Purpose |
|---|---|---|
| Database | MongoDB | Store users, products, carts, orders and activity logs |
| ODM | Mongoose | Define schemas and query MongoDB |
| Backend runtime | Node.js | Run server-side JavaScript |
| Backend framework | Express.js | Build the project's REST API |
| Frontend | React.js | Build the user interface |
| Frontend tooling | Vite | Run and build the React application |
| Routing | React Router DOM | Navigate between pages |
| Authentication | JSON Web Token (`jsonwebtoken`) | Authenticate users |
| Password hashing | `bcryptjs` | Hash and verify passwords |
| API requests | Axios or Fetch | Communicate with the Express API |
| State | React Context API | Share authentication and cart state |
| Styling | CSS3 | Style responsive pages |
| Image upload | Multer | Handle local product image uploads |
| Icons | Lucide React | Provide interface icons |

## 2. Suggested dependencies

### Backend production dependencies

```bash
npm install express mongoose bcryptjs jsonwebtoken dotenv cors cookie-parser multer
```

Optional development dependency:

```bash
npm install -D nodemon
```

### Frontend dependencies

```bash
npm install react-router-dom axios lucide-react
```

Use Vite to create the React project:

```bash
npm create vite@latest frontend -- --template react
```

## 3. Database

Use MongoDB Community Server locally for development.

Suggested database:
`skincare_store`

Connection string:
```env
MONGO_URI=mongodb://127.0.0.1:27017/skincare_store
```

MongoDB Compass may be used as a desktop tool to inspect the database. It is not an external application API.

## 4. Authentication configuration

Use:
- `bcryptjs.hash()` to hash passwords.
- `bcryptjs.compare()` to verify passwords.
- `jsonwebtoken.sign()` to create JWTs.
- `jsonwebtoken.verify()` to validate JWTs.
- `cookie-parser` to read authentication cookies.

Use an HTTP-only cookie for the JWT. Configure `sameSite`, `secure`, cookie expiry and CORS credentials correctly for the chosen development/production setup.

## 5. Environment variables

Backend `.env.example`:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/skincare_store
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=1d
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

Frontend `.env.example`:

```env
VITE_API_URL=http://localhost:5000/api
```

Do not commit real `.env` files.

## 6. Local commands

Backend `package.json` scripts should include:

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

Frontend Vite scripts should include:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

Run the backend from the backend directory:

```bash
npm run dev
```

Run the frontend from the frontend directory:

```bash
npm run dev
```

## 7. Local development addresses

| Service | Address |
|---|---|
| React frontend | `http://localhost:5173` |
| Express backend | `http://localhost:5000` |
| API base | `http://localhost:5000/api` |
| Local MongoDB | `mongodb://127.0.0.1:27017/skincare_store` |

## 8. Explicit exclusions

Do not use:
- Next.js
- Django
- Flask
- Laravel
- Firebase
- Supabase
- PostgreSQL
- MySQL
- GraphQL
- Redux unless specifically approved
- Third-party login providers
- External payment services
- AI APIs
- External product APIs

The project must remain a basic MERN application.
