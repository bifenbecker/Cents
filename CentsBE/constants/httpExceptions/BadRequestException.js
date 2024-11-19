const { ERROR_MESSAGES } = require('../error.messages');
const HttpException = require('./HttpException');

class BadRequestException extends HttpException {
    constructor(message = ERROR_MESSAGES.BAD_REQUEST, messages) {
        super(400, message, messages);
    }
}

module.exports = BadRequestException;
