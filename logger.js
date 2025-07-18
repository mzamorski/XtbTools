class Logger {
    static Levels = {
        debug: 0,
        log: 1,
        warn: 2,
        error: 3
    };

    constructor(appName = 'APP', minLevel = 'log') {
        this.appName = appName;
        this.minLevel = Logger.Levels[minLevel] ?? Logger.Levels.log;
    }

    _shouldLog(level) {
        return Logger.Levels[level] >= this.minLevel;
    }

    _prefix() {
        return `[${this.appName}]`;
    }

    test(...args) {
        console.debug(this._prefix(), ...args);
    }

    debug(...args) {
        if (this._shouldLog('debug')) {
            console.debug(this._prefix(), ...args);
        }
    }

    log(...args) {
        if (this._shouldLog('log')) {
            console.log(this._prefix(), ...args);
        }
    }

    warn(...args) {
        if (this._shouldLog('warn')) {
            console.warn(this._prefix(), ...args);
        }
    }

    error(...args) {
        if (this._shouldLog('error')) {
            console.error(this._prefix(), ...args);
        }
    }

    setLevel(level) {
        if (level in Logger.Levels) {
            this.minLevel = Logger.Levels[level];
        } else {
            throw new Error(`Unknown log level: ${level}`);
        }
    }
}
