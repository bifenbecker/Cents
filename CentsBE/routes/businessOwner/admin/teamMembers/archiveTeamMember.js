const Joi = require('@hapi/joi');
const TeamMember = require('../../../../models/teamMember');
const User = require('../../../../models/user');
const { MAX_EMAIL_LENGTH } = require('../../../../constants/validation');
const { ARCHIVED_USER_EMAIL_PREFIX } = require('../../../../constants/constants');

const checkOutTeamMemberUow = require('../../../../uow/teamMember/checkOutTeamMemberUow');
const archiveModelPipeline = require('../../../../pipeline/archive/archiveModelPipeline');

const schema = Joi.object().keys({
    teamMemberId: Joi.number()
        .integer()
        .required()
        .error(new Error('"teamMemberId" must be an integer')),
    archiveBoolean: Joi.boolean()
        .invalid(false)
        .required()
        .error(new Error('only true is allowed for "archiveBoolean"')),
});

async function validateArchiveTeamMemberInput(req, res, next) {
    try {
        const { teamMemberId } = req.params;
        const { archiveBoolean } = req.body;

        const isValid = Joi.validate(
            {
                teamMemberId,
                archiveBoolean,
            },
            schema,
        );
        if (isValid.error) {
            res.status(422).json({
                error: isValid.error.message,
            });
            return;
        }
        next();
    } catch (error) {
        next(error);
    }
}

function getUserEmailWithArchivedPrefix(user) {
    return `${ARCHIVED_USER_EMAIL_PREFIX}${user.id}@${user.email}`.substring(0, MAX_EMAIL_LENGTH);
}

/**
 * Archive a given TeamMember
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function archiveTeamMember(req, res, next) {
    try {
        const {
            currentUser: { role },
        } = req;
        const { archiveBoolean } = req.body;

        if (archiveBoolean) {
            const { teamMemberId } = req.params;

            const payload = {
                modelName: TeamMember,
                modelChildName: null,
                modelId: teamMemberId,
                archiveBoolean,
                currentUserRole: role,
            };

            const errorHandler = async (error) => {
                res.status(422).json({
                    success: false,
                    error,
                });
            };
            await archiveModelPipeline(payload, errorHandler);

            const checkOutTime = new Date().toISOString();
            await checkOutTeamMemberUow({
                teamMemberId,
                checkOutTime,
            });
            // prefix email with archived
            const user = await User.query().findById(payload.archivedModel.userId);
            await user.$query().patch({ email: getUserEmailWithArchivedPrefix(user) });
        }

        return res.json({
            success: archiveBoolean, // for now we only allow archivation of teamMembers
        });
    } catch (error) {
        return next(error);
    }
}

module.exports = {
    validateArchiveTeamMemberInput,
    archiveTeamMember,
};
