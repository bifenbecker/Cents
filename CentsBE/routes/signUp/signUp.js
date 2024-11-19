const { transaction } = require('objection');
const jwt = require('jsonwebtoken');

const User = require('../../models/user');
const LaundromatBusiness = require('../../models/laundromatBusiness');
const UserRole = require('../../models/userRoles');
const BusinessSettings = require('../../models/businessSettings');
const OrderCount = require('../../models/businessOrderCount');

const createTeamMemberUOW = require('../../uow/superAdmin/users/createTeamMemberUow');

const { hashPasswordGenerator } = require('../../utils/passwordGenerator');
const eventEmitter = require('../../config/eventEmitter');
const { emailNotificationEvents } = require('../../constants/constants');

async function createUser(req, res, next) {
    let trx = null;
    try {
        const { isNew } = req;
        if (isNew) {
            trx = await transaction.start(User.knex());
            const password = await hashPasswordGenerator();
            const token = jwt.sign({ email: req.body.email }, process.env.JWT_SECRET_TOKEN);
            const user = await User.query(trx)
                .insert({
                    firstname: req.body.firstName,
                    lastname: req.body.lastName,
                    email: req.body.email,
                    password,
                    isGlobalVerified: false,
                    resetPasswordToken: token,
                })
                .returning('*');

            const business = await LaundromatBusiness.query(trx)
                .insert({
                    userId: user.id,
                    name: req.body.companyName,
                })
                .returning('*');

            await createTeamMemberUOW({
                transaction: trx,
                businessId: business.id,
                createdUser: user,
            });
            await BusinessSettings.query(trx).insert({
                businessId: business.id,
            });
            await UserRole.query(trx).insert({
                userId: user.id,
                roleId: req.roleId,
            });
            await OrderCount.query(trx).insert({
                businessId: business.id,
                totalOrders: 0,
            });
            await trx.commit();
            eventEmitter.emit('emailNotification', emailNotificationEvents.RESET_PASSWORD, {
                user,
            });
        } else {
            trx = await transaction.start(User.knex());
            const { userId, roleId } = req;
            const user = await User.query(trx).findOne('id', userId);
            await UserRole.query(trx).insert({
                userId,
                roleId,
            });
            const business = await LaundromatBusiness.query(trx)
                .insert({
                    userId: user.id,
                    name: req.body.companyName,
                })
                .returning('*');
            await BusinessSettings.query(trx).insert({
                businessId: business.id,
            });
            await OrderCount.query(trx).insert({
                businessId: business.id,
                totalOrders: 0,
            });
            await trx.commit();
            eventEmitter.emit('emailNotification', emailNotificationEvents.RESET_PASSWORD, {
                user,
            });
        }
        res.status(200).json({
            success: true,
        });
    } catch (error) {
        if (trx) {
            await trx.rollback();
        }
        next(error);
    }
}

module.exports = exports = createUser;
