const phoneFormatter = require('phone-formatter');

module.exports = (number) => {
    const normalizedNumber = phoneFormatter.normalize(number);
    return phoneFormatter.format(normalizedNumber, '(NNN) NNN-NNNN');
};
