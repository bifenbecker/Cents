const router = require('express').Router();

const addValidations = require('../../../../validations/teamMembers/createTeamMember');
const addTeamMember = require('./addTeamMember');
const teamMembers = require('./fetchTeamMembers');
const updateTeamMember = require('./updateTeamMember');
const listTeamMembers = require('./listTeamMembers');
const listCheckedInEmployees = require('./listCheckedInEmployees');
const teamMemberDetails = require('./teamMemberDetails');
const insights = require('./insights');
const teamMembersReport = require('./teamMembersReport');
const TeamMemberSearch = require('./teamMemberSearch');
const teamMemberLogs = require('./teamMemberLogs');
const teamMemberLogInsights = require('./teamMemberLogInsights');
const updateLogs = require('./updateLogs');
const getSuggestedEmployeeCode = require('./getSuggestedEmployeeCode');

const teamMemberLogsValidation = require('../../../../validations/teamMembers/teamMemberLogs');
const teamMemberLogInsightsValidation = require('../../../../validations/teamMembers/teamMemberLogInsights');
const updateLogsValidation = require('../../../../validations/teamMembers/updateLogs');

const { validateArchiveTeamMemberInput, archiveTeamMember } = require('./archiveTeamMember');

router.post('/', addValidations, addTeamMember);
router.get('/search', TeamMemberSearch);
router.get('/', teamMembers);
router.put('/', updateTeamMember);
router.get('/report', teamMembersReport);
router.get('/list-all', listTeamMembers);
router.get('/list-checkedin-employees', listCheckedInEmployees);
router.get('/:id', teamMemberDetails);
router.get('/:id/insights', insights);
router.get('/:id/time-logs', teamMemberLogsValidation, teamMemberLogs);
router.get('/:id/time-logs/insights', teamMemberLogInsightsValidation, teamMemberLogInsights);
router.put('/:teamMemberId/time-logs/:id', updateLogsValidation, updateLogs);
router.get('/employee-codes/suggestion', getSuggestedEmployeeCode);
router.put('/archive/:teamMemberId', validateArchiveTeamMemberInput, archiveTeamMember);

module.exports = exports = router;
