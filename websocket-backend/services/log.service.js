class LogService {
    static write(message, scope) {
        console.log(`[${this.getLocalDate()}]: \x1b[32m[LOG]\x1b[0m${scope ? `\x1b[35m[${scope}]\x1b[0m` : ''} ${message}`);
    }

    static error(message, scope) {
        console.log(`[${this.getLocalDate()}]: \x1b[31m[ERROR]\x1b[0m${scope ? `\x1b[35m[${scope}]\x1b[0m` : ''} ${message}`);
    }

    static getLocalDate() {
        const date = new Date();
        date.setHours(date.getHours() + 3);
        return date.toJSON().slice(0, -5).replace(/T/, ' ');

    }
}

module.exports = {LogService}