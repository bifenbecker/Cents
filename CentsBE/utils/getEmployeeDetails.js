const employeeDetailsQuery = require('../queryHelpers/employeeDetailsQuery');

// helper function to get employee details.
async function getEmployeeDetails(employeeCode, businessId) {
    // only an employee with a valid employee code can proceed to this step (employee gating).
    const employee = await employeeDetailsQuery(employeeCode, businessId);
    // existence of an employee is guaranteed.
    const { id, firstname, lastname } = employee[0];
    const resp = {};
    resp.id = id;
    resp.name = `${firstname} ${lastname}`;
    resp.employeeCode = employeeCode;
    return resp;
}

module.exports = exports = getEmployeeDetails;
