const axios = require('axios');
const LoggerHandler = require('../../../LoggerHandler/LoggerHandler');

const SpyderWashSettings = require('../../../models/spyderWashSettings');

/**
 * Obtain a SpyderWash authentication token
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 * @returns {Object} the response
 *
 * The authentication response directly from SpyderWash API looks like this:
 *
 * {
 *   responseData: {
 *          "status": 200,
 *          "data": {
 *              token: "this_is_the_jrr_tolkien"
 *          },
 *   },
 * }
 */
async function retrieveSpyderWashAuthToken(req, res, next) {
    try {
        const { currentStore } = req;
        const spyderWashSettings = await SpyderWashSettings.query().findOne({
            storeId: currentStore.id,
        });

        if (!spyderWashSettings) {
            const errMsg =
                'SpyderWash settings have not been configured. Please visit the Cents Business Manager or reach out to Cents Support for assistance in setting this up!';
            LoggerHandler('error', errMsg, req);
            return res.status(422).json({
                error: errMsg,
            });
        }

        const headers = {
            'Content-Type': 'application/json',
        };
        const params = {
            EmailAddress: spyderWashSettings.email,
            Password: spyderWashSettings.password,
            PosId: spyderWashSettings.posId,
        };
        const url = 'http://posapi.spyderwash.com/api/Login/GetLoginToken';

        const response = await axios.post(url, params, {
            headers,
        });
        const data = await response.data;
        const { responseData } = data;

        return res.status(200).json({
            success: true,
            data: responseData.data,
        });
    } catch (error) {
        return next(error);
    }
}

/**
 * Check the customer's SpyderWash card balance
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function checkSpyderWashCardBalance(req, res, next) {
    try {
        const { body, currentStore } = req;
        const { spyderWashAuthToken, cardNumber } = body;
        const spyderWashSettings = await SpyderWashSettings.query().findOne({
            storeId: currentStore.id,
        });

        const headers = {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${spyderWashAuthToken}`,
            Host: 'posapi.spyderwash.com',
        };
        const params = {
            LoyaltyCardNo: cardNumber,
            OperatorCode: spyderWashSettings.operatorCode,
            LocationCode: spyderWashSettings.locationCode,
        };
        const url = 'http://posapi.spyderwash.com/api/UserInfo/GetLoyaltyCardDetails';

        const response = await axios.post(url, params, {
            headers,
        });
        const data = await response.data;

        return res.status(200).json({
            success: true,
            data: data.data,
        });
    } catch (error) {
        return next(error);
    }
}

/**
 * Deduct given amount from a SpyderWash card
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function deductBalanceFromSpyderWashCard(req, res, next) {
    try {
        const { body, currentStore } = req;
        const { spyderWashAuthToken, serviceOrderId, balanceDue, cardNumber } = body;
        const spyderWashSettings = await SpyderWashSettings.query().findOne({
            storeId: currentStore.id,
        });
        const headers = {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${spyderWashAuthToken}`,
            Host: 'posapi.spyderwash.com',
        };
        const params = {
            TransactonId: serviceOrderId,
            ItemName: 'Cents Wash & Fold',
            Quantity: 1,
            Amount: balanceDue,
            LoyaltyCardNo: cardNumber,
            OperatorCode: spyderWashSettings.operatorCode,
            LocationCode: spyderWashSettings.locationCode,
            Description: 'Cents Wash and Fold POS Order',
        };
        const url = 'http://posapi.spyderwash.com/api/Transaction/SavePosTransaction';

        const response = await axios.post(url, params, {
            headers,
        });
        const data = await response.data;

        return res.status(200).json({
            success: true,
            data: data.data,
        });
    } catch (error) {
        return next(error);
    }
}

module.exports = exports = {
    retrieveSpyderWashAuthToken,
    checkSpyderWashCardBalance,
    deductBalanceFromSpyderWashCard,
};
