const stripe = require('./config');

const retrieveReader = async (req, res, next) => {
    const readerId = req.query.id;

    try {
        stripe.terminal.readers.retrieve(readerId, (err, reader) =>
            res.json({
                success: true,
                reader,
            }),
        );
    } catch (error) {
        next(error);
    }
};

module.exports = exports = retrieveReader;
