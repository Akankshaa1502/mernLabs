# ShopKart Frontend (Lab 02)

React + Vite + React Router + Axios UI for the ShopKart auth backend (Lab 01).

## Run

1. Backend (project root): `npm run dev` → http://localhost:3000
2. Frontend (this folder): `npm install` then `npm run dev` → http://localhost:5173

Set `VITE_API_URL` in a `.env` file here if the backend runs somewhere else.

## Routes

| Route       | Page                                              |
| ----------- | ------------------------------------------------- |
| `/register` | Registration (`POST /customers/register`)         |
| `/login`    | Login (`POST /customers/login`, sets cookie)      |
| `/home`     | Protected home (`GET /customers/me`)              |

Logout is in the navbar (`POST /customers/logout`), which then redirects to `/login`.
