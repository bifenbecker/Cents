const TeamMember = require('../../../models/teamMember');

/**
 * Generate a random number that is not included in the current employee code list
 *
 * @param {Array} employeeCodes
 */
async function generateRandomNumberWithExclusions(employeeCodes) {
    let randomNumber = null;

    while (randomNumber === null || employeeCodes.includes(randomNumber)) {
        randomNumber = Math.floor(Math.random() * (9999 - 1000 + 1) + 1000);
    }

    return randomNumber;
}

/**
 * Use incoming payload to create new TeamMember
 *
 * @param {Object} payload
 */
async function createTeamMember(payload) {
    try {
        const newPayload = payload;
        const { transaction } = newPayload;

        if (newPayload.businessId) {
            let randomNumber = null;
            const teamMembers = await TeamMember.query().where({
                businessId: newPayload.businessId,
            });

            if (!teamMembers || teamMembers.length === 0) {
                randomNumber = 1001;
            }

            const employeeCodes = teamMembers.map((members) => members.employeeCode);
            randomNumber = await generateRandomNumberWithExclusions(employeeCodes);

            const teamMember = await TeamMember.query(transaction).insert({
                businessId: newPayload.businessId,
                userId: newPayload.createdUser.id,
                employeeCode: randomNumber,
            });

            newPayload.teamMember = teamMember;

            return newPayload;
        }

        return newPayload;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = createTeamMember;
