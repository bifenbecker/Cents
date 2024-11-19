function splitFullName(fullName) {
    const name = fullName.split(' ');
    const firstName = name[0];
    const lastName = name.slice(1).join(' ');
    return { firstName, lastName };
}

module.exports = exports = splitFullName;
