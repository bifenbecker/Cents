const Model = require('./index');

class TeamMemberCheckIn extends Model {
    static get tableName() {
        return 'teamMembersCheckIn';
    }
}

module.exports = exports = TeamMemberCheckIn;
