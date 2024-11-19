const Joi = require('@hapi/joi');
const argon2 = require('argon2');
const { transaction, raw } = require('objection');
const { passwordGenerator } = require('../../utils/passwordGenerator');
const CentsCustomer = require('../../models/centsCustomer');
const StoreCustomer = require('../../models/storeCustomer');
const getBusiness = require('../../utils/getBusiness');

function splitFullName(fullName) {
    const name = fullName.split(' ');
    const firstName = name[0];
    const lastName = name.slice(1).join(' ');
    return { firstName, lastName };
}
const validations = {
    saveCustomer: (payload) => {
        const schema = Joi.object().keys({
            id: Joi.number().integer().optional(),
            fullName: Joi.string().trim().required().error(new Error('Full name cannot be empty.')),
            email: Joi.string()
                .email()
                .optional()
                .error(() => 'Invalid Email'),
            phoneNumber: Joi.string()
                .trim()
                .required()
                .error(new Error('Phone number cannot be empty.')),
            languageId: Joi.number()
                .integer()
                .required()
                .error(new Error('languageId cannot be empty.')),
        });
        const isValid = Joi.validate(payload, schema);
        if (isValid.error) {
            return {
                error: isValid.error.message,
            };
        }
        return null;
    },
    deleteCustomer: (payload) => {
        const schema = Joi.object().keys({
            id: Joi.number().integer().required(),
            storeId: Joi.number().integer().required().error(new Error('storeId cannot be empty.')),
            businessId: Joi.number()
                .integer()
                .required()
                .error(new Error('businessId cannot be empty.')),
        });
        const isValid = Joi.validate(payload, schema);
        if (isValid.error) {
            return {
                error: isValid.error.message,
            };
        }
        return null;
    },
};
const customersEndpoint = {
    saveCustomer: async (req, res, next) => {
        const { body } = req;
        const error = validations.saveCustomer(body);
        if (error) {
            res.status(422).json(error);
            return;
        }
        try {
            const { firstName, lastName } = splitFullName(body.fullName);
            const data = {
                firstName,
                lastName,
                phoneNumber: body.phoneNumber,
                email: body.email,
                languageId: body.languageId,
            };
            let storeCustomer;
            if (body.id) {
                storeCustomer = await StoreCustomer.query()
                    .where('storeId', req.currentStore.id)
                    .where('id', body.id);
                if (!storeCustomer) {
                    res.status(422).json({ error: 'Invalid customer id' });
                    return;
                }
            }
            if (data.email) {
                let emailExist = StoreCustomer.query()
                    .where('storeId', req.currentStore.id)
                    .where(raw('upper("email")'), data.email.toUpperCase());
                if (body.id) {
                    emailExist = emailExist.where('id', '<>', body.id);
                }
                emailExist = await emailExist;
                if (!emailExist) {
                    res.status(409).json({
                        error: 'Email already exists.',
                    });
                    return;
                }
            }
            if (data.phoneNumber) {
                let phoneNumberExist = StoreCustomer.query()
                    .where('storeId', req.currentStore.id)
                    .where(raw('upper("phoneNumber")'), data.phoneNumber.toUpperCase());
                if (body.id) {
                    phoneNumberExist = phoneNumberExist.where('id', '<>', body.id);
                }
                phoneNumberExist = await phoneNumberExist;
                if (!phoneNumberExist) {
                    res.status(409).json({
                        error: 'Phone number already exists.',
                    });
                    return;
                }
            }

            const trx = await transaction.start(CentsCustomer.knex());
            if (body.id) {
                storeCustomer = await storeCustomer.$query().patchAndFetch({
                    firstName: data.firstName,
                    lastName: data.lastName,
                    email: data.email,
                    phoneNumber: data.phoneNumber,
                });
            } else {
                let centsCustomer = await CentsCustomer.query(trx)
                    .where('phoneNumber', data.phoneNumber)
                    .first();
                if (!centsCustomer) {
                    const password = await argon2.hash(passwordGenerator());
                    centsCustomer = await CentsCustomer.query(trx).insert({
                        firstName: data.firstName,
                        lastName: data.lastName,
                        email: data.email,
                        phoneNumber: data.phoneNumber,
                        languageId: data.languageId,
                        password,
                    });
                }
                data.centsCustomerId = centsCustomer.id;
                storeCustomer = await StoreCustomer.query(trx).insert({
                    firstName: data.firstName,
                    lastName: data.lastName,
                    email: data.email,
                    phoneNumber: data.phoneNumber,
                    centsCustomerId: centsCustomer.id,
                    storeId: req.currentStore.id,
                    businessId: req.currentStore.businessId,
                    languageId: data.languageId,
                    isDeleted: false,
                });
            }
            const details = {};
            details.id = storeCustomer.id;
            details.fullName = `${storeCustomer.firstName} ${storeCustomer.lastName}`;
            details.phoneNumber = storeCustomer.phoneNumber;
            details.email = storeCustomer.email;
            details.languageId = storeCustomer.languageId;
            await trx.commit();
            res.status(200).json({
                details,
                success: true,
            });
        } catch (error) {
            next(error);
        }
    },
    getCustomers: async (req, res, next) => {
        const { limit, offset, storeId, field, keyword } = req.query;
        let storeCustomers = StoreCustomer.query()
            .select(
                `${StoreCustomer.tableName}.id`,
                `${StoreCustomer.tableName}.firstName`,
                `${StoreCustomer.tableName}.lastName`,
                `${StoreCustomer.tableName}.email`,
                `${StoreCustomer.tableName}.phoneNumber`,
                `${CentsCustomer.tableName}.languageId`,
            )
            .leftJoin(
                `${CentsCustomer.tableName}`,
                `${StoreCustomer.tableName}.centsCustomerId`,
                `${CentsCustomer.tableName}.id`,
            )
            .where('businessId', req.currentStore.businessId)
            .orderBy(`${StoreCustomer.tableName}.id`, 'desc')
            .limit(limit || 25)
            .offset(offset || 0);
        if (storeId) {
            storeCustomers = storeCustomers.where('storeId', storeId);
        }
        if (keyword) {
            if (field === 'phoneNumber') {
                storeCustomers = storeCustomers.where(
                    `${CentsCustomer.tableName}.phoneNumber`,
                    'ilike',
                    `%${keyword}%`,
                );
            }
            if (field === 'email') {
                storeCustomers = storeCustomers.where(
                    `${CentsCustomer.tableName}.email`,
                    'ilike',
                    `%${keyword}%`,
                );
            }
            if (field === 'name') {
                storeCustomers = storeCustomers.where(
                    raw(
                        `concat("${CentsCustomer.tableName}"."firstName","${CentsCustomer.tableName}"."lastName")`,
                    ),
                    'ilike',
                    `%${keyword}%`,
                );
            }
        }
        storeCustomers = await storeCustomers;
        const users = storeCustomers.map((a) => {
            const response = {};
            response.id = a.id;
            response.fullName = `${a.firstName} ${a.lastName}`;
            response.phoneNumber = a.phoneNumber;
            response.email = a.email;
            response.languageId = a.languageId;
            return response;
        });
        res.status(200).json({
            success: true,
            details: users,
        });
    },
    deleteStoreCustomer: async (req, res, next) => {
        const payload = req.body;
        const error = validations.deleteCustomer(payload);
        if (error) {
            res.status(422).json(error);
            return;
        }
        const business = await getBusiness(req);
        if (!business) {
            res.status(400).json({
                error: 'Invalid request. No business exists',
            });
            return;
        }
        const trx = await transaction.start(CentsCustomer.knex());
        const storeCustomer = StoreCustomer.query(trx)
            .where('id', payload.id)
            .where('businessId', business.id);
        if (!storeCustomer) {
            res.status(422).json({ error: 'Invalid customer id' });
            return;
        }
        await storeCustomer.$query().patchAndFetch({
            isDeleted: true,
            deletedAt: new Date(),
        });
        await trx.commit();
        res.status(200).json({
            success: true,
        });
    },
};

module.exports = customersEndpoint;
