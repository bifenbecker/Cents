const Role = require('../../models/role');
const UserRole = require('../../models/userRoles');

async function checkUser(req, res, next) {
    try {
        const { id } = req.params;
        if (!id || !Number(id)) {
            res.status(422).json({
                error: 'User Id is required.',
            });
            return;
        }
        const role = await Role.query().findOne('userType', 'Customer');
        if (!role) {
            res.status(404).json({
                error: 'Customer Role not found.',
            });
            return;
        }
        const checkUserRole = await UserRole.query().findOne({
            userId: id,
            roleId: role.id,
        });
        if (!checkUserRole) {
            res.status(404).json({
                error: 'Given user is not a customer.',
            });
            return;
        }
        next();
    } catch (error) {
        next(error);
    }
}

module.exports = exports = checkUser;
