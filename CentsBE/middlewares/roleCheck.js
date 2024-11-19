const Role = require('../models/role');

const isAuthorized = (roles) => async (req, res, next) => {
    try {
        const allowedRoles = await Role.query().select('id').whereIn('userType', roles);
        const roleIds = allowedRoles.map((allowedRole) => allowedRole.id);
        const user = req.currentUser;
        const userRoles = await user.getRoles();
        const isMatch = [];
        for (const userRole of userRoles) {
            const match = roleIds.some((id) => userRole.id === id);
            if (match) {
                isMatch.push(userRole);
                break;
            }
        }
        if (isMatch.length) {
            req.currentUser.role = isMatch[0].userType;
            next();
        } else {
            res.status(403).json({
                error: 'Unauthorized',
            });
        }
    } catch (error) {
        next(error);
    }
};

module.exports = exports = isAuthorized;
