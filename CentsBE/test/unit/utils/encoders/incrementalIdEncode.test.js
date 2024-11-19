require('../../../testHelper');
const { expect } = require('../../../support/chaiHelper');
const {
    incrementalIdDecrypt,
    incrementalIdEncrypt,
    getEncodedBusinessIdType,
} = require('../../../../utils/encoders/incrementalIdEncode');

const validEncodedId = 'N3Fi';
const validDecodedId = 19;
const customUrl = 'custom-url';

describe('test incrementalIdDecrypt', () => {
    it('without encodedId', async () => {
        const result = incrementalIdDecrypt();

        expect(result).to.be.undefined;
    });

    it('with invalid encodedId', async () => {
        const result = incrementalIdDecrypt('invalidId');

        expect(result).to.be.undefined;
    });

    it('with encodedId more than maxDecodedId', async () => {
        const encodedId = 'MWk0aWxz';
        const result = incrementalIdDecrypt(encodedId);

        expect(result).to.be.undefined;
    });

    it('with encodedId less than 0', async () => {
        const encodedId = 'LXJ0';
        const result = incrementalIdDecrypt(encodedId);

        expect(result).to.be.undefined;
    });

    it('with correct encodedId', async () => {
        const result = incrementalIdDecrypt(validEncodedId);

        expect(result).equals(validDecodedId);
    });
});

describe('test incrementalIdEncrypt', () => {
    it('without decodedId', async () => {
        const result = incrementalIdEncrypt();

        expect(result).to.be.null;
    });

    it('with invalid decodedId', async () => {
        const invalidDecodedId = 'invalidDecodedId';
        const result = incrementalIdEncrypt(invalidDecodedId);

        expect(result).to.be.null;
    });

    it('with valid decodedId', async () => {
        const result = incrementalIdEncrypt(validDecodedId);

        expect(result).equal(validEncodedId);
    });
});

describe('test getEncodedBusinessIdType', () => {
    it('should assert as businessId', async () => {
        const businessId = 39;
        const result = getEncodedBusinessIdType(businessId);

        expect(result).have.property('businessId', 39);
        expect(result).have.property('businessThemeId', null);
        expect(result).have.property('customThemeLink', null);
    });

    it('should assert as businessThemeId', async () => {
        const result = getEncodedBusinessIdType(validEncodedId);

        expect(result).have.property('businessThemeId', validDecodedId);
        expect(result).have.property('businessId', null);
        expect(result).have.property('customThemeLink', null);
    });

    describe('should assert as customThemeLink', () => {
        it('with customUrl', async () => {
            const result = getEncodedBusinessIdType(customUrl);

            expect(result).have.property('customThemeLink', customUrl);
            expect(result).have.property('businessId', null);
            expect(result).have.property('businessThemeId', null);
        });

        it('with customUrl as encodedId more than maxDecodedId', async () => {
            const idLikeEncoded = 'MWd0a3h1cHB6';
            const result = getEncodedBusinessIdType(idLikeEncoded);

            expect(result).have.property('customThemeLink', idLikeEncoded);
            expect(result).have.property('businessId', null);
            expect(result).have.property('businessThemeId', null);
        });
    });
});
