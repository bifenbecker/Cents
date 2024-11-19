const jwt = require('jsonwebtoken');
const argon2 = require('argon2');
const User = require('../../models/user');

const resetPassword = async (req, res, next) => {
    try {
        if (!req.body.password) {
            throw new Error('Missing required fields');
        }
        const { token } = req.query;
        if (!token) {
            return res.json({
                error: 'No token found.',
            });
        }
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET_TOKEN);
        if (decodedToken) {
            const user = await User.query().findOne({ resetPasswordToken: token });
            if (user) {
                const password = await argon2.hash(req.body.password);
                await User.query()
                    .patch({
                        password,
                        resetPasswordToken: null,
                        passwordResetDate: new Date(),
                        isVerified: true,
                    })
                    .where('id', '=', user.id);

                return res.json({
                    success: true,
                });
            }
            return res.json({
                error: 'Token not found.',
            });
        }
        throw new Error('Invalid token.');
    } catch (error) {
        return next(error);
    }
};

module.exports = exports = resetPassword;
