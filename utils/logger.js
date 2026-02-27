const fs = require('fs');
const path = require('path');

const logDir = path.join(__dirname, '..', 'logs');
const combinedLogPath = path.join(__dirname, '..', 'combined_terminal.log');

// Ensure log directory exists
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

// Normalize environment variable scopes
const normalize = (list) => 
    (list || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean);

/**
 * Scoped Logger Factory
 * @param {string} scope The scope for this logger (e.g., 'payments')
 */
function createLogger(scope = 'app') {
    // Re-read env vars inside to ensure updates are reflected
    const logAll = process.env.LOG_ALL === 'true';
    const logErrorsAll = process.env.LOG_ERRORS_ALL === 'true';
    const logDebug = process.env.LOG_DEBUG === 'true';
    const allowedScopes = new Set(normalize(process.env.LOG_ALLOWED_SCOPES || 'app,auth,tax,payment'));

    const name = scope.toLowerCase();
    const prefix = `[${scope.toUpperCase()}]`;
    const isAllowed = allowedScopes.has(name) || logAll;

    const writeToFiles = (level, message) => {
        const now = new Date();
        const timestamp = now.toISOString();
        const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
        const logLine = `${timestamp} ${prefix} [${level.toUpperCase()}] ${message}\n`;

        // 1. Append to combined_terminal.log (Master Prompt requirement)
        try {
            fs.appendFileSync(combinedLogPath, logLine);
        } catch (err) {
            process.stderr.write(`Combined Log Write Error: ${err.message}\n`);
        }

        // 2. Append to date-based level file (e.g., logs/2026-02-23-error.log)
        const typedLogPath = path.join(logDir, `${dateStr}-${level.toLowerCase()}.log`);
        try {
            fs.appendFileSync(typedLogPath, logLine);
        } catch (err) {
            process.stderr.write(`Typed Log Write Error: ${err.message}\n`);
        }
    };

    const formatMessage = (args) => 
        args.map(arg => typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)).join(' ');

    const logAtLevel = (level, ...args) => {
        const message = formatMessage(args);
        
        // Console Visibility Logic
        let shouldPrint = isAllowed;
        if (level === 'error' && logErrorsAll) shouldPrint = true;
        if (level === 'debug' && (!logDebug || !isAllowed)) shouldPrint = false;

        if (shouldPrint) {
            console[level === 'log' ? 'log' : level](prefix, ...args);
        }

        // Write to both file targets
        writeToFiles(level, message);
    };

    return {
        log: (...args) => logAtLevel('log', ...args),
        info: (...args) => logAtLevel('info', ...args),
        warn: (...args) => logAtLevel('warn', ...args),
        error: (...args) => logAtLevel('error', ...args),
        debug: (...args) => logAtLevel('debug', ...args)
    };
}

module.exports = createLogger;
