const User = require('../../models/user');
const Role = require('../../models/role');

async function checkPhoneNumber(phoneNumber, userId = 0, businessId) {
    try {
        // check if the user is already a customer or not,
        // is the user associated with current business or not.
        const response = {};
        if (userId || !businessId) {
            // if there is a user Id or it is a new user whose email validation is already done.
            const isUser = await User.query()
                .select('users.id as id', 'users.firstname as name')
                .leftJoin('secondaryDetails', 'secondaryDetails.userId', 'users.id')
                .where('users.phone', phoneNumber)
                .orWhere('secondaryDetails.phoneNumber', phoneNumber)
                .groupBy('users.id', 'users.firstname');
            if (isUser.length) {
                if (userId !== 0) {
                    const checkForOtherUsers = isUser.some((user) => user.id !== Number(userId));
                    if (checkForOtherUsers) {
                        return true;
                    }
                } else {
                    return true;
                }
            }
            return false;
        }
        // check incoming user who did not add email while sign up.
        const isUser = await Role.query()
            .select(
                'users.id as userId',
                'roles.userType as role',
                'secondaryDetails.businessId as businessId',
            )
            .join('userRoles', 'userRoles.roleId', 'roles.id')
            .join('users', 'users.id', 'userRoles.userId')
            .leftJoin('secondaryDetails', 'secondaryDetails.userId', 'users.id')
            .where('users.phone', phoneNumber)
            .orWhere('secondaryDetails.phoneNumber', phoneNumber)
            .groupBy('users.id', 'roles.userType', 'secondaryDetails.businessId');
        if (isUser.length) {
            // check for customer role.
            const checkForCustomer = isUser.some((x) => x.role === 'Customer');
            if (checkForCustomer) {
                // check if the user is associated with current business.
                const checkForCurrentBusiness = isUser.some(
                    (x) => x.businessId === Number(businessId),
                );
                if (checkForCurrentBusiness) {
                    // user is associated with current business as a customer.
                    response.error = true;
                    return response;
                }
                // user is a customer and not associated with current business.
                response.error = false;
                response.userId = isUser[0].userId;
                response.isAlreadyACustomer = !!checkForCustomer;
                return response;
            }
            // user is not a customer.
            response.error = false;
            response.userId = isUser[0].userId;
            response.isAlreadyACustomer = !!checkForCustomer;
            return response;
        }
        response.error = false;
        response.isNew = true;
        return response;
    } catch (error) {
        throw new Error(error);
    }
}

module.exports = exports = checkPhoneNumber;
