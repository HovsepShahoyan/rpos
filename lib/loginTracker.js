const fs = require('fs');
const path = require('path');

class LoginTracker {
    constructor() {
        this.logFile = path.join('/tmp', 'login_attempts.json');
        this.maxAttempts = 100;
    }

    _readAttempts() {
        try {
            if (!fs.existsSync(this.logFile)) return [];
            const data = fs.readFileSync(this.logFile, 'utf8');
            if (!data) return [];

            const parsed = JSON.parse(data);

            if (Array.isArray(parsed)) {
                return parsed;
            }

            if (parsed && typeof parsed === 'object') {
                if (Array.isArray(parsed.attempts)) return parsed.attempts;
                for (const k of Object.keys(parsed)) {
                    if (Array.isArray(parsed[k])) return parsed[k];
                }
            }

            console.warn('LoginTracker: unexpected content in log file, resetting to empty array.');
            return [];
        } catch (err) {
            console.error('LoginTracker: error reading/parsing attempts file:', err);
            return [];
        }
    }

    _writeAttempts(attempts) {
        try {
            if (!Array.isArray(attempts)) attempts = [];

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

    logAttempt(username, success, ipAddress) {
        const attempt = {
            timestamp: new Date().toISOString(),
            username: username,
            success: !!success,
            ipAddress: ipAddress || null
        };

        let attempts = this._readAttempts();
        if (!Array.isArray(attempts)) attempts = [];
        attempts.unshift(attempt);

        if (attempts.length > this.maxAttempts) {
            attempts = attempts.slice(0, this.maxAttempts);
        }

        this._writeAttempts(attempts);
    }

    getAttempts() {
        return this._readAttempts();
    }

    getRecentFailedAttempts(minutes = 15) {
        const attempts = this._readAttempts();
        const cutoffTime = new Date(Date.now() - (minutes * 60 * 1000));

        return attempts.filter(attempt =>
            !attempt.success && new Date(attempt.timestamp) > cutoffTime
        ).length;
    }

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
