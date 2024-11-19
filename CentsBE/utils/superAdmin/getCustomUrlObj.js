const { formatToKebabCase } = require('../formatters/formatToKebabCase');

const getCustomUrlObj = (customUrl) => {
    let customUrlObj;
    if (customUrl === '') {
        customUrlObj = { customUrl: null };
    } else if (customUrl) {
        customUrlObj = { customUrl: formatToKebabCase(customUrl) };
    }
    return customUrlObj;
};

module.exports = exports = getCustomUrlObj;
