const stripe = require('./config');

const createConnectionToken = async (req, res, next) => {
    try {
        stripe.terminal.connectionTokens.create((err, connectionToken) =>
            res.json({
                success: true,
                secret: connectionToken,
            }),
        );
    } catch (error) {
        next(error);
    }
};

module.exports = exports = createConnectionToken;
