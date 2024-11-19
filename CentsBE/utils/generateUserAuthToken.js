const jwt = require('jsonwebtoken');

/**
 * Generate user auth token
 * @param {Object} user
 * @param {Object} role
 * @returns {string}
 */
function generateUserAuthToken(user, role) {
    return jwt.sign(
        {
            id: user.id,
            role: role.roleId,
            teamMemberId: user.teamMemberId,
        },
        process.env.JWT_SECRET_TOKEN,
    );
}

module.exports = generateUserAuthToken;
