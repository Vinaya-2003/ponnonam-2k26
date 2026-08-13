# Ponnonam 2K26 - Onam Celebration Registration

A beautifully structured **Node.js + Express** registration platform for the Ponnonam 2K26 Onam celebration event.

## 📋 Project Structure

```
ponnonam-2k26/
├── src/                          # Backend source code
│   ├── server.js                # Main entry point
│   ├── config/                  # Configuration
│   │   └── constants.js
│   ├── routes/                  # API routes
│   │   └── registrations.js
│   ├── controllers/             # Route handlers
│   │   └── registrationController.js
│   ├── models/                  # Data models & persistence
│   │   └── Registration.js
│   ├── middleware/              # Express middleware
│   │   ├── auth.js
│   │   └── errorHandler.js
│   └── utils/                   # Helper functions
│       ├── validators.js
│       ├── exporters.js
│       └── logger.js
├── public/                       # Frontend static files
│   ├── index.html
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   ├── main.js             # Application entry point
│   │   ├── modules/
│   │   │   ├── navigation.js   # Page routing & navigation
│   │   │   ├── countdown.js    # Event countdown timer
│   │   │   ├── form.js         # Registration form logic
│   │   │   └── admin.js        # Admin panel functionality
│   │   └── utils/
│   │       └── api.js          # API communication
│   └── assets/                  # Images & SVGs
├── .data/                        # Data storage (generated)
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Copy and configure environment variables
cp .env.example .env
```

### Running the Application

```bash
# Development mode
npm run dev

# Or start directly
npm start

# Custom port
PORT=4000 npm start
```

The application will be available at `http://localhost:3000`

## 📡 API Endpoints

### Public Routes

- **POST** `/api/registrations` — Submit a new registration
  ```json
  {
    "fullName": "John Doe",
    "email": "john@example.com",
    "company": "COZMEK",
    "department": "AI",
    "participationCategory": "Cultural Performance",
    "culturalProgram": "Dance",
    "phone": "+91 XXXXX XXXXX",
    "sadhya": "Vegetarian"
  }
  ```

- **GET** `/api/health` — Health check

### Admin Routes (requires X-Admin-Key header)

- **GET** `/api/registrations` — List all registrations
  - Query params: `company`, `category`, `event`, `sadhya`
  
- **GET** `/api/registrations/stats` — Summary statistics

- **DELETE** `/api/registrations/:id` — Delete a registration

- **GET** `/api/registrations/export/csv` — Export as CSV

- **GET** `/api/registrations/export/excel` — Export as Excel

#### Admin Authentication

Pass the admin key via:
- Header: `X-Admin-Key: ponnonam2k26-admin`
- Query param: `?key=ponnonam2k26-admin`

## 🔐 Configuration

### Environment Variables

Copy `.env.example` to `.env` and configure:

```env
PORT=3000                                          # Server port
MONGO_URI=mongodb+srv://...                        # MongoDB connection string
ADMIN_KEY=ponnonam2k26-admin                       # Admin authentication key
```

### MongoDB Setup

1. **Create MongoDB Account** (free tier available)
   - Visit [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Sign up for a free account
   - Create a new cluster

2. **Get Connection String**
   - In MongoDB Atlas, click "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<username>`, `<password>`, and `<database>` with your values

3. **Add to .env**
   ```env
   MONGO_URI=mongodb+srv://your_username:your_password@cluster.domain/ponnonam2k26?retryWrites=true&w=majority
   ```

4. **Test Connection**
   ```bash
   npm start
   # Look for "Connected to MongoDB successfully" in logs
   ```

## 🎨 Frontend Features

- **Single Page Application (SPA)** with client-side routing
- **Countdown Timer** to the event
- **Responsive Design** — works on mobile, tablet, and desktop
- **Form Validation** with real-time feedback
- **Admin Panel** with registration management
- **Export Functionality** — CSV and Excel
- **LocalStorage Fallback** for offline support

## 🔧 Technology Stack

- **Backend**: Node.js, Express
- **Database**: MongoDB (Mongoose ODM)
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Data Format**: JSON (BSON in MongoDB)
- **Export**: Native OOXML (no additional dependencies)

## 📝 License

All rights reserved — Ponnonam 2K26

## 👥 Co-organizers

COZMEK &nbsp;•&nbsp; Disha Mentor &nbsp;•&nbsp; BSI &nbsp;•&nbsp; BBC

---

**Onam is not a festival, it's a sense of homecoming, togetherness, and thankfulness.**

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
