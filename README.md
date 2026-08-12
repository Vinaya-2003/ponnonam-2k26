# Ponnonam 2K26 — Backend Setup Guide

## Quick Start

### 1. Install Node.js
Download and install Node.js (v18 LTS recommended) from:
https://nodejs.org/en/download

After installation, restart any open terminals.

### 2. Install Dependencies
Open a terminal/PowerShell in this folder and run:
```bash
npm install
```

### 3. Start the Server
```bash
npm start
```
or
```bash
node server.js
```

The site will be live at: **http://localhost:3000**

---

## Admin Panel

Visit: **http://localhost:3000/#admin**

Default passcode: `ponnonam2k26`

> To set a custom admin key, set the `ADMIN_KEY` environment variable:
> ```powershell
> $env:ADMIN_KEY = "your-secret-key"; node server.js
> ```

---

## API Reference

All admin endpoints require the `X-Admin-Key` header or `?key=` query parameter.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/health` | Public | Health check |
| `POST` | `/api/registrations` | Public | Submit a new registration |
| `GET` | `/api/registrations` | Admin | List all registrations |
| `DELETE` | `/api/registrations/:id` | Admin | Delete a registration by ID |
| `GET` | `/api/stats` | Admin | Summary statistics |
| `GET` | `/api/registrations/export/csv` | Admin | Download CSV file |
| `GET` | `/api/registrations/export/excel` | Admin | Download Excel (.xlsx) file |

### Filter Registrations
```
GET /api/registrations?company=COZMEK&category=Cultural+Performance
```

Available filters: `company`, `category`, `event`, `sadhya`

---

## Data Storage

All registrations are saved to: `data/registrations.json`

This file is human-readable and can be opened in any text editor.
Back up this file periodically to avoid data loss.

---

## Features

- **Duplicate detection** — same email + same event is rejected with a 409 error
- **Input validation** — all fields are validated server-side
- **Server-side Excel export** — no extra npm packages needed (pure Node.js)
- **Filterable admin API** — filter by company, category, event, sadhya
- **Stats endpoint** — get registration counts by company, event, and more
- **localStorage fallback** — works as a static site even without Node.js

---

## Folder Structure

```
Onam/
├── index.html          — Main site
├── script.js           — Frontend JavaScript
├── style.css           — Styles
├── server.js           — Node.js backend
├── package.json        — Dependencies
├── data/
│   └── registrations.json  — Registration data
└── assets/             — Images and SVGs
```
