const axios = require('axios');

/**
 * Shorten the URL via Bitly
 *
 * @param {String} url
 */
async function shortURL(url) {
    try {
        const headers = {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.BITLY_ACCESS_TOKEN}`,
        };
        const params = {
            domain: 'link.trycents.com',
            long_url: url,
        };
        const bitlyUrl = 'https://api-ssl.bitly.com/v4/shorten';

        const response = await axios.post(bitlyUrl, params, {
            headers,
        });
        return response.data.link;
    } catch (error) {
        throw new Error(error.message);
    }
}

module.exports = shortURL;
