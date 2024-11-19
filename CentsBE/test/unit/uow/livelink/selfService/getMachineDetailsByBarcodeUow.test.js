require('../../../../testHelper');
const { expect } = require('chai');
const chai = require('chai');
chai.use(require('chai-as-promised'));
const factory = require('../../../../factories');
const { FACTORIES_NAMES } = require('../../../../constants/factoriesNames');
const { getMachineDetailsByBarcodeUow } = require('../../../../../uow/liveLink/selfService/getMachineDetailsByBarcodeUow');
const Machine = require('../../../../../models/machine');
const { getMachineNamePrefix, getMachineModelDetails, getDevice, getMachinePricePerTurn } = require('../../../../../utils/machines/machineUtil');
const { turnStatuses } = require('../../../../../constants/constants');

describe('test getMachineDetailsByBarcodeUow function', () => {
    describe('when a machine does not exist', () => {
        it('should reject with Error', async () => {
            const payloadMock = {
                barcode: 'abracadabra',
            };

            await expect(getMachineDetailsByBarcodeUow(payloadMock)).to.be.rejectedWith(Error)
        });
    });

    describe('when a machine exist', () => {
        it('should return formatted object with specific values and available status', async () => {
            const business = await factory.create(FACTORIES_NAMES.laundromatBusiness);
            const store = await factory.create(FACTORIES_NAMES.store, {
                businessId: business.id,
            });
            const machineWasherOnline = await factory.create(FACTORIES_NAMES.machineWasherWithPairedOnlineDevice, {
                storeId: store.id,
            });
            await factory.create(FACTORIES_NAMES.machinePricing, {
                machineId: machineWasherOnline.id,
            })
            const machineDetails = await Machine.query().findById(machineWasherOnline.id)
                .withGraphJoined('[model.[machineType], pairing.[device], machinePricings]');
            const machineNamePrefixExpected = getMachineNamePrefix(machineDetails.model);
            const machineModelExpected = getMachineModelDetails(machineDetails);
            const deviceExpected = getDevice(machineDetails);
            const machinePricingExpected = getMachinePricePerTurn(machineDetails);

            const payloadMock = {
                barcode: machineWasherOnline.serialNumber,
            };

            const result = await getMachineDetailsByBarcodeUow(payloadMock);

            expect(result).to.be.an('object');
            expect(result).to.have.property('id').to.be.eql(machineWasherOnline.id);
            expect(result).to.have.property('store').to.deep.equal({
                id: store.id,
                address: store.address,
                name: store.name,
            });
            expect(result).to.have.property('business').to.deep.equal({
                id: business.id,
            });
            expect(result).to.have.property('name').to.be.eql(machineWasherOnline.name);
            expect(result).to.have.property('prefix').to.be.eql(machineNamePrefixExpected);
            expect(result).to.have.property('serialNumber').to.be.eql(machineWasherOnline.serialNumber);
            expect(result).to.have.property('pricePerTurnInCents').to.be.eql(machinePricingExpected);
            expect(result).to.have.property('turnTimeInMinutes').to.be.eql(machineWasherOnline.turnTimeInMinutes);
            expect(result).to.have.property('model').to.deep.equal(machineModelExpected);
            expect(result).to.have.property('device').to.deep.equal(deviceExpected);
            expect(result).to.have.property('activeTurn').to.deep.equal({});
            expect(result).to.have.property('isAvailable').to.be.eql(true);
        })

        it('should return formatted object with specific values and not available status if a machine is with active turn', async () => {
            const business = await factory.create(FACTORIES_NAMES.laundromatBusiness);
            const store = await factory.create(FACTORIES_NAMES.store, {
                businessId: business.id,
            });
            const machineWasherOnline = await factory.create(FACTORIES_NAMES.machineWasherWithPairedOnlineDevice, {
                storeId: store.id,
            });
            await factory.create(FACTORIES_NAMES.machinePricing, {
                machineId: machineWasherOnline.id,
            })
            const centsCustomer = await factory.create(FACTORIES_NAMES.centsCustomer);
            const storeCustomer = await factory.create(FACTORIES_NAMES.storeCustomer, {
                centsCustomerId: centsCustomer.id,
                storeId: store.id,
                businessId: business.id,
            });
            const machineDetails = await Machine.query().findById(machineWasherOnline.id)
                .withGraphJoined('[model.[machineType], pairing.[device], machinePricings]');

            const deviceExpected = getDevice(machineDetails);
            const turn = await factory.create(FACTORIES_NAMES.turn, {
                storeId: store.id,
                machineId: machineWasherOnline.id,
                status: turnStatuses.STARTED,
                deviceId: deviceExpected.id,
                storeCustomerId: storeCustomer.id,
            })

            const machineNamePrefixExpected = getMachineNamePrefix(machineDetails.model);
            const machineModelExpected = getMachineModelDetails(machineDetails);
            const machinePricingExpected = getMachinePricePerTurn(machineDetails);

            const payloadMock = {
                barcode: machineWasherOnline.serialNumber,
            };

            const result = await getMachineDetailsByBarcodeUow(payloadMock);

            expect(result).to.be.an('object');
            expect(result).to.have.property('id').to.be.eql(machineWasherOnline.id);
            expect(result).to.have.property('store').to.deep.equal({
                id: store.id,
                address: store.address,
                name: store.name,
            });
            expect(result).to.have.property('business').to.deep.equal({
                id: business.id,
            });
            expect(result).to.have.property('name').to.be.eql(machineWasherOnline.name);
            expect(result).to.have.property('prefix').to.be.eql(machineNamePrefixExpected);
            expect(result).to.have.property('serialNumber').to.be.eql(machineWasherOnline.serialNumber);
            expect(result).to.have.property('pricePerTurnInCents').to.be.eql(machinePricingExpected);
            expect(result).to.have.property('turnTimeInMinutes').to.be.eql(machineWasherOnline.turnTimeInMinutes);
            expect(result).to.have.property('model').to.deep.equal(machineModelExpected);
            expect(result).to.have.property('device').to.deep.equal(deviceExpected);
            expect(result).to.have.property('activeTurn').to.deep.equal({
                id: turn.id,
                serviceType: turn.serviceType,
                storeCustomerId: storeCustomer.id,
            });
            expect(result).to.have.property('isAvailable').to.be.eql(false);
        })
    });
});
