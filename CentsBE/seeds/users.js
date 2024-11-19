const Promise = require('bluebird');

const user = {
    firstname: 'admin',
    email: 'admin@email.com',
    password:
        '$argon2i$v=19$m=4096,t=3,p=1$TEHAeQVgzs/3qCNgHJ4nxw$9Mk9OqW5aac2W63k1wT7Rov9kRpzIF8m40SgAwpX/Hw',
    isVerified: true,
};
const userRole = {
    roleId: 1,
    userId: 1,
};
exports.seed = function (knex) {
    // Deletes ALL existing entries
    return Promise.join(
        knex('userRoles').del(),
        knex('users').del(),
        knex('users').insert([user]),
        knex('userRoles').insert([userRole]),
    );
};
