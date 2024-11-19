function formatToKebabCase(string) {
    const isInvalidString = !/^[a-zA-Z0-9 -]*$/.test(string);
    if (isInvalidString) {
        return false;
    }
    return string.replace(/ /g, '-').toLowerCase();
}

module.exports = exports = { formatToKebabCase };
