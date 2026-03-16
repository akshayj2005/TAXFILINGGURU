# 📜 The Master Logger Implementation Prompt

Use this prompt to replicate this exact architecture in any other Node.js project. It is stripped of implementation code and focused entirely on behavioral logic and requirements.

---

## Role & Context
"Act as a Senior Backend Engineer. Implement a dual-layer logging system for a Node.js/Express application that separates Process/Debug Logs (File/Console) from Audit/Request Logs (MongoDB). Adhere to the following specifications exactly:"

## Phase 1: Scoped Utility Logger (utils/logger.js)
*   **Factory Pattern:** Create a logger that is initialized with a 'scope' string (e.g., `const logger = require('./logger')('payments')`).
*   **Storage:** Every log entry must append to a local `combined_terminal.log` file with a timestamp, the scope name, the log level, and the message.
*   **Visibility Logic:** Implement an environment-based filter. Console output should only occur if the scope is present in a `LOG_ALLOWED_SCOPES` comma-separated list.
*   **Support Flags:**
    *   `LOG_ALL=true`: Bypass filters.
    *   `LOG_ERRORS_ALL=true`: Ensure error level logs always hit the console regardless of scope settings.
    *   `LOG_DEBUG=true`: Toggle for granular debug visibility.

## Phase 2: API Audit Middleware (middleware/logRequestMiddleware.js)
*   **Correlation:** Generate a unique `requestId` (UUID) for every incoming request and attach it to the `req` object.
*   **Data Capture:** On `res.finish`, capture: HTTP method, URL, status code, response time, UserID, IP address, Geo-location, User-Agent, and full payload (Headers/Body/Query).
*   **Security & Redaction:** Implement a strict redaction function. Any field matching `password`, `token`, `secret`, or `authorization` must be replaced with `[REDACTED]` before saving.
*   **Async Storage:** Save this data to a `RequestLog` MongoDB collection without blocking the main response thread.

## Phase 3: Models & Integration
*   **Schema:** Define a Mongoose schema for `RequestLog` that reflects all captured metadata from Phase 2.
*   **Global Access:** Ensure the middleware can be applied globally to all routes or specific route groups.
*   **Analytics Endpoint:** Create a `POST /all_api_logs` endpoint that retrieves these logs, sorted by the most recent first, with support for basic filtering by `requestId` or `userId`.

## Phase 4: Validation (Testing Strategy)
*   **Redaction Check:** Verify that a request containing a password field is successfully redacted in the database.
*   **ID Consistency:** Verify that the `requestId` generated in the middleware is consistent across the life of the request and present in the final log.
