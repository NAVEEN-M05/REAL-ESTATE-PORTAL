# Smart Campus Resource and Energy Management System

A production-grade, software-only **Smart Campus Resource and Energy Management System** built with **React.js, Vite, Tailwind CSS, Recharts, Node.js, Express.js, and PostgreSQL**.

---

## 🌟 Highlights & Capabilities

- 🔋 **Live Energy Telemetry**: Simulated 24-hour diurnal power consumption curves, solar array generation offset, real-time waveform streaming, and carbon footprint tracker (kg CO₂/h).
- 💡 **Software-Based Automatic Light/Fan Control**: Pure software simulation of IoT presence sensors. When an auto-controlled room becomes empty (0 occupancy), idle lighting, fans, and cooling devices automatically power down to eliminate energy waste.
- 📅 **Room & Laboratory Booking**: Conflict-free scheduling with instant time overlap detection, automatic device pre-activation for approved sessions, and administrative workflow.
- 🚨 **Grid Alerts & Anomaly Detection**: Automatic energy spike alerts, unoccupied room waste tracking, manual anomaly injection for simulation testing, and one-click alert resolution.
- 📊 **ESG Energy-Saving Audits & Reports**: Weekly consumption comparisons against unmanaged baselines, department efficiency rankings, and one-click CSV audit export.
- 👥 **Role-Based Dashboards**: Tailored views and permissions for **Administrators**, **Faculty Members**, and **Students**, with a 1-click role switcher in the header.
- 🗄️ **PostgreSQL Integration with High-Fidelity Fallback**: Full PostgreSQL connection pooling and DDL schema migration, with an automatic in-memory fallback that allows immediate out-of-the-box execution even before PostgreSQL is configured!

---

## 🚀 Quick Start

### 1. One-Click Launch (Windows)
Double-click `run-project.bat` in the root folder.

### 2. Manual Launch via VS Code
In terminal 1 (Backend):
```bash
cd server
npm.cmd start
```
In terminal 2 (Frontend):
```bash
cd client
npm.cmd run dev
```

Open your browser at **http://localhost:5173**.

For complete setup instructions, PostgreSQL installation, and pgAdmin configuration, see [SETUP_GUIDE.md](file:///d:/java%208%20pro/SETUP_GUIDE.md).
