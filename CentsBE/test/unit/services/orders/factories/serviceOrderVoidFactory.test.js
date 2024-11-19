require('../../../../testHelper');
const { expect } = require('../../../../support/chaiHelper');
const factory = require('../../../../factories');
const { FACTORIES_NAMES: FN } = require('../../../../constants/factoriesNames');
const ServiceOrderVoidFactory = require('../../../../../services/orders/factories/serviceOrderVoidFactory');
const { ORDER_TYPES } = require('../../../../../constants/constants');
const ResidentialServiceOrderVoidHandler = require('../../../../../services/orders/handlers/void/residentialServiceOrderVoidHandler');
const PostPayServiceOrderVoidHandler = require('../../../../../services/orders/handlers/void/postPayServiceOrderVoidHandler');
const PrePayServiceOrderVoidHandler = require('../../../../../services/orders/handlers/void/prePayServiceOrderVoidHandler');
const OnlineServiceOrderVoidHandler = require('../../../../../services/orders/handlers/void/onlineServiceOrderVoidHandler');

describe('test serviceOrderVoidFactory', () => {

    it('should fail when serviceOrder not passed', async () => {
        const serviceOrderVoidFactory = new ServiceOrderVoidFactory();
        
        expect(serviceOrderVoidFactory.handler.bind(serviceOrderVoidFactory))
            .to.throw(TypeError, `Cannot read property 'orderType' of undefined`);
    });

    it('should build serviceOrderVoidFactory instance', async () => {
        const serviceOrder = await factory.create(FN.serviceOrder);
        const serviceOrderVoidFactory = new ServiceOrderVoidFactory(serviceOrder);
        
        expect(serviceOrderVoidFactory.transaction).to.be.undefined;
        expect(serviceOrderVoidFactory.serviceOrder).to.include(serviceOrder);
        expect(serviceOrderVoidFactory.metaData).to.be.an('object').to.be.empty;
        expect(serviceOrderVoidFactory.handler).to.exist;
        expect(serviceOrderVoidFactory.postPayServiceOrderVoidHandler).to.exist;
        expect(serviceOrderVoidFactory.prePayServiceOrderVoidHandler).to.exist;
    });
    
    describe('test handler', () => {
        it('orderType: SERVICE; paymentTiming: PRE-PAY should return PrePayServiceOrderVoidHandler', async () => {
            const serviceOrder = await factory.create(FN.serviceOrder, {
                paymentTiming: 'PRE-PAY',
                orderType: ORDER_TYPES.SERVICE,
            });
            const serviceOrderVoid = new ServiceOrderVoidFactory(serviceOrder);
            const result = serviceOrderVoid.handler();

            expect(result).to.be.an.instanceOf(PrePayServiceOrderVoidHandler);
        });

        it('orderType: SERVICE; paymentTiming: POST-PAY should return PostPayServiceOrderVoidHandler', async () => {
            const serviceOrder = await factory.create(FN.serviceOrder, {
                paymentTiming: 'POST-PAY',
                orderType: ORDER_TYPES.SERVICE,
            });
            const serviceOrderVoid = new ServiceOrderVoidFactory(serviceOrder);
            const result = serviceOrderVoid.handler();

            expect(result).to.be.an.instanceOf(PostPayServiceOrderVoidHandler);
        });

        it('orderType: RESIDENTIAL should return ResidentialServiceOrderVoidHandler', async () => {
            const serviceOrder = await factory.create(FN.serviceOrder, {
                orderType: ORDER_TYPES.RESIDENTIAL,
            });
            const serviceOrderVoid = new ServiceOrderVoidFactory(serviceOrder);
            const result = serviceOrderVoid.handler();

            expect(result).to.be.an.instanceOf(ResidentialServiceOrderVoidHandler);
        });

        it('orderType is not SERVICE or RESIDENTIAL should return OnlineServiceOrderVoidHandler', async () => {
            const serviceOrder = await factory.create(FN.serviceOrder, {
                orderType: ORDER_TYPES.ONLINE,
            });
            const serviceOrderVoid = new ServiceOrderVoidFactory(serviceOrder);
            const result = serviceOrderVoid.handler();

            expect(result).to.be.an.instanceOf(OnlineServiceOrderVoidHandler);
        });
    });
});
