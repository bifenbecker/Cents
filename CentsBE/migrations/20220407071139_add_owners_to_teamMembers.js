const TeamMember = require('../models/teamMember');
const CustomQuery = require('../services/customQuery');
const { transaction } = require('objection');
const LoggerHandler = require('../LoggerHandler/LoggerHandler');
const Model = require('../models/index');
/**
 * 
 * @param {array} employeeCodes 
 * @returns {Integer} randomNumber
 * 
 * This function generates a randomNumber
 */
async function generateRandomNumberWithExclusions(employeeCodes) {
    let randomNumber = null;
    while (randomNumber === null || employeeCodes.includes(randomNumber)) {
        randomNumber = Math.floor(Math.random() * (9999 - 1000 + 1) + 1000);
    }
    return randomNumber;
}
/**
 * 
 * @param {object} row 
 * @returns {object} payload
 * 
 * This function returns a modified version of the incoming object
 * to include an employeeCode which is required for the insert
 * into teamMembers table to succeed. 
 */
async function formatIndividualRows(row) {
    let payload = row;
    const employeeCode = await suggestedEmployeeCode(row.businessId);
    payload.employeeCode = employeeCode;
    return payload;
}
/**
 * 
 * @param {object} row 
 * @returns {Promise} indvidualTeamMember
 * 
 * This function is responsible for inserting the new teamMember into the
 * teamMembers table.
 */
async function createIndividualTeamMember(trx, row) {
    try {
        const individualTeamMember = await TeamMember.query(trx).insert(row);
        return individualTeamMember;
    } catch (e) {
        LoggerHandler('error inserting teamMember in add_owners_to_teamMembers migration script', e);
    }
}
/**
 * 
 * @param {integer} businessId 
 * @returns {integer} randomNumber
 * 
 * This function generates a suggestedEmployeeCode which checks the
 * existing teamMembers and their employeeCodes and generates 
 * the first non duplicate employeeCode and returns that value.
 */
async function suggestedEmployeeCode (businessId) {
    const teamMembers = await TeamMember.query().where({
        businessId: businessId,
    });
    if (!teamMembers || teamMembers.length === 0) {
        return 1001;
    }
    const employeeCodes = teamMembers.map((members) => members.employeeCode);
    const randomNumber = await generateRandomNumberWithExclusions(employeeCodes);
    return randomNumber;
}



exports.up = async function(knex) {
  /**
   * Migrate users with role owner that are not in the teamMembers table and add entries for them
   */
    Model.knex(knex);
    let trx;
    try {
        const query = new CustomQuery('employee-tab/find-missing-owners-from-teamMembers.sql');
        const response = await query.execute();
        const formattedRows = await Promise.all(response.map(async row => {
            return await formatIndividualRows(row);
        }
        ));
        trx = await transaction.start(TeamMember.knex());
        const newTeamMembers = formattedRows.map(row => {
            return createIndividualTeamMember(trx, row)
        });
        await Promise.all(newTeamMembers);
        await trx.commit();
      } catch (error) {
        if (trx) {
          await trx.rollback();
        }
        LoggerHandler('error in add_owners_to_teamMembers migration script', error);
        return;
    }
};

exports.down = function(knex) {
    return;
};
