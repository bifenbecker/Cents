const { createHmac } = require('crypto');

/**
 * Generate HMAC for Intercom
 * @param {string} userUuid
 * @returns {string} hash
 */
function generateIntercomHash(userUuid) {
    return createHmac('sha256', process.env.INTERCOM_SECRET_TOKEN).update(userUuid).digest('hex');
}

module.exports = generateIntercomHash;
