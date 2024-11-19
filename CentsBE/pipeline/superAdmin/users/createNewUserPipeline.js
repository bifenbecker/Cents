const Pipeline = require('../../pipeline');

// Uows
const createUser = require('../../../uow/superAdmin/users/createUserUow');
const createUserRole = require('../../../uow/superAdmin/users/createUserRoleUow');
const createTeamMember = require('../../../uow/superAdmin/users/createTeamMemberUow');

/**
 * Run the pipeline to create a new User in the Cents ecosystem
 *
 * The pipeline contains the following units of work:
 *
 * 1) Create a new User model;
 * 2) Create UserRole model entries for each role selected;
 * 3) Create TeamMember model based on role selected;
 *
 * @param {Object} payload
 */
async function createNewUserPipeline(payload) {
    try {
        const userPipeline = new Pipeline([createUser, createUserRole, createTeamMember]);
        const output = await userPipeline.run(payload);
        return output;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = createNewUserPipeline;
