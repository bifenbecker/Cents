const axios = require('axios');
const querystring = require('querystring');

async function updateCardBalance(req, res, next) {
    try {
        const { deviceSerialNumber, esdLocationId, cardSerialNumber, cardBalance, netOrderTotal } =
            req.body;
        const headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${process.env.ESD_TOKEN}`,
        };
        const params = {
            LOCATION_ID: esdLocationId,
            COMMAND_ID: 13,
            DEVICE_SERIAL_NUMBER: deviceSerialNumber,
            CARD_SERIAL_NUMBER: cardSerialNumber,
            CARD_TYPE: 0,
            CARD_CLASS: 0,
            BONUS: 0,
            CARD_BALANCE: Number(cardBalance - netOrderTotal),
        };
        const formattedParams = querystring.stringify(params);

        const url = 'https://mapp.mylaundrylink.com/CENTS';
        const response = await axios.post(url, formattedParams, {
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

module.exports = exports = updateCardBalance;
