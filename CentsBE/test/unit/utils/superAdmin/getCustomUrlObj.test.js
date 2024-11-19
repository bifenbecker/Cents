require('../../../testHelper');
const { expect } = require('../../../support/chaiHelper');
const getCustomUrlObj = require('../../../../utils/superAdmin/getCustomUrlObj');

describe('test getCustomUrlObj', () => {
    it('without customUrl', async () => {
        const result = getCustomUrlObj();

        expect(result).to.be.undefined;
    });

    it('with empty string', async () => {
        const result = getCustomUrlObj('');

        expect(result).have.property('customUrl').to.be.null;
    });

    it('with unformatted string', async () => {
        const result = getCustomUrlObj('Custom Url');

        expect(result).have.property('customUrl').equal('custom-url');
    });
});
