const { factory } = require('factory-girl');
const faker = require('faker');
const User = require('../../models/user');
const { FACTORIES_NAMES: FN } = require('../constants/factoriesNames');

require('./userRoles');

factory.define(FN.user, User, () => {
    return {
        email: factory.sequence('User.email', (n) => `user-${n}@gmail.com`),
        firstname: faker.name.firstName(),
        lastname: faker.name.lastName(),
        languageId: factory.assoc('language', 'id'),
        password: faker.internet.password(),
        isGlobalVerified: faker.random.boolean(),
        uuid: faker.random.uuid(),
    };
});

factory.extend(
    FN.user,
    FN.userWithBusinessOwnerRole,
    {},
    {
        afterCreate: async (model) => {
            await factory.create(FN.userRole, {
                userId: model.id,
                roleId: factory.assoc(FN.role, 'id', {
                    userType: 'Business Owner',
                }),
            });
            return model;
        },
    },
);

factory.extend(
    FN.user,
    FN.userWithSuperAdminRole,
    {},
    {
        afterCreate: async (model) => {
            await factory.create(FN.userRole, {
                userId: model.id,
                roleId: factory.assoc(FN.role, 'id', {
                    userType: 'Super Admin',
                }),
            });
            return model;
        },
    },
);

factory.extend(
    'user',
    'userWithBusinessAdminRole',
    {},
    {
        afterCreate: async (model) => {
            await factory.create('userRole', {
                userId: model.id,
                roleId: factory.assoc('role', 'id', {
                    userType: 'Business Admin',
                }),
            });
            return model;
        },
    },
);

module.exports = exports = factory;
