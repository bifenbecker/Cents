require('../../testHelper');
const { expect } = require('../../support/chaiHelper');
const {
    getReqOrigin,
    joiValidationCommonErrHandler,
} = require('../../../validations/validationUtil');

describe('test validationUtil', () => {
    describe('test getReqOrigin', () => {
        it('should return EMPLOYEE_TAB origin', () => {
            const req = {
                originalUrl: '/api/v1/employee-tab/machines/1',
            };

            const result = getReqOrigin(req);
            expect(result).to.equal('EMPLOYEE_TAB');
        });

        it('should return BUSINESS_MANAGER origin', () => {
            const req = {
                originalUrl: '/api/v1/business-owner/machine/1',
            };

            const result = getReqOrigin(req);
            expect(result).to.equal('BUSINESS_MANAGER');
        });
    });

    describe('test joiValidationCommonErrHandler', () => {
        it(`should return an error for 'empty' validation`, () => {
            const errors = [
                {
                    type: 'any.empty',
                    context: {
                        label: 'Value',
                    },
                },
            ];
            const result = joiValidationCommonErrHandler(errors);
            expect(result[0].message).to.equal('Value is required');
        });

        it(`should return an error for 'required' validation`, () => {
            const errors = [
                {
                    type: 'any.required',
                    context: {
                        label: 'Value',
                    },
                },
            ];
            const result = joiValidationCommonErrHandler(errors);
            expect(result[0].message).to.equal('Value is required');
        });

        it(`should return an error for 'string.regex.base' validation`, () => {
            const errors = [
                {
                    type: 'string.regex.base',
                    context: {
                        label: 'Value',
                    },
                },
            ];
            const result = joiValidationCommonErrHandler(errors);
            expect(result[0].message).to.equal('Please enter valid Value');
        });

        it(`should return an error for 'email.base' validation`, () => {
            const errors = [
                {
                    type: 'email.base',
                    context: {
                        label: 'Value',
                    },
                },
            ];
            const result = joiValidationCommonErrHandler(errors);
            expect(result[0].message).to.equal('Value should be in email format');
        });

        it(`should return an error for 'string.email' validation`, () => {
            const errors = [
                {
                    type: 'string.email',
                    context: {
                        label: 'Value',
                    },
                },
            ];
            const result = joiValidationCommonErrHandler(errors);
            expect(result[0].message).to.equal('Enter a valid Email');
        });

        it(`should return an error for 'string.base' validation`, () => {
            const errors = [
                {
                    type: 'string.base',
                    context: {
                        label: 'Value',
                    },
                },
            ];
            const result = joiValidationCommonErrHandler(errors);
            expect(result[0].message).to.equal('Value must be a string');
        });

        it(`should return an error for 'array.base' validation`, () => {
            const errors = [
                {
                    type: 'array.base',
                    context: {
                        label: 'Value',
                    },
                },
            ];
            const result = joiValidationCommonErrHandler(errors);
            expect(result[0].message).to.equal('Value must be an array');
        });

        it(`should return an error for 'boolean.base' validation`, () => {
            const errors = [
                {
                    type: 'boolean.base',
                    context: {
                        label: 'Value',
                    },
                },
            ];
            const result = joiValidationCommonErrHandler(errors);
            expect(result[0].message).to.equal('Value must be a boolean');
        });

        it(`should return an error for 'string.max' validation`, () => {
            const errors = [
                {
                    type: 'string.max',
                    context: {
                        label: 'Value',
                        limit: 5,
                    },
                },
            ];
            const result = joiValidationCommonErrHandler(errors);
            expect(result[0].message).to.equal('Value must be of max length 5');
        });

        it(`should return an error for 'number.max' validation`, () => {
            const errors = [
                {
                    type: 'number.max',
                    context: {
                        label: 'Value',
                        limit: 2,
                    },
                },
            ];
            const result = joiValidationCommonErrHandler(errors);
            expect(result[0].message).to.equal('Value must be of max length 2');
        });

        it(`should return an error for 'number.base' validation`, () => {
            const errors = [
                {
                    type: 'number.base',
                    context: {
                        label: 'Value',
                    },
                },
            ];
            const result = joiValidationCommonErrHandler(errors);
            expect(result[0].message).to.equal('Value must be a integer');
        });

        it(`should return an error for 'number.greater' validation`, () => {
            const errors = [
                {
                    type: 'number.greater',
                    context: {
                        label: 'Value',
                        limit: 4,
                    },
                },
            ];
            const result = joiValidationCommonErrHandler(errors);
            expect(result[0].message).to.equal('Value must be greater than 4');
        });

        it(`should return an error for 'any.allowOnly' validation`, () => {
            const errors = [
                {
                    type: 'any.allowOnly',
                    context: {
                        label: 'Value',
                        valids: [1, 0],
                    },
                },
            ];
            const result = joiValidationCommonErrHandler(errors);
            expect(result[0].message).to.equal('Enter valid Value from 1,0');
        });

        it(`should return an error for 'date.base' validation`, () => {
            const errors = [
                {
                    type: 'date.base',
                    context: {
                        label: 'Value',
                    },
                },
            ];
            const result = joiValidationCommonErrHandler(errors);
            expect(result[0].message).to.equal('Value must be a date');
        });

        it(`should return an error for 'date.less' validation`, () => {
            const errors = [
                {
                    type: 'date.less',
                    context: {
                        label: 'Value',
                    },
                },
            ];
            const result = joiValidationCommonErrHandler(errors);
            expect(result[0].message).to.equal('Value must be less than today');
        });

        it(`should return an error for 'date.max' validation`, () => {
            const errors = [
                {
                    type: 'date.max',
                    context: {
                        label: 'Value',
                    },
                },
            ];
            const result = joiValidationCommonErrHandler(errors);
            expect(result[0].message).to.equal('Value must be less than today');
        });

        it(`should return an error for 'date.min' validation`, () => {
            const errors = [
                {
                    type: 'date.min',
                    context: {
                        label: 'EndDate',
                    },
                },
            ];
            const result = joiValidationCommonErrHandler(errors);
            expect(result[0].message).to.equal('EndDate must be more than Start Date');
        });

        it(`should return an error for 'date.greater' validation`, () => {
            const errors = [
                {
                    type: 'date.greater',
                    context: {
                        label: 'Value',
                    },
                },
            ];
            const result = joiValidationCommonErrHandler(errors);
            expect(result[0].message).to.equal('Value must be more than today');
        });

        it(`should return an error for 'any.invalid' validation`, () => {
            const errors = [
                {
                    type: 'any.invalid',
                    context: {
                        label: 'Value',
                        value: true,
                    },
                },
            ];
            const result = joiValidationCommonErrHandler(errors);
            expect(result[0].message).to.equal('Value must be false');
        });

        it(`should return an error for 'array.includesOne' validation`, () => {
            const errors = [
                {
                    type: 'array.includesOne',
                    context: {
                        label: 'Value',
                        reason: [
                            {
                                context: {
                                    valids: [1, 2],
                                },
                            },
                        ],
                    },
                },
            ];
            const result = joiValidationCommonErrHandler(errors);
            expect(result[0].message).to.equal('Value must be from 1,2');
        });

        it(`should return an error for 'array.includesOne' validation with just label`, () => {
            const errors = [
                {
                    type: 'array.includesOne',
                    context: {
                        label: 'Value',
                        reason: [
                            {
                                context: {},
                            },
                        ],
                    },
                },
            ];
            const result = joiValidationCommonErrHandler(errors);
            expect(result[0].message).to.equal('Enter valid values for Value');
        });

        it(`should return a default error`, () => {
            const errors = [
                {
                    type: 'array.custom',
                    context: {},
                },
            ];
            const result = joiValidationCommonErrHandler(errors);
            expect(result[0]).to.equal(errors[0]);
        });

        it(`should return multiple errors`, () => {
            const errors = [
                {
                    type: 'any.empty',
                    context: {
                        label: 'Value',
                    },
                },
                {
                    type: 'string.regex.base',
                    context: {
                        label: 'Value',
                    },
                },
            ];

            const result = joiValidationCommonErrHandler(errors);
            expect(result[0].message).to.equal('Value is required');
            expect(result[1].message).to.equal('Please enter valid Value');
        });
    });
});
