require('../../../../testHelper');
const { generateToken } = require('../../../../support/apiTestHelper');
const factory = require('../../../../factories');
const { expect } = require('../../../../support/chaiHelper');
const { FACTORIES_NAMES: FN } = require('../../../../constants/factoriesNames');
const {
    itShouldCorrectlyAssertTokenPresense,
    assertPutResponseError,
} = require('../../../../support/httpRequestsHelper');
const ChaiHttpRequestHelper = require('../../../../support/chaiHttpRequestHelper');
const ModifierVersion = require('../../../../../models/modifierVersions');

describe('test createModifier API', () => {
    const url = '/api/v1/business-owner/admin/modifiers';
    let business, store, token, user;

    beforeEach(async () => {
        user = await factory.create(FN.userWithBusinessOwnerRole);
        business = await factory.create(FN.laundromatBusiness, {
            userId: user.id,
        });
        store = await factory.create(FN.store, {
            businessId: business.id,
        });
        token = generateToken({
            id: user.id,
        });
    });

    itShouldCorrectlyAssertTokenPresense(assertPutResponseError, () => url);

    it('should create modifier with associated modifierVersion entry', async () => {
        const payload = {
            name: 'test modifier 1',
            price: 2.666,
        };

        const response = await ChaiHttpRequestHelper.post(url, {}, payload).set('authtoken', token);

        expect(response.body.modifier).to.not.be.undefined;
        expect(response.body.modifier).to.have.property('latestModifierVersion');
        expect(response.body.modifier).to.have.property('name', payload.name.trim());
        expect(response.body.modifier).to.have.property('price', Number(payload.price.toFixed(2)));
        expect(response.body.modifier).to.have.property('businessId', business.id);

        const modifierVersion = await ModifierVersion.query().findById(
            response.body.modifier.latestModifierVersion,
        );
        expect(modifierVersion).to.have.property('modifierId', response.body.modifier.id);
        expect(modifierVersion).to.have.property('name', payload.name.trim());
        expect(modifierVersion).to.have.property('price', Number(payload.price.toFixed(2)));
    });
});
