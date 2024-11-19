require('../../../testHelper');
const { expect } = require('../../../support/chaiHelper');
const factory = require('../../../factories');
const {
    setBusinessIdUserAttribute,
    getCents20Flag,
} = require('../../../../utils/launchdarkly/launchDarklyUserUtils');
const { FACTORIES_NAMES } = require('../../../constants/factoriesNames');
const BusinessSettings = require('../../../../models/businessSettings');

describe('test launchDarklyUserUtils functions', () => {
    describe('test setBusinessIdUserAttribute function', () => {
        let business;

        beforeEach(async () => {
            business = factory.create(FACTORIES_NAMES.laundromatBusiness);
        })

        it('should return a formatted object with businessId added to proper fields', async () => { 
            const expectedOutput = {
                key: business.id,
                custom: {
                    businessId: business.id,
                }
            }
            const result = setBusinessIdUserAttribute(business.id);
    
            // assert
            expect(result).to.deep.equal(expectedOutput);
        });
    })

    describe('test getCents20Flag function', async () => {
        let business;
        beforeEach(async () => {
            business = await factory.create(FACTORIES_NAMES.laundromatBusiness);
        });

        describe('with apiVersion above 2.0.0', () => {
            const apiVersion = '2.0.1';

            it('should return true when dryCleaningEnabled is true', async () => {
                await BusinessSettings.query()
                    .patch({
                        dryCleaningEnabled: true,
                    })
                    .findOne({ businessId: business.id });
                const flag = await getCents20Flag(apiVersion, business.id);

                // assert
                expect(flag).to.be.true;
            });

            it('should return false when dryCleaningEnabled is not true', async () => {
                await BusinessSettings.query()
                    .patch({
                        dryCleaningEnabled: false,
                    })
                    .findOne({ businessId: business.id });

                const flag = await getCents20Flag(apiVersion, business.id);

                // assert
                expect(flag).to.be.false;
            });

            it('should typecast to a number', async () => {    
                await BusinessSettings.query()
                    .patch({
                        dryCleaningEnabled: false,
                    })
                    .findOne({ businessId: business.id });
                const flag = await getCents20Flag(apiVersion, `${business.id}`);
    
                // assert
                expect(flag).to.be.false;
            });
        });

        it('should return false with apiVersion below 2.0.0 and hasDryCleaningEnabled is true', async () => {
            const apiVersion = '1.9.9';

            await BusinessSettings.query()
                .patch({
                    dryCleaningEnabled: true,
                })
                .findOne({ businessId: business.id });

            const flag = await getCents20Flag(apiVersion, business.id);

            // assert
            expect(flag).to.be.false;
        });
    });
});
