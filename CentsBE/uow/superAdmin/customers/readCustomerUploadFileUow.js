const neatCsv = require('neat-csv');

/**
 * Extract the customer phone number
 *
 * @param {String} cellPhone
 */
function getPhoneNumber(cellPhone) {
    if (cellPhone && cellPhone.trim() && cellPhone.length >= 10) {
        return cellPhone.trim().replace(/[^\d]/g, '');
    }
    return null;
}

/**
 * Capitalize the first letter of the incoming string
 *
 * @param {String} str
 */
function capitalizeFirstLetter(str) {
    if (str && str.trim()) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
    return str;
}

/**
 * Package the row data for model insert functions
 *
 * @param {Object} row
 */
function prepareRow(row) {
    const { firstName, lastName, phoneNumber, email } = row;
    return {
        firstName: capitalizeFirstLetter(firstName),
        lastName: capitalizeFirstLetter(lastName),
        email: email ? email.trim() : null,
        phoneNumber: getPhoneNumber(phoneNumber),
    };
}

/**
 * Process the incoming rows from CSV
 *
 * @param {Array} data
 */
function filterData(data) {
    const phoneNumbers = {};
    const emails = {};
    const resp = [];

    for (const i of data) {
        const Phone = getPhoneNumber(i.phoneNumber);
        const Email = i.email;
        const Name = `${i.firstName} ${i.lastName}`;
        if (((Phone && Phone.trim()) || (Email && Email.trim())) && Name && Name.trim()) {
            let phoneCount = 0;
            let emailCount = 0;
            if (Phone) {
                phoneCount = (phoneNumbers[Phone.trim()] || 0) + 1;
                phoneNumbers[Phone.trim()] = phoneCount;
            }
            if (i.Email) {
                emailCount = (emails[Email.trim()] || 0) + 1;
                emails[Email.trim()] = (emails[Email.trim()] || 0) + 1;
            }
            // ignore duplicate, always use the first record.
            if (phoneCount < 2 && emailCount < 2) {
                resp.push(prepareRow(i));
            }
        }
    }
    return resp;
}

/**
 * Read the data and filter accordingly
 *
 * @param {String} filePath
 */
async function readFile(filePath) {
    const regex = /^data:.+\/(.+);base64,(.*)$/;
    const matches = filePath.match(regex);
    const data = matches[2];
    const buffer = Buffer.from(data, 'base64');
    const csvData = await neatCsv(buffer);
    return filterData(csvData);
}

/**
 * Read the file to upload and return rows
 *
 * @param {Object} payload
 */
async function readCustomerUploadFile(payload) {
    try {
        const newPayload = payload;
        const { fileToUpload } = newPayload;

        const fileRecords = await readFile(fileToUpload);
        newPayload.fileRecords = fileRecords;

        return newPayload;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = readCustomerUploadFile;
