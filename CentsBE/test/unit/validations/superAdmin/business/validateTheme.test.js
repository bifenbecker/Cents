const { expect } = require('../../../../support/chaiHelper');
const {
    createMiddlewareMockedArgs,
} = require('../../../../support/mockers/createMiddlewareMockedArgs');
const factory = require('../../../../factories');
const validateTheme = require('../../../../../validations/superAdmin/businesses/validateTheme');
const { FACTORIES_NAMES: FN } = require('../../../../constants/factoriesNames');
const { THEME_ERRORS } = require('../../../../../constants/error.messages');

describe('test validateTheme', () => {
    const customUrl = 'custom-url';
    const primaryColor = '#00be68';
    const borderRadius = '31px';
    const encodedId = 'N3I5';

    it('should pass validation', async () => {
        const { mockedReq, mockedRes, mockedNext, expectedNextCall } = createMiddlewareMockedArgs({
            body: { primaryColor, borderRadius },
        });
        await validateTheme(mockedReq, mockedRes, mockedNext);
        expectedNextCall();
    });

    describe('should return correct error', () => {
        it('with an unexpected property in a body', async () => {
            const { mockedReq, mockedRes, mockedNext, expectedResponseCall } =
                createMiddlewareMockedArgs({
                    body: { unexpectedProperty: true },
                });
            await validateTheme(mockedReq, mockedRes, mockedNext);
            expectedResponseCall(400, (response) => {
                expect(response).to.have.property('error', '"unexpectedProperty" is not allowed');
            });
        });

        it('with an unexpected property in a body', async () => {
            const { mockedReq, mockedRes, mockedNext, expectedResponseCall } =
                createMiddlewareMockedArgs({
                    body: { unexpectedProperty: true },
                });
            await validateTheme(mockedReq, mockedRes, mockedNext);
            expectedResponseCall(400, (response) => {
                expect(response).to.have.property('error', '"unexpectedProperty" is not allowed');
            });
        });

        it('with custom url as encodedId', async () => {
            const { mockedReq, mockedRes, mockedNext, expectedResponseCall } =
                createMiddlewareMockedArgs({
                    body: { customUrl: encodedId },
                });
            await validateTheme(mockedReq, mockedRes, mockedNext);
            expectedResponseCall(400, (response) => {
                expect(response).to.have.property('error', THEME_ERRORS.invalidCustomUtl);
            });
        });

        it('with an already existing customUrl in Business Theme', async () => {
            await factory.create(FN.businessTheme, { customUrl });
            const { mockedReq, mockedRes, mockedNext, expectedResponseCall } =
                createMiddlewareMockedArgs({
                    body: { customUrl, initialTheme: {} },
                });
            await validateTheme(mockedReq, mockedRes, mockedNext);
            expectedResponseCall(400, (response) => {
                expect(response).to.have.property('error', THEME_ERRORS.customUrlIsNotUniq);
            });
        });

        it('with an already existing customUrl in Store Theme', async () => {
            await factory.create(FN.storeTheme, { customUrl });
            const { mockedReq, mockedRes, mockedNext, expectedResponseCall } =
                createMiddlewareMockedArgs({
                    body: { customUrl },
                });
            await validateTheme(mockedReq, mockedRes, mockedNext);
            expectedResponseCall(400, (response) => {
                expect(response).to.have.property('error', THEME_ERRORS.customUrlIsNotUniq);
            });
        });

        it('with numerous customUrl', async () => {
            await factory.create(FN.storeTheme, { customUrl });
            const { mockedReq, mockedRes, mockedNext, expectedResponseCall } =
                createMiddlewareMockedArgs({
                    body: { customUrl: '123' },
                });
            await validateTheme(mockedReq, mockedRes, mockedNext);
            expectedResponseCall(400, (response) => {
                expect(response).to.have.property('error', THEME_ERRORS.numericalCustomUrl);
            });
        });
    });
});
