const semverValid = require('semver/functions/valid');
const semverLt = require('semver/functions/lt');
const { version: defaultVersion } = require('../package.json');

/**
 * Set the API version from the FE as an easy-to-access variable
 *
 * By default, if the incoming request does not have the version variable
 * or if it is undefined for any reason, then we will be setting the
 * apiVersion as what's defined in package.json
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function setApiVersion(req, res, next) {
    try {
        const { headers } = req;
        const { version } = headers;
        const formattedVersion = semverValid(version);
        if (formattedVersion) {
            req.apiVersion = formattedVersion;
            req.onLatestApi = formattedVersion === defaultVersion;
            req.versionIsOutdated = semverLt(formattedVersion, defaultVersion);
            req.incomingRequestHasVersion = true;
        } else {
            req.apiVersion = defaultVersion;
            req.onLatestApi = true;
            req.versionIsOutdated = false;
            req.incomingRequestHasVersion = false;
        }
        return next();
    } catch (error) {
        return next(error);
    }
}

module.exports = exports = setApiVersion;
