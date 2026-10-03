# Scoopzy: Ice Cream Delivery 

Full-stack app for ordering ice cream from multiple suppliers (parlours).

| Layer    | Tech                                                       |
|----------|------------------------------------------------------------|
| Frontend | React 19 + Vite + React Router (`frontend/`)               |
| Backend  | Spring Boot 3.5, Spring Security (JWT), Spring Data JPA (`backend/`) |
| Database | PostgreSQL                                                 |

## Features

**Customers**
- Browse parlours, filter by city, search by parlour / flavour / category, sort by rating, delivery time or fee
- Supplier page with a menu, category filters, veg and bestseller badges
- Cart holds items from one supplier at a time, like Zomato. Adding from another supplier asks before replacing the cart.
- Checkout with bill breakdown (item total, delivery fee, 5% GST) and minimum-order checks
- Sign up and log in with JWT; profile with a default delivery address
- Order history, live order tracker that refreshes every 10s, and cancellation while the order is PLACED or CONFIRMED

**Admin** (`/admin`)
- Order dashboard with stats; move orders through PLACED → CONFIRMED → PREPARING → OUT_FOR_DELIVERY → DELIVERED (or CANCELLED)
- Add, edit or delete suppliers and open or close them
- Manage each supplier's menu: add, edit and delete items, and toggle availability and bestseller

## Product images

- Sample photos are in `backend/src/main/resources/static/images/` and served at `/images/...`. On startup, any supplier or ice cream without an image gets the photo whose file name matches its name (e.g. `Royal Falooda` → `royal-falooda.jpg`, suppliers use a `supplier-` prefix). Images an admin has set are never overwritten. See `CREDITS.md` there for sources.
- Admins can upload a JPG, PNG, WEBP or GIF (max 5 MB) from the supplier and ice cream forms, or paste an image URL. Uploads are saved to `backend/uploads/` (set a different folder with `UPLOAD_DIR`) and served at `/uploads/...`.
- If an image fails to load, the UI shows an emoji placeholder instead.

## Setup

### 1. Database
```sql
CREATE DATABASE icecream_db;
```
The tables are created automatically (`ddl-auto=update`). On first start, sample suppliers and menus are loaded.

### 2. Backend (port 8080)
```bash
cd backend
# set your PostgreSQL credentials (defaults: postgres / postgres, db icecream_db on localhost:5432)
#   PowerShell:  $env:DB_PASSWORD="yourpassword"
#   bash:        export DB_PASSWORD=yourpassword
mvn spring-boot:run
```
Environment variables: `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `JWT_SECRET` (Base64, at least 32 bytes), `CORS_ORIGINS`.

### 3. Frontend (port 5173)
```bash
cd frontend
npm install
npm run dev
```
Open http://localhost:5173. Vite proxies `/api` to `http://localhost:8080`.

### Demo accounts
| Role     | Email                  | Password |
|----------|------------------------|----------|
| Customer | user@icecreamhub.com   | user123  |
| Admin    | admin@icecreamhub.com  | admin123 |

## REST API

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | none | Sign up, returns `{token, user}` |
| POST | `/api/auth/login` | none | Log in, returns `{token, user}` |
| GET/PUT | `/api/auth/me` | user | Get or update profile |
| GET | `/api/suppliers?q=&city=&sort=rating\|delivery\|fee` | none | Search suppliers |
| GET | `/api/suppliers/{id}` | none | Supplier and its menu |
| GET | `/api/cities` | none | Cities with suppliers |
| POST | `/api/orders` | user | Place an order |
| GET | `/api/orders` | user | My orders |
| GET | `/api/orders/{id}` | user | Order details |
| PATCH | `/api/orders/{id}/cancel` | user | Cancel an order |
| GET | `/api/admin/orders` | admin | All orders |
| PATCH | `/api/admin/orders/{id}/status` | admin | Update order status |
| POST/PUT/DELETE | `/api/admin/suppliers[/{id}]` | admin | Manage suppliers |
| POST | `/api/admin/suppliers/{id}/ice-creams` | admin | Add a menu item |
| PUT/DELETE | `/api/admin/ice-creams/{id}` | admin | Edit or delete a menu item |
| POST | `/api/admin/uploads` (multipart `file`) | admin | Upload an image, returns `{url}` |

Send `Authorization: Bearer <token>` for authenticated routes.

## Production build
```bash
cd frontend && npm run build        # static files in frontend/dist
cd backend && mvn package           # target/icecream-hub-backend-1.0.0.jar
java -jar backend/target/icecream-hub-backend-1.0.0.jar
```
If the frontend is served from a different origin, set `VITE_API_URL` at build time and `CORS_ORIGINS` on the backend.
