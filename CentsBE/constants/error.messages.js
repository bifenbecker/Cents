const ERROR_MESSAGES = {
    NOT_AUTHORIZED_TO_MODIFY: 'You are not authorized to modify this order',
    HUB_NOT_ASSOCIATED_WITH_STORE: 'hub is not associated with store',
    ORDER_NOT_FOUND: 'Order not found',
    INVALID_PARAM_ID: 'The ID provided is undefined',
    CUSTOMER_NOT_FOUND: 'Customer not found',
    NOT_FOUND_ERROR: 'Not found',
    BAD_REQUEST: 'Bad request',
    CONFLICT: 'Conflict',
    NOT_ALLOWED: 'Not allowed',
};

const THEME_ERRORS = {
    limit: 'You have reached the maximum number of 10 themes.',
    lastOne: "You can't delete this theme because it's the last one.",
    customUrlIsNotUniq: 'Sorry, this url is already taken.',
    invalidCustomUtl: 'Sorry, but this URL is reserved',
    numericalCustomUrl: "Sorry you can't use numbers as a custom link",
    customUrlFormat:
        'Custom url must consist only of letters, numbers, spaces, hyphens and be from 2 to 40 characters long',
    hexColor: 'Color must be type HEX',
    customNameLength: 'The name must be a string and between 3 and 50 characters long.',
    radiusFormat: 'Radius must be in pixels and no more than 999',
    noSuchTheme: 'No such theme',
    businessUndefined: 'Business is undefined',
};

module.exports = {
    THEME_ERRORS,
    ERROR_MESSAGES,
};
