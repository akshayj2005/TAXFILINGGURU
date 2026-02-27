# 📊 TaxFilingGuru - Master Tracking & Logging System

This document outlines the multi-layer monitoring system implemented in this project.

## 1. 📂 Layer 1: Process & Debug Logs (File-Based)
**Location:** `utils/logger.js`  
**Purpose:** Captures internal code execution, entry/exit points, and system errors.

### Usage in Code:
```javascript
const logger = require('./utils/logger')('payment');
logger.info('Processing payment', { amount: 500 });
logger.error('Database connection failed', error);
```

### Storage:
*   **Combined Log:** `combined_terminal.log` (All scopes/levels)
*   **Daily Typed Logs:** `logs/YYYY-MM-DD-[level].log` (e.g., `logs/2026-02-23-error.log`)

---

## 2. 🛡️ Layer 2: API Audit Logs (MongoDB)
**Location:** `middleware/logRequestMiddleware.js`  
**Model:** `models/RequestLog.js`  
**Purpose:** Every incoming HTTP request is recorded with security redaction.

### Captured Metadata:
*   **Request ID:** Unique UUID (`X-Request-Id`) attached to every request.
*   **Security:** Automatically redacts `password`, `token`, `secret`, and `authorization` from headers and bodies.
*   **Context:** IP Address, Geo-location (City/Country), User-Agent, and Response Time (ms).

---

## 3. 👥 Layer 3: Client Identity & Presence Tracker
**Location:** `middleware/clientTracker.js`  
**Model:** `models/Visitor.js`  
**Purpose:** Tracks unique "People" even if they are not logged in.

### Mechanisms:
*   **Visitor ID:** A permanent cookie (`visitor_id`) set for **1 year**. This allows us to track if a user returns after 10, 30, or 365 days.
*   **Path History:** Stores the last 20 pages visited by the user.
*   **Online Status:** Dynamically identifies users active in the last 5 minutes.
*   **Returning vs New:** Identifies users who first visited more than 24 hours ago.

---

## 4. 🔗 Monitoring API Endpoints
Use these endpoints to view your data in real-time:

| Method | Endpoint | Purpose |
| :--- | :--- | :--- |
| `POST` | `/api/all_api_logs` | Search Audit logs by `userId` or `requestId`. |
| `GET` | `/api/online-users` | List all visitors currently on the site. |

---

## 5. ⚙️ Configuration (.env)
Control what appears in your terminal without stopping the server:

```bash
# Show everything in terminal
LOG_ALL=true 

# Only show specific modules
LOG_ALLOWED_SCOPES=auth,payment,tax 

# Ensure errors always show
LOG_ERRORS_ALL=true 

# Enable detailed debug messages
LOG_DEBUG=true
```

## 6. 🛠️ Troubleshooting Logs Not Appearing
1.  **Check `.env`**: Ensure `LOG_ALL=true` is set.
2.  **Check Files**: If the terminal is empty, check `combined_terminal.log` to see if logs are hitting the disk.
3.  **Check MongoDB**: Run `db.visitors.find({ isOnline: true })` in your Mongo shell to verify real-time tracking.
