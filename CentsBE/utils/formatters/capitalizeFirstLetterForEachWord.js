const capitalizeFirstLetterForEachWord = (str) =>
    str?.replace(/(^\w{1})|(\s+\w{1})/g, (letter) => letter.toUpperCase()) ?? '';

module.exports = exports = { capitalizeFirstLetterForEachWord };
