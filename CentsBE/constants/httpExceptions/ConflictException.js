const { ERROR_MESSAGES } = require('../error.messages');
const HttpException = require('./HttpException');

class ConflictException extends HttpException {
    constructor(message = ERROR_MESSAGES.CONFLICT, messages) {
        super(409, message, messages);
    }
}

module.exports = ConflictException;
