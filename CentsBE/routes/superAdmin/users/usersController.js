// packages
const argon2 = require('argon2');
const { transaction } = require('objection');

// Models
const User = require('../../../models/user');
const UserRole = require('../../../models/userRoles');
const Role = require('../../../models/role');
const Store = require('../../../models/store');
const TeamMember = require('../../../models/teamMember');

// Pipelines
const createNewUserPipeline = require('../../../pipeline/superAdmin/users/createNewUserPipeline');

/**
 * When loading an individual user, get the stores they belong to
 *
 * @param {Object} user
 * @returns {Array} stores
 */
async function getStoresForUser(user) {
    let stores = [];

    if (user.business) {
        stores = await Store.query().select('name').where({
            businessId: user.business.id,
        });
    }

    if (user.teamMember && !stores) {
        stores = await Store.query().select('name').where({
            businessId: user.teamMember.businessId,
        });
    }

    return stores;
}

/**
 * For each role a user has, return the name of the role
 *
 * @param {Array} roles
 */
async function formatUserRoles(roles) {
    let rolesArray = [];

    rolesArray = roles.map((role) => role.userType);

    return rolesArray;
}

/**
 * Format each user with appropriate details for front-end
 *
 * @param {Object} user
 */
async function mapUserData(user) {
    const mappedData = {};

    mappedData.id = user.id;
    mappedData.name = `${user.firstname} ${user.lastname}`;
    mappedData.email = user.email;
    mappedData.phone = user.phone;
    mappedData.isVerified = user.isVerified;
    mappedData.createdAt = user.createdAt;
    mappedData.updatedAt = user.updatedAt;
    mappedData.roles = await formatUserRoles(user.roles);

    return mappedData;
}

/**
 * Get all Users in the Cents ecosystem
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function getAllUsers(req, res, next) {
    try {
        const users = await User.query().withGraphFetched('[roles]').orderBy('createdAt', 'desc');

        let mappedUsers = users.map((item) => mapUserData(item));
        mappedUsers = await Promise.all(mappedUsers);

        return res.json({
            success: true,
            users: mappedUsers,
            total: mappedUsers.length,
        });
    } catch (error) {
        return next(error);
    }
}

/**
 * Create a new user in the Cents ecosystem
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function createNewUser(req, res, next) {
    try {
        const output = await createNewUserPipeline(req.body);

        return res.json({
            success: true,
            output,
        });
    } catch (error) {
        return next(error);
    }
}

/**
 * Get a list of all Users with the "Business Owner" role
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function getAllBusinessOwners(req, res, next) {
    try {
        const businessOwnerRole = await Role.query()
            .where({
                userType: 'Business Owner',
            })
            .first();

        const ownerMapping = await UserRole.query().select('userId').where({
            roleId: businessOwnerRole.id,
        });

        const userIds = ownerMapping.map((userRole) => userRole.userId);

        const businessOwners = await User.query().whereIn('id', userIds);

        return res.json({
            success: true,
            businessOwners,
        });
    } catch (error) {
        return next(error);
    }
}

/**
 * Get the details of an individual user
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function getIndividualUser(req, res, next) {
    try {
        const { id } = req.params;

        const user = await User.query()
            .withGraphFetched('[roles, business, teamMember.[business]]')
            .findById(id);
        const stores = await getStoresForUser(user);

        return res.json({
            success: true,
            user,
            stores,
        });
    } catch (error) {
        return next(error);
    }
}

/**
 * Update a user's password
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function updateUserPassword(req, res, next) {
    let trx = null;

    try {
        trx = await transaction.start(User.knex());

        const { password } = req.body;
        const { id } = req.params;

        const hashedPassword = await argon2.hash(password);

        const user = await User.query(trx)
            .withGraphFetched('[roles, business, teamMember]')
            .patch({
                password: hashedPassword,
            })
            .findById(id)
            .returning('*');

        await trx.commit();

        const stores = await getStoresForUser(user);

        return res.json({
            success: true,
            user,
            stores,
        });
    } catch (error) {
        if (trx) {
            await trx.rollback();
        }
        return next(error);
    }
}

/**
 * Search across our User models based on search input
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function searchUsers(req, res, next) {
    try {
        const { searchTerm } = req.query;
        const isSearchTermNumber = parseInt(searchTerm, 10);

        const users = await User.query()
            .withGraphFetched('[roles]')
            .select('users.*')
            .orWhere('users.firstname', 'ilike', `%${searchTerm}%`)
            .orWhere('users.lastname', 'ilike', `%${searchTerm}%`)
            .orWhere('users.email', 'ilike', `%${searchTerm}%`)
            .orWhere('users.phone', 'ilike', `%${searchTerm}%`)
            .modify((queryBuilder) => {
                if (isSearchTermNumber) {
                    queryBuilder.orWhere('users.id', '=', `${searchTerm}`);
                }
            });

        let mappedUsers = users.map((item) => mapUserData(item));
        mappedUsers = await Promise.all(mappedUsers);

        return res.json({
            success: true,
            users: mappedUsers,
            total: mappedUsers.length,
        });
    } catch (error) {
        return next(error);
    }
}

/**
 * Update a single item within the User model
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function updateIndividualValueForUser(req, res, next) {
    let trx = null;

    try {
        const { id } = req.params;
        const { field, value } = req.body;
        trx = await transaction.start(User.knex());

        const user = await User.query(trx)
            .withGraphFetched('[roles, business, teamMember]')
            .patch({
                [field]: value,
            })
            .findById(id)
            .returning('*');

        await trx.commit();

        const stores = await getStoresForUser(user);

        return res.json({
            success: true,
            user,
            stores,
        });
    } catch (error) {
        if (trx) {
            await trx.rollback();
        }
        return next(error);
    }
}

/**
 * Assign a non-employee or business owner to a different business
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function assignUserToBusiness(req, res, next) {
    let trx = null;
    try {
        const { id } = req.params;
        const { businessId } = req.body;

        trx = await transaction.start(TeamMember.knex());

        await TeamMember.query(trx)
            .patch({
                businessId,
            })
            .findOne({
                userId: id,
            })
            .returning('*');
        await trx.commit();

        const user = await User.query()
            .withGraphFetched('[roles, business, teamMember.[business]]')
            .findById(id);
        const stores = await getStoresForUser(user);

        return res.json({
            success: true,
            user,
            stores,
        });
    } catch (error) {
        if (trx) {
            await trx.rollback();
        }
        return next(error);
    }
}

/**
 * Edit a given user's employee code
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function editEmployeeCode(req, res, next) {
    let trx = null;

    try {
        const { id } = req.params;
        const { employeeCode } = req.body;

        trx = await transaction.start(User.knex());
        await TeamMember.query(trx)
            .patch({
                employeeCode,
            })
            .findOne({
                userId: id,
            })
            .returning('*');

        await trx.commit();

        const user = await User.query()
            .withGraphFetched('[roles, business, teamMember.[business]]')
            .findById(id);
        const stores = await getStoresForUser(user);

        return res.json({
            success: true,
            user,
            stores,
        });
    } catch (error) {
        if (trx) {
            await trx.rollback();
        }

        return next(error);
    }
}

module.exports = exports = {
    getAllUsers,
    createNewUser,
    getAllBusinessOwners,
    getIndividualUser,
    updateUserPassword,
    searchUsers,
    updateIndividualValueForUser,
    assignUserToBusiness,
    editEmployeeCode,
};
