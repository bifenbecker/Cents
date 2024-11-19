const { expect } = require('./chaiHelper');
const ChaiHttpRequestHelper = require('./chaiHttpRequestHelper');

function sendRequestWithOptionalToken(request, token) {
    return typeof token === 'undefined'
        ? request
        : request.set('authtoken', token);
}

// POST
async function assertPostResponseSuccess({ url, params = {}, body, token, code = 200 }) {
    const request = ChaiHttpRequestHelper.post(url, params, body);
    const response = await sendRequestWithOptionalToken(request, token);

    expect(response).to.have.status(code);
    return response;
}

async function assertPostResponseError({ url, params = {}, body, token, code, expectedError }) {
    const request = ChaiHttpRequestHelper.post(url, params, body);
    const response = await sendRequestWithOptionalToken(request, token);

    expect(response).to.have.status(code);
    if (expectedError) {
        if (expectedError instanceof RegExp) {
            expect(response.body.error).to.match(expectedError);
        } else {
            expect(response.body.error).to.equal(expectedError);
        }
    }
    return response;
}

// PUT
async function assertPutResponseSuccess({ url, params = {}, body, token }) {
    const request = ChaiHttpRequestHelper.put(url, params, body);
    const response = await sendRequestWithOptionalToken(request, token);

    expect(response).to.have.status(200);
    return response;
}

async function assertPutResponseError({ url, params = {}, body, token, code, expectedError }) {
    const request = ChaiHttpRequestHelper.put(url, params, body);
    const response = await sendRequestWithOptionalToken(request, token);

    expect(response).to.have.status(code);
    if (expectedError) {
        if (expectedError instanceof RegExp) {
            expect(response.body.error).to.match(expectedError);
        } else {
            expect(response.body.error).to.equal(expectedError);
        }
    }
    return response;
}

// GET
async function assertGetResponseSuccess({ url, params = {}, token }) {
    const request = ChaiHttpRequestHelper.get(url, params);
    const response = await sendRequestWithOptionalToken(request, token);

    expect(response).to.have.status(200);
    return response;
}

async function assertGetResponseError({ url, params = {}, token, code, expectedError }) {
    const request = ChaiHttpRequestHelper.get(url, params);
    const response = await sendRequestWithOptionalToken(request, token);

    expect(response).to.have.status(code);
    if (expectedError) {
        if (expectedError instanceof RegExp) {
            expect(response.body.error).to.match(expectedError);
        } else {
            expect(response.body.error).to.equal(expectedError);
        }
    }
    return response;
}

// PATCH
async function assertPatchResponseSuccess({ url, params = {}, body, token }) {
    const request = ChaiHttpRequestHelper.patch(url, params, body);
    const response = await sendRequestWithOptionalToken(request, token);

    expect(response).to.have.status(200);
    return response;
}

async function assertPatchResponseError({ url, params = {}, body, token, code, expectedError }) {
    const request = ChaiHttpRequestHelper.patch(url, params, body);
    const response = await sendRequestWithOptionalToken(request, token);

    expect(response).to.have.status(code);
    if (expectedError) {
        if (expectedError instanceof RegExp) {
            expect(response.body.error).to.match(expectedError);
        } else {
            expect(response.body.error).to.equal(expectedError);
        }
    }
    return response;
}

/**
 * Helper for common assertion on token presense cases.
 * @param {function} assertHttpResponseErrorFn
 *  - any of assertPostResponseError | assertPutResponseError | assertGetResponseError
 * @param {() => string} urlGetter - function returning URL string
 * @param {() => ({
 *      params: {},
 *      body: {}
 * })} optionsGetter - fucntion returning axios options object
 */
async function itShouldCorrectlyAssertTokenPresense(
    assertHttpResponseErrorFn,
    urlGetter,
    optionsGetter = null,
) {
    it('should throw an error if token was not sent', async () => {
        await assertHttpResponseErrorFn({
            ...(optionsGetter && optionsGetter()),
            url: urlGetter(),
            token: '',
            code: 401,
            expectedError: 'Please sign in to proceed.',
        });
    });

    it('should throw an error if token is not correct', async () => {
        await assertHttpResponseErrorFn({
            ...(optionsGetter && optionsGetter()),
            url: urlGetter(),
            token: 'invalid_token',
            code: 401,
            expectedError: 'Invalid token.',
        });
    });
}

const requestTypes = {
    post: 'POST',
    put: 'PUT',
    get: 'GET',
    patch: 'PATCH',
};

class Endpoint {
    constructor(url, requestType) {
        this.url = url;
        this.requestType = requestType;

        switch (this.requestType) {
            case requestTypes.post:
                this.assertResponseError = assertPostResponseError;
                this.assertResponseSuccess = assertPostResponseSuccess;
                break;
            case requestTypes.put:
                this.assertResponseError = assertPutResponseError;
                this.assertResponseSuccess = assertPutResponseSuccess;
                break;
            case requestTypes.get:
                this.assertResponseError = assertGetResponseError;
                this.assertResponseSuccess = assertGetResponseSuccess;
                break;
            case requestTypes.patch:
                this.assertResponseError = assertPatchResponseError;
                this.assertResponseSuccess = assertPatchResponseSuccess;
                break;
        }
    }

    getEndPoint(params) {
        let apiEndPoint = this.url;
        Object.keys(params).forEach((param) => {
            apiEndPoint = apiEndPoint.replace(`:${param}`, params[param]);
        });
        return apiEndPoint;
    }
}

module.exports = {
    assertPostResponseSuccess,
    assertPostResponseError,
    assertPutResponseSuccess,
    assertPutResponseError,
    assertGetResponseSuccess,
    assertGetResponseError,
    assertPatchResponseSuccess,
    assertPatchResponseError,
    itShouldCorrectlyAssertTokenPresense,
    requestTypes,
    Endpoint,
};
