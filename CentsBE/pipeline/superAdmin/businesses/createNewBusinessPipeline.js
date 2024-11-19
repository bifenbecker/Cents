const Pipeline = require('../../pipeline');

// Uows
const createUser = require('../../../uow/superAdmin/users/createUserUow');
const createBusinessOwnerUserRole = require('../../../uow/superAdmin/users/createBusinessOwnerUserRoleUow');
const createBusiness = require('../../../uow/superAdmin/businesses/createBusinessUow');
const createDefaultBusinessSettings = require('../../../uow/superAdmin/businesses/createDefaultBusinessSettingsUow');
const createBusinessOrderCount = require('../../../uow/superAdmin/businesses/createBusinessOrderCountUow');
const createTeamMember = require('../../../uow/superAdmin/users/createTeamMemberUow');
const createDefaultDryCleaningCategories = require('../../../uow/superAdmin/categories/createDefaultDryCleaningServiceCategoriesUow');

/**
 * Run the pipeline to create a new LaundromatBusiness in the Cents ecosystem
 *
 * The pipeline contains the following units of work:
 *
 * 1) Create a new User model;
 * 2) Create "Business Owner" UserRole model;
 * 3) Create LaundromatBusiness model;
 * 4) Create BusinessSettings model;
 * 5) Create BusinessOrderCount model;
 * 6) Create Team-member model;
 * 7) Create default laundry ServiceCategory entries;
 * 8) Create default dry cleaning ServiceCategory entries;
 *
 * @param {Object} payload
 */
async function createNewBusinessPipeline(payload) {
    try {
        const businessPipeline = new Pipeline([
            createUser,
            createBusinessOwnerUserRole,
            createBusiness,
            createDefaultBusinessSettings,
            createBusinessOrderCount,
            createTeamMember,
            createDefaultDryCleaningCategories,
        ]);
        const output = await businessPipeline.run(payload);
        return output;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = createNewBusinessPipeline;
