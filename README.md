# REEL RESERVE
> **Premium Cinema Hall Ticket Booking & Management System**  
> *Your next movie night, perfectly booked.*

Built for **ALGIONS AI LABS PRIVATE LIMITED Technical Assessment**  
**Assigned Project:** `05 — Cinema Hall Ticket Booking System`

---

## 1. Executive Summary & Product Architecture

**REEL RESERVE** is a production-grade, full-stack cinema discovery and reserved ticket booking platform. Designed with a luxury cinematic visual language (Deep Charcoal, Burgundy `#791D35`, and Champagne Gold `#D6A85F`), it eliminates double-booking through an **atomic server-side seat hold engine with auto-expiring temporary locks**.

The system features an interactive auditorium layout visualizer, simulated multi-channel checkout (UPI, Card, Net Banking), digital passports with cryptographic QR codes, personal reservation management, and a dedicated executive admin panel with Recharts analytics and full CRUD capability.

```
                      ┌────────────────────────────────────────────────────────┐
                      │                   REEL RESERVE CLIENT                  │
                      │   React 18 + Vite + Tailwind CSS + Lucide Icons        │
                      │   Framer Motion + React Router v6 + Recharts + Axios   │
                      └───────────────────────────┬────────────────────────────┘
                                                  │ REST API / JSON + JWT
                                                  ▼
                      ┌────────────────────────────────────────────────────────┐
                      │                  EXPRESS REST API ENGINE               │
                      │   JWT Auth • Rate Limiting • 10-Min Atomic Seat Hold   │
                      │   Validation • Error Handling • QR Code Generator      │
                      └───────────────────────────┬────────────────────────────┘
                                                  │ Mongoose ODM
                                                  ▼
                      ┌────────────────────────────────────────────────────────┐
                      │                       MONGODB                          │
                      │   Users, Movies, Cinemas, Screens, Shows, Bookings     │
                      └────────────────────────────────────────────────────────┘
```

---

## 2. Key Features

### Customer Experience
- **Cinematic Homepage**: Hero showcase with backdrop artwork, "Now Showing" and "Upcoming Premieres" reels, and partner cinema cards.
- **Movie Discovery**: Live search by title, actor, or synopsis; multi-faceted filtering by genre, language, and release status; dynamic sorting.
- **Interactive Auditorium Seating**: Real curved cinema screen visualizer, tiered categories (**Premium Lounge**, **Gold**, **Regular**), live subtotal updates, and double-booking protection.
- **Seat Hold & Atomic Concurrency Engine**: 10-minute temporary seat lock preventing conflicting reservations.
- **Simulated Payment Sandbox**: Test UPI, Credit/Debit Cards, or Net Banking with simulated success and decline paths.
- **Digital Cinema Pass**: Generates a scannable QR code embedded with verifiable booking reference data and printable pass layout.
- **Customer Dashboard**: View reservation history, seat allocations, and initiate cancellations.

### Business & Admin Operations
- **Role-Based Security**: Protected routes and JWT authentication enforcing customer vs administrator authorization.
- **Business Dashboard**: Real-time KPI counters (Gross Revenue, Total Bookings, Active Customers, Movie Catalog) and 7-day revenue trend graphs via Recharts.
- **Movie Catalog Manager**: Full CRUD for titles, posters, backdrops, cast, genres, languages, certification, and release status.
- **Cinema & Screen Manager**: Add partner venues, configure screen formats (IMAX with Laser, Dolby Atmos, 4DX, VIP suites), and facilities.
- **Showtime Scheduler**: Assign movies to screens, schedule dates and times with automatic conflict/overlap prevention, and set tiered seat pricing.
- **Reservation & Customer Oversight**: Real-time auditing of customer bookings, refund handling, and customer account activation toggle.

---

## 3. Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React, React Router DOM v6, Axios, Recharts, React Hot Toast, QRCode.
- **Backend**: Node.js, Express.js, JWT (`jsonwebtoken`), `bcryptjs`, `express-rate-limit`, `cors`, `morgan`.
- **Database**: MongoDB & Mongoose ODM.

---

## 4. Demo Accounts & Credentials

The database comes pre-seeded with rich, realistic data and two verified accounts:

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@reelreserve.demo` | `Admin@123456` | Full Admin Dashboard & Storefront |
| **Customer** | `customer@reelreserve.demo` | `Customer@123456` | Customer Storefront & Booking Flow |

*Quick-fill demo buttons are also integrated directly into the Sign In page for one-click access.*

---

## 5. Local Setup & Running Instructions

### Prerequisites
- Node.js `v18+` (Tested on `v22.17.1`)
- npm `v10+`
- MongoDB running locally on port `27017` or a MongoDB Atlas URI

### Installation
Clone or navigate to the project directory:
```bash
cd ALGIONS
```

Install dependencies for client and server:
```bash
# In the ALGIONS/client folder
cd client
npm install

