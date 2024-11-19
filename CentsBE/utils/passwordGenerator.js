const argon2 = require('argon2');

function passwordGenerator() {
    return Math.random().toString(36).substring(2, 6) + Math.random().toString(36).substring(2, 6);
}

async function hashPasswordGenerator() {
    const hashedPwd = await argon2.hash(passwordGenerator());
    return hashedPwd;
}

module.exports = { passwordGenerator, hashPasswordGenerator };
