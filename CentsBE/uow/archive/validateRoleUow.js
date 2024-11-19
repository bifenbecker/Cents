const UserRole = require('../../models/userRoles');

const rolesWithCoefficients = {
    'Business Owner': 5,
    'Business Admin': 4,
    'Business Manager': 3,
    Employee: 2,
};

const compareRoles = (currentUserRole, userToArchiveRole) => {
    if (rolesWithCoefficients[currentUserRole] < 4) {
        return { error: 'You have no permissions to archive user' };
    }
    if (rolesWithCoefficients[userToArchiveRole] >= rolesWithCoefficients[currentUserRole]) {
        return {
            error: `${currentUserRole} have no permissions to archive other ${userToArchiveRole}`,
        };
    }

    return { error: false };
};

async function validateRoleUow(payload, errorHandler) {
    try {
        const { modelId, currentUserRole, transaction } = payload;

        const { userType } = await UserRole.query(transaction)
            .select('userType')
            .join('teamMembers', 'userRoles.userId', '=', 'teamMembers.userId')
            .join('roles', 'roleId', '=', 'roles.id')
            .where({ 'teamMembers.id': modelId })
            .first();
        const res = compareRoles(currentUserRole, userType);
        if (res.error) {
            errorHandler(res.error);
            throw new Error(res.error);
        }
        return payload;
    } catch (err) {
        throw new Error(err);
    }
}

module.exports = validateRoleUow;
