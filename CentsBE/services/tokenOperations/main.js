const jwt = require('jsonwebtoken');

class TokenOperations {
    constructor(inp) {
        this.inp = inp;
    }

    tokenGenerator(secret) {
        return jwt.sign(this.inp, secret);
    }

    verifyToken(secret) {
        return jwt.verify(this.inp, secret);
    }

    decodeToken(secret) {
        return jwt.decode(this.inp, secret);
    }
}

module.exports = exports = TokenOperations;
