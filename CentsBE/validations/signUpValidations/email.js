const { raw } = require('objection');
const Role = require('../../models/role');

async function checkEmail(email, roleToExclude, roleToInclude = '', userId = 0, businessId = 0) {
    try {
        const response = {};
        const isUser = await Role.query()
            .select(
                'users.id as userId',
                'roles.userType as role',
                'secondaryDetails.businessId as businessId',
            )
            .join('userRoles', 'userRoles.roleId', 'roles.id')
            .join('users', 'users.id', 'userRoles.userId')
            .leftJoin('secondaryDetails', 'secondaryDetails.userId', 'users.id')
            .where(raw('upper("users"."email")'), email)
            .orWhere(raw('upper("secondaryDetails"."email")'), email)
            .groupBy('users.id', 'roles.userType', 'secondaryDetails.businessId');
        if (isUser.length) {
            /**
             * check for other roles associated with the user.
             */
            if (userId !== 0) {
                const checkEmail = isUser.some((x) => x.userId !== Number(userId));
                // && x.businessId === businessId
                if (checkEmail) {
                    response.error = true;
                    response.message = 'Account already exists.';
                } else {
                    response.error = false;
                    response.isNew = true;
                }
                return response;
            }
            if (businessId !== 0) {
                const checkEmail = isUser.some((x) => x.businessId === businessId);
                if (checkEmail) {
                    response.error = true;
                    response.message = 'Account already exists.';
                    return response;
                }
            }
            let checkUserRole;
            let checkForCustomer;
            if (roleToInclude === 'Customer') {
                /* Check whether the existing account is of a customer or not. */
                checkForCustomer = isUser.some((x) => x.role === roleToInclude);
            } else {
                checkUserRole = isUser.some((x) => x.role !== roleToExclude);
            }

            if (checkUserRole) {
                response.error = true;
                response.message = 'Account already exists.';
            } else {
                response.error = false;
                response.userId = isUser[0].userId;
                response.isAlreadyACustomer = !!checkForCustomer;
            }
        } else {
            /**
             * If user is not found -> new User.
             */
            response.error = false;
            response.isNew = true;
        }
        return response;
    } catch (error) {
        throw new Error(error);
    }
}

module.exports = checkEmail;
