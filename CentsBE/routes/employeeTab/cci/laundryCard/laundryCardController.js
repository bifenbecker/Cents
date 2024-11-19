const axios = require('axios');

async function authenticate(req, res, next) {
    try {
        const { username, password } = req.body;

        const headers = {
            'Content-Type': 'application/json',
        };
        const params = {
            UserName: username,
            Password: password,
        };
        const url = 'https://live.laundrycard.com/api/AuthToken';

        const response = await axios.post(url, params, {
            headers,
        });
        const data = await response.data;

        return res.status(200).json({
            success: true,
            cciToken: data.Token,
        });
    } catch (error) {
        return next(error);
    }
}

async function retrieveAccountBalance(req, res, next) {
    try {
        const { cciStoreId, machineId, cciCardNumber, cciToken } = req.body;

        const headers = {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${cciToken}`,
        };
        const url = `https://live.laundrycard.com/api/pos/${cciStoreId}/${machineId}/Account/${cciCardNumber}`;

        const response = await axios.get(url, {
            headers,
        });
        const data = await response.data;

        return res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        return next(error);
    }
}

async function debitLaundryCard(req, res, next) {
    try {
        const { cciStoreId, machineId, cciCardNumber, cciToken, balanceDue } = req.body;

        const headers = {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${cciToken}`,
        };
        const params = {
            Amount: balanceDue,
        };
        const url = `https://live.laundrycard.com/api/pos/${cciStoreId}/${machineId}/Vend/${cciCardNumber}`;

        const response = await axios.post(url, params, {
            headers,
        });
        const data = await response.data;

        return res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        return next(error);
    }
}

module.exports = exports = {
    authenticate,
    retrieveAccountBalance,
    debitLaundryCard,
};
