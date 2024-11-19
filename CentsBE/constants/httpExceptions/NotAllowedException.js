const { ERROR_MESSAGES } = require('../error.messages');
const HttpException = require('./HttpException');

class NotAllowedException extends HttpException {
    constructor(message = ERROR_MESSAGES.NOT_ALLOWED, messages) {
        super(403, message, messages);
    }
}

module.exports = NotAllowedException;
