// loginTracker.js
const fs = require('fs');
const path = require('path');

class LoginTracker {
    constructor() {
        this.logFile = path.join('/tmp', 'login_attempts.json');
        this.maxAttempts = 100; // Keep last 100 attempts
    }

    // Internal: read attempts from disk and always return an Array
    _readAttempts() {
        try {
            if (!fs.existsSync(this.logFile)) return [];
            const data = fs.readFileSync(this.logFile, 'utf8');
            if (!data) return [];

            const parsed = JSON.parse(data);

            if (Array.isArray(parsed)) {
                return parsed;
            }

            // If file contains an object with a property that is an array (compatibility)
            if (parsed && typeof parsed === 'object') {
                if (Array.isArray(parsed.attempts)) return parsed.attempts;
                // try to find first array property
                for (const k of Object.keys(parsed)) {
                    if (Array.isArray(parsed[k])) return parsed[k];
                }
            }

            // Otherwise the content is unexpected (object/string/etc.) — warn and reset
            console.warn('LoginTracker: unexpected content in log file, resetting to empty array.');
            return [];
        } catch (err) {
            console.error('LoginTracker: error reading/parsing attempts file:', err);
            return [];
        }
    }

    // Internal: write attempts atomically (tmp -> rename)
    _writeAttempts(attempts) {
        try {
            // enforce array
            if (!Array.isArray(attempts)) attempts = [];

            // enforce maxEntries
            if (this.maxAttempts && attempts.length > this.maxAttempts) {
                attempts = attempts.slice(0, this.maxAttempts);
            }

            const tmp = this.logFile + '.tmp';
            fs.writeFileSync(tmp, JSON.stringify(attempts, null, 2), 'utf8');
            fs.renameSync(tmp, this.logFile);
        } catch (err) {
            console.error('LoginTracker: failed to write attempts file:', err);
        }
    }

    /**
     * Log a login attempt
     * @param {string} username - The username attempted
     * @param {boolean} success - Whether the login was successful
     * @param {string} ipAddress - The IP address of the attempt
     */
    logAttempt(username, success, ipAddress) {
        const attempt = {
            timestamp: new Date().toISOString(),
            username: username,
            success: !!success,
            ipAddress: ipAddress || null
        };

        let attempts = this._readAttempts();
        if (!Array.isArray(attempts)) attempts = []; // defensive

        // Add to beginning (newest first)
        attempts.unshift(attempt);

        // Keep only the last maxAttempts entries
        if (attempts.length > this.maxAttempts) {
            attempts = attempts.slice(0, this.maxAttempts);
        }

        this._writeAttempts(attempts);
    }

    /**
     * Get all login attempts
     * @returns {Array} Array of login attempts
     */
    getAttempts() {
        return this._readAttempts();
    }

    /**
     * Get recent failed attempts count
     * @param {number} minutes - Time window in minutes
     * @returns {number} Count of failed attempts
     */
    getRecentFailedAttempts(minutes = 15) {
        const attempts = this._readAttempts();
        const cutoffTime = new Date(Date.now() - (minutes * 60 * 1000));

        return attempts.filter(attempt =>
            !attempt.success && new Date(attempt.timestamp) > cutoffTime
        ).length;
    }

    /**
     * Check if IP should be blocked due to too many failed attempts
     * @param {string} ipAddress - IP address to check
     * @param {number} maxFailed - Maximum allowed failed attempts
     * @param {number} minutes - Time window in minutes
     * @returns {boolean} True if IP should be blocked
     */
    shouldBlockIP(ipAddress, maxFailed = 5, minutes = 15) {
        const attempts = this._readAttempts();
        const cutoffTime = new Date(Date.now() - (minutes * 60 * 1000));

        const failedAttempts = attempts.filter(attempt =>
            attempt.ipAddress === ipAddress &&
            !attempt.success &&
            new Date(attempt.timestamp) > cutoffTime
        );

        return failedAttempts.length >= maxFailed;
    }
}

module.exports = LoginTracker;
