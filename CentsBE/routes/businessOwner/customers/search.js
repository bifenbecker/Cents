const { raw } = require('objection');
const CentsCustomer = require('../../../models/centsCustomer');
const getBusiness = require('../../../utils/getBusiness');
const { mapResponse } = require('./getAllCustomers');

function responseMapper(customers) {
    return customers.map((customer) => mapResponse(customer));
}

// for customer search in customers panel we are searching on stores params
// for customer search in machines panel we are searching on businessId param
function customerSearchInBo(baseUrl, customers, businessId, stores) {
    const customer =
        baseUrl === '/api/v1/business-owner/machine'
            ? customers.where('storeCustomers.businessId', businessId)
            : customers.whereIn('storeCustomers.storeId', stores);
    return customer;
}

async function search(stores, keyword, page, businessId, req) {
    try {
        // Select secondaryDetails and in the result give preference to secondary details.
        // -> language, name, phoneNumber, email.
        let customers = CentsCustomer.query()
            .select(
                raw('count("centsCustomers".id) over () as "totalCount"'),
                'centsCustomers.id as id',
                raw(
                    'trim(concat("centsCustomers"."firstName", \' \', "centsCustomers"."lastName")) as "fullName"',
                ),
                'centsCustomers.email as email',
                'centsCustomers.phoneNumber as phoneNumber',
                raw(`
            array_agg(distinct jsonb_build_object(
                'storeCustomerId', "storeCustomers".id
                ,'boFullName', trim(concat("storeCustomers"."firstName", ' ', "storeCustomers"."lastName"))
                ,'boEmail', "storeCustomers".email
                ,'storeId', "storeCustomers"."storeId"
                ,'boPhoneNumber', "storeCustomers"."phoneNumber"
                ,'languageId', "storeCustomers"."languageId")
            ) as "boDetails", coalesce("centsCustomers"."languageId", 1) as "languageId"`),
            )
            .join('storeCustomers', 'storeCustomers.centsCustomerId', 'centsCustomers.id')
            .where((builder) => {
                builder
                    .whereRaw(
                        `("storeCustomers"."firstName"||"storeCustomers"."lastName") ILIKE '%${keyword.replace(
                            /\s+/g,
                            '',
                        )}%'`,
                    )
                    .orWhere('storeCustomers.email', 'ILIKE', `%${keyword}%`)
                    .orWhere('storeCustomers.phoneNumber', 'ILIKE', `%${keyword}%`);
            });
        customers = customerSearchInBo(req.baseUrl, customers, businessId, stores);
        await customers
            .groupBy('centsCustomers.id')
            .limit(30)
            .offset((Number(page) - 1) * 30);
        return customers;
    } catch (error) {
        throw new Error(error);
    }
}

async function searchUser(req, res, next) {
    try {
        const { keyword } = req.query;
        const business = await getBusiness(req);
        if (!keyword.trim() /* || keyword.length < 3 */) {
            res.status(422).json({
                error: 'Text is required.',
            });
        } else {
            const { page, stores } = req.query;
            const customers = await search(stores, keyword.trim(), page, business.id, req);
            res.status(200).json({
                success: true,
                detail: responseMapper(customers),
                totalCount: customers.length ? customers[0].totalCount : 0,
            });
        }
    } catch (error) {
        next(error);
    }
}

module.exports = exports = {
    searchUser,
    search,
};
