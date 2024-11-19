const argon2 = require('argon2');
const jwt = require('jsonwebtoken');
const User = require('../../../models/user');
const Role = require('../../../models/role');
const Route = require('../../../models/route');

const routeDetails = async (userRoles) => {
    const route = await Route.query()
        .select('storeId')
        .where('driverId', userRoles[0].teamMemberId)
        .orderBy('updatedAt', 'desc')
        .first();
    return route;
};

async function signIn(req, res, next) {
    try {
        const user = await User.query().findOne({ email: req.body.email });
        if (user) {
            const verifyPassword = await argon2.verify(user.password, req.body.password);
            if (verifyPassword) {
                const userRoles = await Role.query()
                    .select(
                        'roles.id as roleId',
                        'roles.userType as role',
                        'teamMembers.id as teamMemberId',
                    )
                    .innerJoin('userRoles', 'roles.id', 'userRoles.roleId')
                    .innerJoin('users', 'users.id', 'userRoles.userId')
                    .innerJoin('teamMembers', 'teamMembers.userId', 'users.id')
                    .where('users.id', user.id)
                    .where('roles.userType', 'Employee')
                    .groupBy('roles.id', 'roles.userType', 'teamMembers.id');
                if (userRoles.length) {
                    const route = await routeDetails(userRoles);
                    const token = jwt.sign(
                        {
                            id: user.id,
                            teamMemberId: userRoles[0].teamMemberId,
                            role: userRoles[0].roleId,
                        },
                        process.env.JWT_SECRET_TOKEN,
                    );
                    return res.json({
                        success: true,
                        user: {
                            id: user.id,
                            name: `${user.firstname} ${user.lastname}`,
                            token,
                            lastRoutedStoreId: route ? route.storeId : null,
                        },
                    });
                }
                return res.status(403).json({
                    error: 'No user roles found.',
                });
            }
            return res.status(403).json({
                error: 'Invalid credentials.',
            });
        }
        return res.status(403).json({
            error: 'Invalid credentials.',
        });
    } catch (error) {
        return next(error);
    }
}

module.exports = exports = signIn;
