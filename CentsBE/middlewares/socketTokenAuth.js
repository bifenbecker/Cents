const jwt = require('jsonwebtoken');
const Users = require('../models/user');
const LoggerHandler = require('../LoggerHandler/LoggerHandler');

const tokenAuth = async (token) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_TOKEN);
        LoggerHandler('info', 'Token verification');
        const user = await Users.query().findOne({ id: decoded.id });
        if (user) {
            if (decoded.iat >= Math.floor(Number(user.passwordResetDate) / 1000)) {
                LoggerHandler(
                    'info',
                    `Token verification successful for the user with id: ${user.id}`,
                );
                return user;
            }
            LoggerHandler('info', 'Token expired.');
            return false;
        }
        LoggerHandler('error', 'Invalid user.');
        return false;
    } catch (error) {
        LoggerHandler('error', error);
        return false;
    }
};

module.exports = exports = tokenAuth;
