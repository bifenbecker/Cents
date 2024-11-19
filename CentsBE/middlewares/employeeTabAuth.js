const jwt = require('jsonwebtoken');
const Store = require('../models/store');
const Settings = require('../models/businessSettings');

async function verifyToken(req, res, next) {
    try {
        const { authtoken } = req.headers;
        if (authtoken) {
            const decodedToken = jwt.verify(authtoken, process.env.JWT_SECRET_TOKEN);
            const store = await Store.query()
                .withGraphJoined('settings as storeSettings')
                .findById(decodedToken.id);
            if (store) {
                if (decodedToken.iat >= Math.floor(Number(store.passwordResetDate) / 1000)) {
                    const settings = await Settings.query().findOne({
                        businessId: store.businessId,
                    });
                    store.settings = settings;
                    req.currentStore = store;
                    next();
                } else {
                    res.status(401).json({
                        error: 'Please sign in to proceed.',
                    });
                }
            } else {
                res.status(403).json({
                    error: 'Store not found',
                });
            }
        } else {
            res.status(401).json({
                error: 'Please sign in to proceed.',
            });
        }
    } catch (error) {
        next(error);
    }
}

module.exports = exports = verifyToken;
