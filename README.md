# ShopKart — Full-Stack MERN E-Commerce App

ShopKart is a full-stack e-commerce web app built with MongoDB, Express, React and Node.js across six lab assignments. Customers can sign up, browse and search products, keep a wishlist, manage a cart, and check out with Razorpay (test mode).

## Live Demo

- **Frontend (Vercel):** https://shopkart-black.vercel.app
- **Backend API (Render):** https://shopkart-hqyd.onrender.com/products

> The backend is on Render's free plan and sleeps when idle, so the first request can take 30–60 seconds.

The frontend's `vercel.json` forwards `/api/*` requests to the Render backend. This keeps the site and the API on one domain, so the login cookie works in every browser.

## Features

| Lab | Feature |
| --- | --- |
| 01 | Customer registration and login with bcrypt-hashed passwords and JWT stored in an httpOnly cookie |
| 02 | React frontend for register, login, protected home page and logout |
| 03 | Product catalog with search, category filter and price sorting, plus a product details page |
| 04 | Wishlist (add, remove, toggle) tied to the logged-in customer |
| 05 | Shopping cart with quantity updates and stock checks |
| 06 | Checkout with shipping details, Razorpay payment, signature verification, order history and order status tracking |

## Tech Stack

- **Frontend:** React 19, Vite, React Router, Axios
- **Backend:** Node.js, Express 5, Mongoose
- **Database:** MongoDB (local or MongoDB Atlas)
- **Auth:** JSON Web Tokens, bcrypt, cookie-parser
- **Payments:** Razorpay (test mode)

## Project Structure

```
.
├── index.js              # Express server entry point
├── config/               # Razorpay client setup
├── controllers/          # Route handlers (customer, product, wishlist, cart, order)
├── middlewares/          # JWT auth middleware
├── models/               # Mongoose schemas (customer, product, order)
├── routes/               # Express routers
├── utils/                # Token helper and product seed script
├── .env.example          # Template for backend environment variables
└── shopkart-frontend/    # React + Vite frontend
    └── src/
        ├── components/
        ├── context/      # Cart context
        ├── pages/
        ├── services/     # Axios API client
        └── utils/
```

## Prerequisites

- [Node.js](https://nodejs.org/) 20 or later and npm
- A MongoDB database: a local install, or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster
- A [Razorpay](https://razorpay.com/) account, used in **Test Mode**, for the checkout feature

## Setup and Running Locally

### 1. Clone the repository

```bash
git clone https://github.com/Akankshaa1502/shopkart.git
cd shopkart
```

### 2. Set up the backend

```bash
npm install
```

Copy the example environment file and fill in your own values:

```bash
cp .env.example .env
```

On Windows PowerShell, use `Copy-Item .env.example .env` instead.

| Variable | Description |
| --- | --- |
| `PORT` | Port for the API server (default `3000`) |
| `MONGO_URI` | MongoDB connection string, e.g. `mongodb://127.0.0.1:27017/shopkart` or your Atlas URI |
| `JWT_SECRET` | Any long random string used to sign login tokens |
| `RAZORPAY_KEY_ID` | Razorpay test key ID (starts with `rzp_test_`) |
| `RAZORPAY_KEY_SECRET` | Razorpay test key secret |
| `CLIENT_URL` | *(Optional)* Frontend URL allowed by CORS. Defaults to `http://localhost:5173` |

To get Razorpay keys, switch your Razorpay dashboard to Test Mode and go to **Account & Settings → API Keys**.

Load sample products into the database:

```bash
npm run seed
```

Start the backend:

```bash
npm run dev
```

The API runs at **http://localhost:3000**, and the console should show `MongoDB connected`.

### 3. Set up the frontend

Open a second terminal:

```bash
cd shopkart-frontend
npm install
npm run dev
```

The app runs at **http://localhost:5173**.

The frontend calls `http://localhost:3000` by default. If your backend runs somewhere else, create `shopkart-frontend/.env` containing:

```
VITE_API_URL=http://your-backend-url
```

### 4. Try it out

1. Register a new account and log in.
2. Browse `/products`, then search, filter by category or sort by price.
3. Add products to your wishlist and cart.
4. Go to checkout, enter a shipping address and pay with Razorpay. In test mode, use a [Razorpay test card](https://razorpay.com/docs/payments/payments/test-card-details/) or test UPI ID `success@razorpay`.
5. View your orders under `/orders`.

## API Reference

All routes marked 🔒 require you to be logged in (JWT cookie).

### Customers — `/customers`

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/customers/register` | Register a new customer |
| POST | `/customers/login` | Log in and set the auth cookie |
| GET | `/customers/me` 🔒 | Get the logged-in customer's profile |
| POST | `/customers/logout` 🔒 | Log out and clear the cookie |

### Products — `/products`

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/products` | List products. Query params: `search`, `category`, `sort` (`price_asc` or `price_desc`) |
| GET | `/products/:id` | Get a single product |
| POST | `/products` | Create a product (no admin protection yet) |

### Wishlist — `/wishlist` 🔒

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/wishlist` | Get the customer's wishlist |
| POST | `/wishlist/:productId` | Add a product |
| DELETE | `/wishlist/:productId` | Remove a product |
| PATCH | `/wishlist/:productId/toggle` | Add if missing, remove if present |

### Cart — `/cart` 🔒

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/cart` | Get the customer's cart |
| POST | `/cart/:productId` | Add a product to the cart |
| PATCH | `/cart/:productId` | Update the quantity |
| DELETE | `/cart/:productId` | Remove a product from the cart |

### Orders — `/orders` 🔒

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/orders/create-payment-order` | Create a pending order and a Razorpay order |
| POST | `/orders/verify-payment` | Verify the Razorpay signature and mark the order as paid |
| GET | `/orders` | List the customer's orders |
| GET | `/orders/:id` | Get a single order |
| PATCH | `/orders/:id/status` | Move the order to its next status (development endpoint) |

Order status flow: `PENDING_PAYMENT → PLACED → CONFIRMED → SHIPPED → DELIVERED`

## Frontend Pages

| Route | Page |
| --- | --- |
| `/register`, `/login` | Authentication |
| `/home` | Protected home page |
| `/products` | Product listing with search, filter and sort |
| `/products/:id` | Product details |
| `/wishlist` | Wishlist |
| `/cart` | Shopping cart |
| `/checkout` | Shipping form and Razorpay payment |
| `/order-success/:id` | Order confirmation |
| `/orders`, `/orders/:id` | Order history and order details |

## Security Notes

- `.env` files are listed in `.gitignore` and are never committed. Only `.env.example`, which holds placeholder values, is in the repository.
- Passwords are hashed with bcrypt before being stored.
- The JWT is kept in an httpOnly cookie, so page JavaScript cannot read it.
- Payments are verified on the server by checking the Razorpay signature with the key secret.

## Author

Akanksha Tidke
