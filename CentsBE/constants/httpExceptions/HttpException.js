class HttpException extends Error {
    constructor(status, message = '', messages = []) {
        super(message);
        this.statusCode = status;
        this.messages = messages;
    }
}

module.exports = HttpException;
