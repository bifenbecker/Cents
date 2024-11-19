function getReqOrigin(req) {
    const url = req.originalUrl;
    if (url.includes('employee-tab')) {
        return 'EMPLOYEE_TAB';
    }
    return 'BUSINESS_MANAGER';
}

function joiValidationCommonErrHandler(errors) {
    return errors.map((err) => {
        switch (err.type) {
            case 'any.empty':
            case 'any.required':
                return new Error(`${err.context.label} is required`);
            case 'string.regex.base':
                return new Error(`Please enter valid ${err.context.label}`);
            case 'email.base':
                return new Error(`${err.context.label} should be in email format`);
            case 'string.email':
                return new Error('Enter a valid Email');
            case 'string.base':
                return new Error(`${err.context.label} must be a string`);
            case 'array.base':
                return new Error(`${err.context.label} must be an array`);
            case 'boolean.base':
                return new Error(`${err.context.label} must be a boolean`);
            case 'string.max':
                return new Error(`${err.context.label} must be of max length ${err.context.limit}`);
            case 'number.max':
                return new Error(`${err.context.label} must be of max length ${err.context.limit}`);
            case 'number.base':
                return new Error(`${err.context.label} must be a integer`);
            case 'number.greater':
                return new Error(`${err.context.label} must be greater than ${err.context.limit}`);
            case 'any.allowOnly':
                return new Error(`Enter valid ${err.context.label} from ${err.context.valids}`);
            case 'date.base':
                return new Error(`${err.context.label} must be a date`);
            case 'date.less':
            case 'date.max':
                return new Error(`${err.context.label} must be less than today`);
            case 'date.min':
            case 'date.greater':
                return new Error(
                    `${err.context.label} must be more than ${
                        err.context.label === 'EndDate' ? 'Start Date' : 'today'
                    }`,
                );
            case 'any.invalid':
                return new Error(`${err.context.label} must be ${!err.context.value}`);
            case 'array.includesOne':
                return err.context.reason[0].context.valids
                    ? new Error(
                          `${err.context.label} must be from ${err.context.reason[0].context.valids}`,
                      )
                    : new Error(`Enter valid values for ${err.context.label}`);
            default:
                return err;
        }
    });
}

module.exports = {
    getReqOrigin,
    joiValidationCommonErrHandler,
};
