// packages
const hubspot = require('@hubspot/api-client');

// models
const LaundromatBusiness = require('../../../models/laundromatBusiness');
const User = require('../../../models/user');

// pipelines
const createBusinessPipeline = require('../../../pipeline/superAdmin/businesses/createNewBusinessPipeline');

/**
 * Retrieve Hubspot Contact/business owner details from a given deal
 *
 * @param {void} hubspotClient
 * @param {Number} dealId
 */
async function retrieveContactDetails(hubspotClient, dealId) {
    const contactData = await hubspotClient.apiRequest({
        method: 'GET',
        path: `/crm/v3/objects/deals/${dealId}/associations/contact`,
    });
    const { body } = contactData;
    const properties = ['firstname', 'lastname', 'email', 'phone'];
    const contact = await hubspotClient.crm.contacts.basicApi.getById(
        body.results[0].id,
        properties,
    );
    return contact.body;
}

/**
 * Retrieve a Hubspot company for a given deal
 *
 * @param {void} hubspotClient
 * @param {Number} companyId
 */
async function retrieveCompanyDetails(hubspotClient, dealId) {
    const companyData = await hubspotClient.apiRequest({
        method: 'GET',
        path: `/crm/v3/objects/deals/${dealId}/associations/company`,
    });
    const { body } = companyData;
    const properties = ['name', 'address', 'address2', 'city', 'state', 'zip', 'country'];
    const company = await hubspotClient.crm.companies.basicApi.getById(
        body.results[0].id,
        properties,
    );
    return company.body;
}

/**
 * Create the necessary business and user models when a contract is sent in Hubspot
 *
 * This function runs a pipeline that performs the following:
 *
 * 1) creates a BusinessOwner User
 * 2) creates a LaundromatBusiness
 * 3) creates default business settings
 * 4) sets up the proper business order count for order codes
 *
 * In order to identify the proper company and contact from hubspot, we will need to use
 * incoming payload or request body to retrieve the contact and company IDs, which we will
 * then use in separate requests prior to pipeline processing
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function createBusinessInformation(req, res, next) {
    try {
        if (process.env.ENV_NAME !== 'production') {
            return res.json({});
        }

        const { objectId } = req.body;
        const hubspotClient = new hubspot.Client({ apiKey: process.env.HUBSPOT_API_KEY });

        const dealData = await hubspotClient.apiRequest({
            method: 'GET',
            path: `/crm/v3/objects/deals/${objectId}`,
        });
        const { body } = dealData;

        const contact = await retrieveContactDetails(hubspotClient, body.id);
        const company = await retrieveCompanyDetails(hubspotClient, body.id);

        const isUserCreated = await User.query().findOne({
            phone: contact.properties.phone,
        });
        const isBusinessCreated = await LaundromatBusiness.query().findOne({
            name: company.properties.name,
        });

        if (isUserCreated) {
            return res.status(409).json({
                error: 'Business Owner is already created',
            });
        }

        if (isBusinessCreated) {
            return res.status(409).json({
                error: 'Business is already created',
            });
        }

        if (body.properties.dealstage !== '11541725') {
            return res.status(409).json({
                error: 'Hubspot deal is not at the "contract sent" stage.',
            });
        }

        const firstThreeName = contact.properties.firstname.substring(0, 3);
        const capitalLast = contact.properties.lastname.charAt(0).toUpperCase();
        const password = `${firstThreeName + capitalLast}123!`;

        const payload = {
            user: {
                firstName: contact.properties.firstname,
                lastName: contact.properties.lastname,
                email: contact.properties.email,
                phone: contact.properties.phone,
                password,
            },
            business: {
                name: company.properties.name,
                address: company.properties.address,
                address2: company.properties.address2,
                city: company.properties.city,
                state: company.properties.state,
                zipCode: company.properties.zip,
            },
        };

        const output = await createBusinessPipeline(payload);

        return res.json({
            success: true,
            output,
        });
    } catch (error) {
        return next(error);
    }
}

module.exports = exports = { createBusinessInformation };
