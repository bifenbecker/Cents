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
const Modifier = require('../../../../../models/modifiers');
const ModifierVersion = require('../../../../../models/modifierVersions');

describe('test updateModifier API', () => {
    let business, modifier, store, token, url, user;

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
        modifier = await factory.create(FN.modifier, {
            businessId: business.id,
        });
        modifierVersion = await factory.create(FN.modifierVersion, {
            name: modifier.name,
            description: modifier.description,
            price: modifier.price,
            modifierId: modifier.id,
        });
        url = `/api/v1/business-owner/admin/modifiers/${modifier.id}`;
    });

    itShouldCorrectlyAssertTokenPresense(assertPutResponseError, () => url);

    it('should update modifier and create associated modifierVersion entry', async () => {
        const payload = {
            name: modifier.name + ' updated',
            price: modifier.price * 1.15,
        };

        await ChaiHttpRequestHelper.put(url, {}, payload).set('authtoken', token);

        const updatedModifier = await Modifier.query().findById(modifier.id);
        expect(updatedModifier).to.not.be.undefined;
        expect(updatedModifier).to.have.property('latestModifierVersion');
        expect(updatedModifier).to.have.property('name', payload.name.trim());
        expect(updatedModifier).to.have.property('price', Number(payload.price.toFixed(2)));
        expect(updatedModifier).to.have.property('businessId', business.id);

        const modifierVersion = await ModifierVersion.query().findById(
            updatedModifier.latestModifierVersion,
        );
        expect(modifierVersion).to.have.property('modifierId', updatedModifier.id);
        expect(modifierVersion).to.have.property('name', payload.name.trim());
        expect(modifierVersion).to.have.property('price', Number(payload.price.toFixed(2)));
    });
});
