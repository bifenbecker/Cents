function formatError(error) {
    const template = /(?<=(\[)).+?(?=(\]))/gm;
    const out = error.message.match(template);

    return out ? out[0] : error.message;
}

module.exports = formatError;
