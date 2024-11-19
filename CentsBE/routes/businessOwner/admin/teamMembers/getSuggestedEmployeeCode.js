const TeamMember = require('../../../../models/teamMember');
const getBusiness = require('../../../../utils/getBusiness');

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
 * Retrieve a valid employee code as a suggestion for new team member creation
 *
 * Strategy:
 *
 * 1) Retrieve a list of all team members assigned to that business
 * 2) Add employee codes for these team members to an array
 * 3) Generate a random 4 digit number that excludes the employee codes already taken
 *
 * If no employees exist currently, then just return 1001
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function getSuggestedEmployeeCode(req, res, next) {
    try {
        const business = await getBusiness(req);
        const teamMembers = await TeamMember.query().where({
            businessId: business.id,
        });

        if (!teamMembers || teamMembers.length === 0) {
            return res.json({
                success: true,
                suggestedCode: 1001,
            });
        }

        const employeeCodes = teamMembers.map((members) => members.employeeCode);
        const randomNumber = await generateRandomNumberWithExclusions(employeeCodes);

        return res.json({
            success: true,
            suggestedCode: randomNumber,
        });
    } catch (error) {
        return next(error);
    }
}

module.exports = exports = getSuggestedEmployeeCode;
