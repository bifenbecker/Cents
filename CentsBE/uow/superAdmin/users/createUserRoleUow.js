const Role = require('../../../models/role');
const UserRole = require('../../../models/userRoles');

/**
 * Find the proper role given a role name and create the UserRole entry
 *
 * @param {String} roleName
 * @param {Number} userId
 * @param {void} transaction
 */
async function createIndividualUserRoleEntry(roleName, userId, transaction) {
    const role = await Role.query(transaction)
        .where({
            userType: roleName,
        })
        .first();

    const userRole = await UserRole.query(transaction)
        .insert({
            userId,
            roleId: role.id,
        })
        .returning('*');

    return userRole;
}

/**
 * Use incoming payload to create new UserRole entries for selected roles
 *
 * @param {Object} payload
 */
async function createUserRole(payload) {
    try {
        const newPayload = payload;
        const { transaction, roles } = newPayload;

        let createdRoles = roles.map((role) =>
            createIndividualUserRoleEntry(role, newPayload.createdUser.id, transaction),
        );

        createdRoles = await Promise.all(createdRoles);

        newPayload.userRoles = createdRoles;

        return newPayload;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = createUserRole;
