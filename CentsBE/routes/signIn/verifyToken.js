const User = require('../../models/user');

const verifyToken = async (req, res, next) => {
    try {
        const { token } = req.query;
        if (!token) {
            throw new Error('No token present in the request.');
        } else {
            const isUser = await User.query().findOne({
                resetPasswordToken: token,
            });
            if (isUser) {
                return res.json({
                    success: true,
                });
            }
            return res.status(400).json({
                success: false,
                error: 'Token not found.',
            });
        }
    } catch (error) {
        return next(error);
    }
};
module.exports = exports = verifyToken;