# In the ALGIONS/server folder
cd ../server
npm install
```

### Environment Configuration
The server includes a `.env` file (and `.env.example`):
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/reel_reserve
JWT_SECRET=super_secret_reel_reserve_jwt_key_2026_production
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### Populate Realistic Demo Data
Run the database seed script to populate movies, cinemas, screens, and showtimes:
```bash
cd server
npm run seed
```

### Starting the Applications
In two separate terminals:

**Terminal 1 (Backend API):**
```bash
cd server
npm start
# Runs Express on http://localhost:5000
```

**Terminal 2 (Frontend Client):**
```bash
cd client
npm run dev
# Runs Vite on http://localhost:5173
```

Open `http://localhost:5173` in your browser.

---

## 6. REST API Endpoints Overview

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Create customer account
- `POST /api/auth/login` - Authenticate user & issue JWT
- `GET /api/auth/me` - Get profile of authenticated user

### Movies (`/api/movies`)
- `GET /api/movies` - List movies with search, genre, language, status filters & sorting
- `GET /api/movies/:id` - Movie details & synopsis
- `POST /api/movies` - Add new movie (Admin)
- `PUT /api/movies/:id` - Update movie (Admin)
- `DELETE /api/movies/:id` - Delete movie (Admin)

### Cinemas & Screens (`/api/cinemas`)
- `GET /api/cinemas` - List partner cinema locations
- `GET /api/cinemas/:id` - Cinema details and screen auditoriums
- `POST /api/cinemas` - Add cinema venue (Admin)
- `DELETE /api/cinemas/:id` - Remove cinema (Admin)

### Showtimes (`/api/showtimes`)
- `GET /api/showtimes` - Filter showtimes by movie, cinema, and date
- `GET /api/showtimes/:id` - Screen seating configuration & real-time occupied seats
- `POST /api/showtimes` - Schedule screening with overlap validation (Admin)
- `DELETE /api/showtimes/:id` - Cancel screening (Admin)

### Bookings & Payments (`/api/bookings`)
- `POST /api/bookings/hold` - Atomically reserve selected seats for 10 minutes
- `POST /api/bookings/:id/apply-offer` - Apply coupon voucher code
- `POST /api/bookings/confirm` - Confirm simulated payment, update status, generate QR code
- `GET /api/bookings/my-bookings` - Retrieve user's personal booking history
- `GET /api/bookings/:id` - Get ticket details
- `POST /api/bookings/:id/cancel` - Cancel booking and trigger simulated refund

### Admin Dashboard (`/api/admin`)
- `GET /api/admin/dashboard` - Executive stats, revenue chart, and status distribution
- `GET /api/admin/bookings` - Audit all customer reservations
- `GET /api/admin/customers` - Customer directory & status toggle
- `GET /api/admin/offers` - Promotional discounts

---

## 7. Production Deployment Guide

### Database (MongoDB Atlas)
1. Create a cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Obtain your connection string: `mongodb+srv://<username>:<password>@cluster.mongodb.net/reel_reserve?retryWrites=true&w=majority`.
3. Whitelist inbound IP addresses (`0.0.0.0/0`).

### Backend (Render / Railway)
1. Connect your repository to Render/Railway.
2. Set root directory to `server`.
3. Set Build Command: `npm install`.
4. Set Start Command: `node server.js`.
5. Add environment variables: `MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL` (set to your Vercel frontend URL).

### Frontend (Vercel)
1. Import repository to Vercel.
2. Set root directory to `client`.
3. Framework Preset: `Vite`.
4. Build Command: `npm run build`, Output Directory: `dist`.
5. Add Environment Variable: `VITE_API_URL` pointing to your deployed backend URL.

---

## 8. Verification & Test Checklist

- [x] User registration & validation
- [x] User authentication (bcrypt hashing & JWT token)
- [x] Unauthorized route protection
- [x] Movie catalog discovery & multi-faceted filtering
- [x] Cinema selection & date-driven showtime lookup
- [x] Interactive auditorium seat grid with tier pricing
- [x] Server-side seat hold engine with 10-minute expiry window
- [x] Prevention of race conditions & double bookings
- [x] Simulated payment gateway (UPI, Card, Net Banking)
- [x] Simulated payment failure handling
- [x] Digital ticket passport generation with scannable QR code
- [x] Customer personal booking history & cancellation
- [x] Admin dashboard with Recharts revenue graphs & KPIs
- [x] Admin Movie CRUD operations
- [x] Admin Cinema & Screen configuration
- [x] Admin Showtime scheduling with screen collision checks
- [x] Clean, error-free Vite production build

