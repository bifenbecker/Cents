const { raw } = require('objection');
const CentsCustomer = require('../../../models/centsCustomer');

/**
 * Retrieve the list of customers for a business using incoming query
 *
 * @param {Object} payload
 */
async function generateAllCustomersReportData(payload) {
    try {
        const newPayload = payload;
        const { options, transaction } = newPayload;

        const customersList = await CentsCustomer.query(transaction)
            .select(
                raw(
                    'distinct(trim(concat("centsCustomers"."firstName", \' \', "centsCustomers"."lastName"))) as "fullName"',
                ),
                'centsCustomers.email',
                'centsCustomers.phoneNumber',
                'stores.name as registrationLocation',
                raw(
                    `TO_CHAR("centsCustomers"."createdAt" AT TIME ZONE '${options.timeZone}', 'MM/DD/YYYY') as "registrationDate"`,
                ),
            )
            .join('storeCustomers', 'storeCustomers.centsCustomerId', 'centsCustomers.id')
            .join('stores', 'stores.id', 'storeCustomers.storeId')
            .leftJoin('serviceOrders', 'serviceOrders.storeCustomerId', 'storeCustomers.id')
            .whereIn('storeCustomers.storeId', options.stores);

        newPayload.finalReportData = customersList;
        newPayload.reportName = 'Cents_Customers_List.csv';
        newPayload.reportHeaders = [
            { id: 'fullName', title: 'Customer Name' },
            { id: 'email', title: 'Email' },
            { id: 'phoneNumber', title: 'Phone Number' },
            { id: 'registrationDate', title: 'Registration Date' },
            { id: 'registrationLocation', title: 'Registration Location' },
        ];
        newPayload.reportObjectType = 'object';
        return newPayload;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = generateAllCustomersReportData;
