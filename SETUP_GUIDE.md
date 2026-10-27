# 🏫 Smart Campus Resource & Energy Management System
## Beginner-Friendly VS Code & PostgreSQL Setup Guide

Welcome to the **Smart Campus Resource and Energy Management System**! This is a complete, enterprise-grade software-only full-stack solution featuring:
- **Frontend**: React.js, Vite, Tailwind CSS, Lucide Icons, Recharts Analytics
- **Backend**: Node.js, Express.js, PostgreSQL (`pg` pool) with SQL DDL migrations
- **Telemetry Engine**: 100% software-based simulated sensor loop (diurnal load curves, simulated PIR occupancy, automatic equipment shutoff, carbon footprint calculations, and peak anomaly detection)

---

## ⚡ Zero-Friction Quick Start (Test Right Away!)

Even if you do **not** have PostgreSQL installed on your computer yet, the application includes a **Seamless High-Fidelity Data Store Fallback**. You can start exploring all features immediately!

### Option A: One-Click Launch (Windows)
Double-click the `run-project.bat` file in the project root:
```
d:\java 8 pro\run-project.bat
```
This automatically opens both backend and frontend servers in separate windows.

---

### Option B: Run via VS Code Integrated Terminal

1. **Open VS Code**:
   - Open Visual Studio Code.
   - Click **File** -> **Open Folder...** -> select `D:\java 8 pro`.

2. **Open Integrated Terminal** in VS Code:
   - Press `Ctrl + ~` (or click **Terminal** -> **New Terminal**).

3. **Start the Backend Server**:
   ```powershell
   cd server
   npm.cmd start
   ```
   *The backend will boot up on `http://localhost:5000` with the simulated telemetry engine running every 4 seconds.*

4. **Start the Frontend Client**:
   - Split the terminal (click the `+` icon or `Ctrl + Shift + 5` to open a 2nd terminal pane).
   ```powershell
   cd client
   npm.cmd run dev
   ```
   *The frontend will boot up on `http://localhost:5173`.*

