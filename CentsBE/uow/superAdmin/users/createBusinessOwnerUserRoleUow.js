const Role = require('../../../models/role');
const UserRole = require('../../../models/userRoles');

/**
 * Use incoming payload to create new "Business Owner" UserRole
 *
 * @param {Object} payload
 */
async function createBusinessOwnerUserRole(payload) {
    try {
        const newPayload = payload;
        const { transaction } = newPayload;

        const businessOwnerRole = await Role.query(transaction)
            .where({
                userType: 'Business Owner',
            })
            .first();

        const businessOwnerUserRole = await UserRole.query(transaction).insert({
            roleId: businessOwnerRole.id,
            userId: newPayload.createdUser.id,
        });

        newPayload.businessOwnerUserRole = businessOwnerUserRole;

        return newPayload;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = createBusinessOwnerUserRole;
