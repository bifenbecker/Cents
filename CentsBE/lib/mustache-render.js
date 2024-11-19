const fs = require('fs');
const Mustache = require('mustache');

/**
 * Hbs file rendering
 * @param {String} filePath
 * @param {Object} options
 */
const renderFile = async (filePath, options = {}) => {
    const content = fs.readFileSync(filePath, 'utf-8');
    const htmlContent = Mustache.render(content, options);
    return htmlContent;
};

/**
 * Hbs string rendering
 * @param {String} content
 * @param {Object} options
 */
const renderString = (content, options = {}) => {
    const htmlContent = Mustache.render(content, options);
    return htmlContent;
};

module.exports = {
    renderFile,
    renderString,
};
