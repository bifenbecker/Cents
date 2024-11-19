// Packages
const argon2 = require('argon2');

// Models
const User = require('../../models/user');
const UserRole = require('../../models/userRoles');

// Utils
const { passwordGenerator } = require('../../utils/passwordGenerator');

/**
 * Create the User and UserRole for the laundromat business owner
 *
 * @param {Object} payload
 */
async function createBusinessOwner(payload) {
    try {
        const newPayload = payload;
        const { transaction } = newPayload;

        const password = await argon2.hash(passwordGenerator());
        const businessOwner = await User.query(transaction)
            .insert({
                firstname: newPayload.customer.firstname,
                lastname: newPayload.customer.lastname,
                phone: newPayload.customer.phone,
                email: newPayload.customer.email,
                password,
            })
            .returning('*');

        await UserRole.query(transaction).insert({
            userId: businessOwner.id,
            roleId: 2,
        });

        newPayload.businessOwner = businessOwner;

        return newPayload;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = createBusinessOwner;
