const Role = require('../../../models/role');

/**
 * Get all Roles in the Cents ecosystem
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function getAllRoles(req, res, next) {
    try {
        const roles = await Role.query();

        return res.json({
            success: true,
            roles,
        });
    } catch (error) {
        return next(error);
    }
}

module.exports = exports = { getAllRoles };
