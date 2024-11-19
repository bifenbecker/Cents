const User = require('../../models/user');
const Store = require('../../models/store');

async function checkUserStore(userId, storeId) {
    const user = await User.query()
        .select('roles.userType')
        .join('userRoles', 'userRoles.userId', 'users.id')
        .join('roles', 'roles.id', 'userRoles.roleId')
        .where({
            'users.id': userId,
        })
        .whereNotIn('roles.userType', ['Employee', 'Customer'])
        .first();
    if (!user) {
        throw new Error('USER_NOT_FOUND');
    }
    const role = user.userType;
    if (role === 'Business Owner') {
        const isStore = await Store.query()
            .join('laundromatBusiness', 'laundromatBusiness.id', 'stores.businessId')
            .where({
                'laundromatBusiness.userId': userId,
                'stores.id': storeId,
            })
            .first();
        if (!isStore) {
            throw new Error('INVALID_STORE');
        }
    } else {
        const teamMemberStore = await Store.query()
            .join('teamMembers', 'teamMembers.businessId', 'stores.businessId')
            .where({
                'stores.id': storeId,
                'teamMembers.userId': userId,
            })
            .first();
        if (!teamMemberStore) {
            throw new Error('INVALID_STORE');
        }
    }
}

module.exports = exports = {
    checkUserStore,
};
