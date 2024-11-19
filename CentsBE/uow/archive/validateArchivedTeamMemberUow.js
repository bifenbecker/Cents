const TeamMember = require('../../models/teamMember');

async function validateArchivedTeamMemberUow(payload, errorHandler) {
    const { modelId, archiveBoolean, transaction } = payload;
    const errorMessageBase = `Team member with id=${modelId}`;
    const teamMember = await TeamMember.query(transaction).findById(modelId);
    if (!teamMember) {
        errorHandler(`${errorMessageBase} does not exist.`);
        throw new Error(`${errorMessageBase} does not exist.`);
    }

    if (teamMember.isDeleted === archiveBoolean) {
        errorHandler(
            `${errorMessageBase} is already ${archiveBoolean ? 'archived' : 'unarchived'}`,
        );
        throw new Error(
            `${errorMessageBase} is already ${archiveBoolean ? 'archived' : 'unarchived'}`,
        );
    }
    return payload;
}

module.exports = validateArchivedTeamMemberUow;
