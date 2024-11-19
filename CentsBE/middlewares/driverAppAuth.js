const jwt = require('jsonwebtoken');
const teamMemberModel = require('../models/teamMember');

async function verifyToken(req, res, next) {
    try {
        const { authtoken } = req.headers;
        if (authtoken) {
            const decodedToken = jwt.verify(authtoken, process.env.JWT_SECRET_TOKEN);
            req.locals = req.local || {};
            req.locals.decodedToken = decodedToken;

            const teamMember = await teamMemberModel.query().findOne({ userId: decodedToken.id });
            if (teamMember.isDeleted) {
                res.status(403).json({
                    error: 'User not found',
                });
            } else {
                next();
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
