const _ = require('lodash');

function permittedParams(payloadObject, permittedKeys) {
    return _.pick(payloadObject, permittedKeys);
}
module.exports = exports = permittedParams;
