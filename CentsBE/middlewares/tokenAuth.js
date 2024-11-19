const jwt = require('jsonwebtoken');
const userModel = require('../models/user');

const requireSignIn = (res) => {
    res.status(401).json({
        error: 'Please sign in to proceed.',
    });
};

const tokenAuth = async (req, res, next) => {
    try {
        if (req.headers.authtoken) {
            const receivedToken = req.headers.authtoken;
            const decodedToken = jwt.verify(receivedToken, process.env.JWT_SECRET_TOKEN);
            const user = await userModel
                .query()
                .leftJoinRelated('teamMember')
                .select('users.*', 'teamMember.isDeleted as isTeamMemberDeleted')
                .findOne({ 'users.id': decodedToken.id });

            if (user && !user.isTeamMemberDeleted) {
                if (decodedToken.iat >= Math.floor(Number(user.passwordResetDate) / 1000)) {
                    req.currentUser = user;
                    req.teamMemberId = decodedToken.teamMemberId;
                    next();
                } else {
                    requireSignIn(res);
                }
            } else {
                res.status(403).json({
                    error: 'User not found',
                });
            }
        } else {
            requireSignIn(res);
        }
    } catch (error) {
        next(error);
    }
};

module.exports = exports = tokenAuth;
