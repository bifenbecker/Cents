const Joi = require('@hapi/joi');

const schema = Joi.object().keys({
    firstname: Joi.string()
        .required()
        .error(() => 'Firstname is required'),
    lastname: Joi.string()
        .required()
        .allow('')
        .error(() => 'Lastname is required'),
    companyName: Joi.string()
        .required()
        .error(() => 'Company Name is required'),
    phone: Joi.string()
        .required()
        .min(1)
        .max(16)
        .error(() => 'Invalid phone number'),
    address: Joi.string()
        .required()
        .error(() => 'Address is required'),
    city: Joi.string()
        .required()
        .error(() => 'City is required'),
    state: Joi.string()
        .required()
        .error(() => 'State is required'),
    zipCode: Joi.string()
        .regex(/^[0-9]{5}(?:-[0-9]{4})?$/)
        .required()
        .error(() => 'Invalid Zipcode'),
    email: Joi.string()
        .email()
        .required()
        .error(() => 'Invalid Email'),
    needsRegions: Joi.boolean()
        .required()
        .error(() => 'Invalid value for enable region'),
});

function validateAccount(inputObj) {
    const error = Joi.validate(inputObj, schema);
    return error;
}

function validateAccountByField(inputObj) {
    const singleFieldSchema = Joi.object().keys({
        field: Joi.string().required(),
        value: Joi.required(),
    });

    const inputValidObj = Joi.validate(inputObj, singleFieldSchema);
    if (inputValidObj.error) {
        return { message: 'Invalid input' };
    }

    if (inputObj.field === 'fullName') {
        const objToValidate = {};
        if (!inputObj.value) {
            return { message: 'Invalid name' };
        }
        const name = inputObj.value.split(' ');
        // eslint-disable-next-line prefer-destructuring
        objToValidate.firstname = name[0];
        objToValidate.lastname = name.slice(1).join(' ');

        const firstNameSchema = Joi.reach(schema, 'firstname');
        const lastNameSchema = Joi.reach(schema, 'lastname');
        const nameSchema = Joi.object().keys({
            firstname: firstNameSchema,
            lastname: lastNameSchema,
        });

        const dataValidObj = Joi.validate(objToValidate, nameSchema);
        return dataValidObj.error;
    }

    // If any other field
    const fieldSchema = Joi.reach(schema, inputObj.field);
    if (!fieldSchema) {
        return { message: 'Invalid field' };
    }
    const dataValidObj = Joi.validate(inputObj.value, fieldSchema);
    return dataValidObj.error;
}

module.exports = {
    validateAccount,
    validateAccountByField,
};
