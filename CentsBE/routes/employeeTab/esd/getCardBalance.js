const axios = require('axios');
const querystring = require('querystring');

async function getCardBalance(req, res, next) {
    try {
        const { deviceSerialNumber, esdLocationId } = req.body;

        const headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${process.env.ESD_TOKEN}`,
        };
        const params = {
            LOCATION_ID: esdLocationId,
            COMMAND_ID: 12,
            DEVICE_SERIAL_NUMBER: deviceSerialNumber,
        };
        const formattedParams = querystring.stringify(params);

        const url = 'https://mapp.mylaundrylink.com/CENTS';
        const response = await axios.post(url, formattedParams, {
            headers,
        });
        const data = await response.data;

        if (data.ResultCode !== 1 || (data.ResultCode === 1 && !data.CardReady)) {
            return res.status(500).json({
                success: false,
                data,
            });
        }

        return res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        return next(error);
    }
}

module.exports = exports = getCardBalance;
