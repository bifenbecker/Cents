const stripe = require('./config');

const retrieveLocation = async (req, res, next) => {
    const locationId = req.query.id;

    try {
        stripe.terminal.locations.retrieve(locationId, (err, location) =>
            res.json({
                success: true,
                location,
            }),
        );
    } catch (error) {
        next(error);
    }
};

module.exports = exports = retrieveLocation;
