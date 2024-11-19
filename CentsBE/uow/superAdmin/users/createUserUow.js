const argon2 = require('argon2');

const User = require('../../../models/user');

/**
 * Use incoming payload to create a new User model
 *
 * @param {Object} payload
 */
async function createUser(payload) {
    try {
        const newPayload = payload;
        const { transaction } = newPayload;

        const password = await argon2.hash(newPayload.user.password);

        const user = await User.query(transaction)
            .insert({
                firstname: newPayload.user.firstName,
                lastname: newPayload.user.lastName,
                email: newPayload.user.email,
                phone: newPayload.user.phone,
                password,
            })
            .returning('*');

        newPayload.createdUser = user;

        return newPayload;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = createUser;
