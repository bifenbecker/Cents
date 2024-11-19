const { ERROR_MESSAGES } = require('../error.messages');
const HttpException = require('./HttpException');

class NotFoundException extends HttpException {
    constructor(message = ERROR_MESSAGES.NOT_FOUND_ERROR, messages) {
        super(404, message, messages);
    }
}

module.exports = NotFoundException;