5. **Open in Browser**:
   - Navigate to: **[http://localhost:5173](http://localhost:5173)**

---

## 🗄️ PostgreSQL Installation & Configuration Guide

When you are ready to connect to a real local PostgreSQL database:

### Step 1: Install PostgreSQL on Windows
1. Download the official installer from: **https://www.enterprisedb.com/downloads/postgres-postgresql-downloads**
2. Choose **PostgreSQL 15 or 16 for Windows x86-64**.
3. Run the installer:
   - Accept the default installation directory (`C:\Program Files\PostgreSQL\16`).
   - Keep all components selected (**PostgreSQL Server**, **pgAdmin 4**, **Command Line Tools**).
   - Enter a superuser password for the `postgres` user (e.g., `postgres` or `admin123`). **Remember this password!**
   - Keep the default port as `5432`.
   - Click **Next** until installation finishes.

### Step 2: Create the Database in pgAdmin 4
1. Open **pgAdmin 4** from your Windows Start Menu.
2. Enter your master password to unlock the servers.
3. In the left browser tree, expand **Servers** -> **PostgreSQL 16**.
4. Right-click on **Databases** -> **Create** -> **Database...**
5. Enter Database name: `smart_campus`
6. Click **Save**.

*(Alternatively, via PowerShell or Command Prompt:)*
```bash
psql -U postgres -c "CREATE DATABASE smart_campus;"
```

### Step 3: Configure Environment Variables
Open `d:\java 8 pro\server\.env` in VS Code and set your PostgreSQL credentials:
```env
PORT=5000
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/smart_campus
PGHOST=localhost
PGPORT=5432
PGUSER=postgres
PGPASSWORD=YOUR_PASSWORD
PGDATABASE=smart_campus
JWT_SECRET=campus_ultra_secure_jwt_token_secret_key_2026
NODE_ENV=development
```
*(Replace `YOUR_PASSWORD` with the password you set during installation)*

### Step 4: Restart the Backend
Stop the backend in VS Code terminal (`Ctrl + C`) and run:
```powershell
npm.cmd start
```
You will see:
```
✅ [Database] Successfully connected to PostgreSQL database!
✅ [Database] PostgreSQL schema verified and applied.
🌱 [Seeder] Seeded dataset into PostgreSQL database.
🚀 [Server] Smart Campus Backend running on http://localhost:5000
```
The backend automatically executes `server/src/models/schema.sql` to create all 8 relational tables and inserts initial campus data!

---

## 👥 Demo Personas & Role Switcher

You do not need to memorize passwords! Use the **Role Switcher Pills** in the top navigation bar to test all 3 personas instantly with 1 click:

| Role | Demo Email | Password | Primary Capabilities |
| :--- | :--- | :--- | :--- |
| **🛡️ Administrator** | `admin@campus.edu` | `admin123` | Campus-wide energy supervision, bulk room eco-shutdown, approve bookings, resolve alarms, export ESG reports |
| **🎓 Faculty Member** | `prof.sarah@campus.edu` | `faculty123` | Instant lab/lecture hall bookings, classroom equipment control, department metrics |
| **🎒 Student Scholar** | `alex.student@campus.edu` | `student123` | Study pod/lab reservations, view campus diurnal load, ESG awareness |

---

## 🎯 How to Verify and Test Key Features

### 1. Automatic Light & Fan Shutoff (Software Sensor Simulation)
1. Go to the **Smart Device Control** tab in the sidebar.
2. Locate any room with active equipment (e.g., **Robotics & AI Lab (ASTB-301)** or **CAD Simulation Center**).
3. Ensure **"Auto-Eco: ON"** is active.
4. Click the **"Empty (0)"** occupancy simulation button.
5. Within 4 seconds, the backend simulation engine detects zero occupants and **automatically turns off the idle lights and fans**!
6. Notice a notification toast appears and a new energy-saving record is logged in the **Alerts & Anomalies** center.

### 2. Room & Lab Booking with Conflict Detection
1. Go to the **Room & Lab Booking** tab.
2. Click **"+ New Reservation"**.
3. Try booking a room (e.g. *Robotics & AI Lab*) for an existing time slot (e.g., today between 10:00 AM - 12:00 PM).
4. Notice the system **detects the schedule overlap and prevents duplicate bookings**!
5. Select an open time slot and click **Confirm Reservation** — the booking is created and displayed.

### 3. Grid Anomaly & High Load Alert Simulation
1. Go to the **Alerts & Anomalies** tab.
2. Click **"+ Energy Spike"** or **"+ Idle Room Waste"** in the top right.
3. Watch the system immediately flag a high-severity alert, update the notification bell counter in the navbar, and adjust the campus efficiency index.
4. Click **"Resolve"** on any alert to clear the issue.

### 4. ESG Audits & Energy Reports Export
1. Go to the **Audits & Reports** tab.
2. Inspect the **Weekly Consumption vs Baseline Target** chart and the **Department Efficiency Leaderboard**.
3. Click **"Download CSV Audit"** to export an instant spreadsheet report of institutional energy metrics.

---

## 📁 Project Architecture

```
d:\java 8 pro\
├── client\                  # React 18 + Vite + Tailwind CSS + Recharts
│   ├── src\
│   │   ├── components\      # Navbar, Sidebar, StatCard, Modal
│   │   ├── context\         # AuthContext (Role Switcher), CampusContext (Live Telemetry Loop)
│   │   ├── pages\           # Dashboard, EnergyMonitoring, DeviceControl, RoomBooking, AlertsCenter, ReportsAnalytics
│   │   ├── services\api.js  # REST API client
│   │   └── App.jsx
│   └── vite.config.js       # Vite configuration with API reverse proxy
│
├── server\                  # Node.js + Express + PostgreSQL Backend
│   ├── src\
│   │   ├── config\db.js     # Dual Postgres pool + In-Memory Fallback Adapter
│   │   ├── controllers\     # Auth, Energy, Rooms, Devices, Bookings, Alerts, Reports
│   │   ├── middleware\      # JWT Authentication & Role Authorization
│   │   ├── models\schema.sql# PostgreSQL DDL tables & indexes
│   │   ├── services\        # Simulation Engine (4s live loop) & Seed Service
│   │   └── index.js         # Server entry point
│   ├── .env                 # Database credentials & JWT secret
│   └── package.json
│
├── run-project.bat          # One-click Windows launch script
├── SETUP_GUIDE.md           # This document
└── README.md                # Project documentation
```
