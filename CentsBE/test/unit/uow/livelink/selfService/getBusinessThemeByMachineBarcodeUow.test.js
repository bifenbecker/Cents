require('../../../../testHelper');
const { expect } = require('chai');
const chai = require('chai');
chai.use(require('chai-as-promised'));
const factory = require('../../../../factories');
const { FACTORIES_NAMES } = require('../../../../constants/factoriesNames');
const { getBusinessThemeByMachineBarcodeUow } = require('../../../../../uow/liveLink/selfService/getBusinessThemeByMachineBarcodeUow');
const BusinessTheme = require('../../../../../models/businessTheme');

describe('test getBusinessThemeByMachineBarcodeUow function', () => {
    let business;
    let store;
    let centsCustomer;
    let machine;

    beforeEach(async () => {
        business = await factory.create(FACTORIES_NAMES.laundromatBusiness);
        store = await factory.create(FACTORIES_NAMES.store, {
            businessId: business.id,
        });
        centsCustomer = await factory.create(FACTORIES_NAMES.centsCustomer);
        machine = await factory.create(FACTORIES_NAMES.machine, {
            storeId: store.id,
        });
    })

    describe('when a machine does not exist', () => {
        it('should reject with Error', async () => {
            const payloadMock = {
                barcode: 'abracadabra',
            };

            await expect(getBusinessThemeByMachineBarcodeUow(payloadMock)).to.be.rejectedWith('Machine is not found');
        });
    });

    describe('when a machine exist', () => {
        it('should reject with Error if business theme does not exist', async () => {
            const payloadMock = {
                barcode: machine.serialNumber,
            };
            await BusinessTheme.query().delete();

            await expect(getBusinessThemeByMachineBarcodeUow(payloadMock)).to.be.rejectedWith('Business theme is not found');
        });

        it('should return businessTheme object', async () => {
            await BusinessTheme.query().delete();
            const payloadMock = {
                barcode: machine.serialNumber,
            };
            const businessTheme = await factory.create(FACTORIES_NAMES.businessTheme, {
                businessId: business.id,
            });
            const businessThemeExpected = await BusinessTheme.query().findById(businessTheme.id);

            const result = await getBusinessThemeByMachineBarcodeUow(payloadMock);

            expect(result).to.be.an('object');
            expect(result).to.deep.equal({
                ...businessThemeExpected,
                businessName: business.name
            });
        })
    });
});
