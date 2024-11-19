require('dotenv').config();
const jwt = require('jsonwebtoken');
const argon2 = require('argon2');

const User = require('../../../models/user');
const Role = require('../../../models/role');

const validator = require('../../../validations/signIn');
const LoggerHandler = require('../../../LoggerHandler/LoggerHandler');

async function signInSuperAdmin(req, res, next) {
    try {
        const errorCheck = validator(req.body);

        if (!errorCheck.error) {
            const user = await User.query().findOne({ email: req.body.username });
            if (user) {
                const verifyPassword = await argon2.verify(user.password, req.body.password);
                if (verifyPassword) {
                    const token = jwt.sign(
                        { id: user.id, role: user.roleId },
                        process.env.JWT_SECRET_TOKEN,
                    );
                    const userRole = await Role.query()
                        .select('roles.id as roleId', 'roles.userType as role')
                        .innerJoin('userRoles', 'roles.id', 'userRoles.roleId')
                        .innerJoin('users', 'users.id', 'userRoles.userId')
                        .where('users.id', user.id)
                        .andWhere('roles.userType', '=', 'Super Admin');
                    if (userRole.length) {
                        return res.json({
                            success: true,
                            user: {
                                userId: user.id,
                                roleId: userRole[0].roleId,
                                token,
                                isGlobalVerified: user.isGlobalVerified,
                            },
                        });
                    }
                }
                return res.status(403).json({
                    error: 'Invalid credentials.',
                });
            }
            return res.status(403).json({
                error: 'Invalid credentials.',
            });
        }

        const errMsg = errorCheck.error.message.split('[')[1].split(']')[0];
        LoggerHandler('error', errMsg, req);
        return res.status(422).json({
            error: errMsg,
        });
    } catch (error) {
        return next(error);
    }
}

module.exports = exports = signInSuperAdmin;
