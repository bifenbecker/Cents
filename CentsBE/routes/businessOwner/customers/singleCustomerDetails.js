const { raw } = require('objection');
const CentsCustomer = require('../../../models/centsCustomer');
const BusinessCustomer = require('../../../models/businessCustomer');

const getBusiness = require('../../../utils/getBusiness');

const { ERROR_MESSAGES } = require('../../../constants/error.messages');

function mapResponse(customer, credits) {
    const response = {};
    const tierPricing = {};
    const creditsArray = [];
    let availableCredit = null;

    const {
        id,
        fullName,
        email,
        phoneNumber,
        languageId,
        isCommercial,
        isInvoicingEnabled,
        pricingTierId,
        pricingTierName,
    } = customer;

    response.id = id;
    response.boFullName = fullName;
    response.boEmail = email;
    response.boPhoneNumber = phoneNumber;
    response.isCommercial = isCommercial;
    response.isInvoicingEnabled = isInvoicingEnabled;
    response.languageId = languageId;

    if (credits.length) {
        const credit = credits.map((a) => a.amount);

        availableCredit = credit.reduce((a, c) => a + c);

        for (const item of credits) {
            if (item.id !== null) {
                const temp = {};

                temp.reason = item.reasons;
                temp.id = item.id;
                temp.amount = item.amount;
                temp.issuedDate = item.createdAt;

                creditsArray.push(temp);
            }
        }
    }

    response.availableCredit = availableCredit;

    response.credits = creditsArray;

    if (pricingTierId) {
        tierPricing.id = pricingTierId;
        tierPricing.name = pricingTierName;
    }

    response.tier = tierPricing;

    return response;
}

async function getDetailsLogic(id, businessId) {
    try {
        const customer = await BusinessCustomer.query()
            .select(
                raw(`"centsCustomers"."id" as "id", 
            trim(concat("centsCustomers"."firstName", ' ', "centsCustomers"."lastName")) as "fullName", 
            "centsCustomers"."email" as "email", 
            "centsCustomers"."phoneNumber" as "phoneNumber",
            coalesce("centsCustomers"."languageId", 1) as "languageId",
            "businessCustomers"."isCommercial",
            "businessCustomers"."isInvoicingEnabled",
            "pricingTiers"."id" as "pricingTierId",
            "pricingTiers"."name" as "pricingTierName"`),
            )
            .join('centsCustomers', 'businessCustomers.centsCustomerId', 'centsCustomers.id')
            .leftJoin('pricingTiers', 'businessCustomers.commercialTierId', 'pricingTiers.id')
            .where({
                'businessCustomers.centsCustomerId': id,
                'businessCustomers.businessId': businessId,
                'businessCustomers.deletedAt': null,
            })
            .first();

        const credits = await CentsCustomer.query()
            .select(
                'creditHistory.id as id',
                'creditHistory.amount as amount',
                'creditHistory.createdAt as createdAt',
                'creditReasons.reason as reasons',
            )
            .join('creditHistory', 'creditHistory.customerId', 'centsCustomers.id')
            .join('creditReasons', 'creditHistory.reasonId', 'creditReasons.id')
            .where({
                'creditHistory.businessId': businessId,
                'centsCustomers.id': id,
            })
            .groupBy('creditHistory.id', 'creditReasons.reason');

        return customer ? mapResponse(customer, credits) : null;
    } catch (error) {
        throw new Error(error);
    }
}

async function getDetails(req, res, next) {
    try {
        const { id } = req.params;
        /**
         * Add date filter.
         * Change nested query to joins.
         */
        const business = await getBusiness(req);
        const businessId = business.id;
        const details = await getDetailsLogic(id, businessId);

        if (!details) {
            res.status(404).json({
                error: ERROR_MESSAGES.CUSTOMER_NOT_FOUND,
            });

            return;
        }

        res.status(200).json({
            success: true,
            details,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = exports = {
    getDetails,
    getDetailsLogic,
};
