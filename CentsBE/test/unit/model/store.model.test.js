require('../../testHelper');
const { expect } = require('../../support/chaiHelper');
const {
    hasAssociation,
    hasTable,
    belongsToOne,
    hasMany,
    hasOne,
} = require('../../support/objectionTestHelper');
const factory = require('../../factories');
const Store = require('../../../models/store');

describe('test Store model', () => {
    it('should return true if order table exists', async () => {
        const hasTableName = await hasTable(Store.tableName);
        expect(hasTableName).to.be.true;
    });

    it('idColumn should return id', async () => {
        expect(Store.idColumn).to.equal('id');
    });

    it('should return addressString', async () => {
        const store = await factory.create('store');
        const newAddressString = `${store.address}, ${store.city}, ${store.state}, US, ${store.zipCode}`;
        expect(store.addressString).to.eq(newAddressString);
    });

    it('Store should have hub association', () => {
        hasAssociation(Store, 'hub');
    });

    it('Store should have one hub association', async () => {
        hasOne(Store, 'hub');
    });

    it('Store should have machines association', () => {
        hasAssociation(Store, 'machines');
    });

    it('Store should have many machines association', async () => {
        hasMany(Store, 'machines');
    });

    it('Store should have shifts association', () => {
        hasAssociation(Store, 'shifts');
    });

    it('Store should have many shifts association', async () => {
        hasMany(Store, 'shifts');
    });

    it('Store should have laundromatBusiness association', () => {
        hasAssociation(Store, 'laundromatBusiness');
    });

    it('Store should BelongsToOneRelation laundromatBusiness association', async () => {
        belongsToOne(Store, 'laundromatBusiness');
    });

    it('Store should have batches association', () => {
        hasAssociation(Store, 'batches');
    });

    it('Store should have many batches association', async () => {
        hasMany(Store, 'batches');
    });

    it('Store should have district association', () => {
        hasAssociation(Store, 'district');
    });

    it('Store should have one district association', async () => {
        hasOne(Store, 'district');
    });

    it('Store should have orders association', () => {
        hasAssociation(Store, 'orders');
    });

    it('Store should have many orders association', async () => {
        hasMany(Store, 'orders');
    });

    it('Store should have hubOrders association', () => {
        hasAssociation(Store, 'hubOrders');
    });

    it('Store should have many hubOrders association', async () => {
        hasMany(Store, 'hubOrders');
    });

    it('Store should have assignedLocations association', () => {
        hasAssociation(Store, 'assignedLocations');
    });

    it('Store should have many assignedLocations association', async () => {
        hasMany(Store, 'assignedLocations');
    });

    it('Store should have prices association', () => {
        hasAssociation(Store, 'prices');
    });

    it('Store should have many prices association', async () => {
        hasMany(Store, 'prices');
    });

    it('Store should have inventoryItems association', () => {
        hasAssociation(Store, 'inventoryItems');
    });

    it('Store should have many inventoryItems association', async () => {
        hasMany(Store, 'inventoryItems');
    });

    it('Store should have taxRate association', () => {
        hasAssociation(Store, 'taxRate');
    });

    it('Store should have one taxRate association', async () => {
        hasOne(Store, 'taxRate');
    });

    it('Store should have storeCustomers association', () => {
        hasAssociation(Store, 'storeCustomers');
    });

    it('Store should have many storeCustomers association', async () => {
        hasMany(Store, 'storeCustomers');
    });

    it('Store should have storePromotionPrograms association', () => {
        hasAssociation(Store, 'storePromotionPrograms');
    });

    it('Store should have many storePromotionPrograms association', async () => {
        hasMany(Store, 'storePromotionPrograms');
    });

    it('Store should have esdReaders association', () => {
        hasAssociation(Store, 'esdReaders');
    });

    it('Store should have many esdReaders association', async () => {
        hasMany(Store, 'esdReaders');
    });

    it('Store should have orderDeliveries association', () => {
        hasAssociation(Store, 'orderDeliveries');
    });

    it('Store should have many orderDeliveries association', async () => {
        hasMany(Store, 'orderDeliveries');
    });

    it('Store should have storeTheme association', () => {
        hasAssociation(Store, 'storeTheme');
    });

    it('Store should have one storeTheme association', async () => {
        hasOne(Store, 'storeTheme');
    });

    it('Store should have cciSettings association', () => {
        hasAssociation(Store, 'cciSettings');
    });

    it('Store should have one cciSettings association', async () => {
        hasOne(Store, 'cciSettings');
    });

    it('Store should have settings association', () => {
        hasAssociation(Store, 'settings');
    });

    it('Store should have one settings association', async () => {
        hasOne(Store, 'settings');
    });

    it('Store should have ownDelivery association', () => {
        hasAssociation(Store, 'ownDelivery');
    });

    it('Store should have one ownDelivery association', async () => {
        hasOne(Store, 'ownDelivery');
    });

    it('Store should have centsDelivery association', () => {
        hasAssociation(Store, 'centsDelivery');
    });

    it('Store should have one centsDelivery association', async () => {
        hasOne(Store, 'centsDelivery');
    });

    it('Store should have scaleDevices association', () => {
        hasAssociation(Store, 'scaleDevices');
    });

    it('Store should have many scaleDevices association', async () => {
        hasMany(Store, 'scaleDevices');
    });

    it('Store should have cashOutEvents association', () => {
        hasAssociation(Store, 'cashOutEvents');
    });

    it('Store should have many cashOutEvents association', async () => {
        hasMany(Store, 'cashOutEvents');
    });

    it('Store should have cashDrawerStartEvents association', () => {
        hasAssociation(Store, 'cashDrawerStartEvents');
    });

    it('Store should have many cashDrawerStartEvents association', async () => {
        hasMany(Store, 'cashDrawerStartEvents');
    });

    it('Store should have cashDrawerEndEvents association', () => {
        hasAssociation(Store, 'cashDrawerEndEvents');
    });

    it('Store should have many cashDrawerEndEvents association', async () => {
        hasMany(Store, 'cashDrawerEndEvents');
    });

    it('Store should have routes association', () => {
        hasAssociation(Store, 'routes');
    });

    it('Store should have many routes association', async () => {
        hasMany(Store, 'routes');
    });

    it('Store should have routeDelivery association', () => {
        hasAssociation(Store, 'routeDelivery');
    });

    it('Store should have one routeDelivery association', async () => {
        hasOne(Store, 'routeDelivery');
    });

    it('Store should have partnerSubsidiaries association', () => {
        hasAssociation(Store, 'partnerSubsidiaries');
    });

    it('Store should have many partnerSubsidiaries association', async () => {
        hasMany(Store, 'partnerSubsidiaries');
    });

    it('Store should have printerSettings association', () => {
        hasAssociation(Store, 'printerSettings');
    });

    it('Store should have one printerSettings association', async () => {
        hasOne(Store, 'printerSettings');
    });

    it('Store should have turns association', () => {
        hasAssociation(Store, 'turns');
    });

    it('Store should have many turns association', async () => {
        hasMany(Store, 'turns');
    });

    it('Store should have turns association', () => {
        hasAssociation(Store, 'turns');
    });

    it('Store should have many turns association', async () => {
        hasMany(Store, 'turns');
    });

    it('Store should have laundroworksSettings association', () => {
        hasAssociation(Store, 'laundroworksSettings');
    });

    it('Store should have one laundroworksSettings association', async () => {
        hasOne(Store, 'laundroworksSettings');
    });

    it('Store should have masterOrders association', () => {
        hasAssociation(Store, 'masterOrders');
    });

    it('Store should have many masterOrders association', async () => {
        hasMany(Store, 'masterOrders');
    });

    it('Store should have spyderWashSettings association', () => {
        hasAssociation(Store, 'spyderWashSettings');
    });

    it('Store should have one spyderWashSettings association', async () => {
        hasOne(Store, 'spyderWashSettings');
    });

    it('Store model should have getTeamMembers method when created', async () => {
        const store = await factory.create('store');
        expect(store.getTeamMembers).to.be.a('function');
    });

    it('Store model should have getBatches method when created', async () => {
        const store = await factory.create('store');
        expect(store.getBatches).to.be.a('function');
    });

    it('Store model should have getDistrict method when created', async () => {
        const store = await factory.create('store');
        expect(store.getDistrict).to.be.a('function');
    });

    it('Store model getDistrict method should return district', async () => {
        const district = await factory.create('district'),
            store = await factory.create('store', {
                districtId: district.id,
            });
        expect((await store.getDistrict()).id).to.be.eq(district.id);
    });

    it('Store model should have getOrders method when created', async () => {
        const store = await factory.create('store');
        expect(store.getOrders).to.be.a('function');
    });

    it('Store model getOrders method should return orders', async () => {
        const store = await factory.create('store'),
            serviceOrder = await factory.create('serviceOrder', {
                storeId: store.id,
            });
        expect((await store.getOrders())[0].id).to.be.eq(serviceOrder.id);
    });

    it('Store model should have getBusiness method when created', async () => {
        const store = await factory.create('store');
        expect(store.getBusiness).to.be.a('function');
    });

    it('Store model getBusiness method should return business', async () => {
        const laundromatBusiness = await factory.create('laundromatBusiness'),
            store = await factory.create('store', {
                businessId: laundromatBusiness.id,
            });
        expect((await store.getBusiness()).id).to.be.eq(laundromatBusiness.id);
    });

    it('Store model should have getTaxRate method when created', async () => {
        const store = await factory.create('store');
        expect(store.getTaxRate).to.be.a('function');
    });

    it('Store model getTaxRate method should return taxRate', async () => {
        const taxRate = await factory.create('taxRate'),
            store = await factory.create('store', {
                taxRateId: taxRate.id,
            });
        expect((await store.getTaxRate()).id).to.be.eq(taxRate.id);
    });

    it('Store model should have getStoreCustomers method when created', async () => {
        const store = await factory.create('store');
        expect(store.getStoreCustomers).to.be.a('function');
    });

    it('Store model getStoreCustomers method should return storeCustomers', async () => {
        const store = await factory.create('store'),
            storeCustomer = await factory.create('storeCustomer', {
                storeId: store.id,
            });
        expect((await store.getStoreCustomers())[0].id).to.be.eq(storeCustomer.id);
    });

    it('Store model should have getStorePromotionPrograms method when created', async () => {
        const store = await factory.create('store');
        expect(store.getStorePromotionPrograms).to.be.a('function');
    });

    it('Store model getStorePromotionPrograms method should return storePromotionPrograms', async () => {
        const store = await factory.create('store'),
            storePromotionProgram = await factory.create('storePromotionProgram', {
                storeId: store.id,
            });
        expect((await store.getStorePromotionPrograms())[0].id).to.be.eq(storePromotionProgram.id);
    });

    it('Store model should have getEsdReaders method when created', async () => {
        const store = await factory.create('store');
        expect(store.getEsdReaders).to.be.a('function');
    });

    it('Store model getEsdReaders method should return esdReaders', async () => {
        const store = await factory.create('store'),
            esdReader = await factory.create('esdReader', {
                storeId: store.id,
            });
        expect((await store.getEsdReaders())[0].id).to.be.eq(esdReader.id);
    });

    it('Store model should have isLocationResidential method when created', async () => {
        const store = await factory.create('store');
        expect(store.isLocationResidential).to.be.a('function');
    });

    it('Store model should return isLocationResidential method result', async () => {
        const store = await factory.create('store', {
            type: 'RESIDENTIAL',
        });
        expect((await store.isLocationResidential())).to.eq(true);
    });

    it('Store model should have isLocationStandalone method when created', async () => {
        const store = await factory.create('store');
        expect(store.isLocationStandalone).to.be.a('function');
    });

    it('Store model should return isLocationStandalone method result', async () => {
        const store = await factory.create('store');
        expect((await store.isLocationStandalone())).to.eq(true);
    });

    it('Store model should have isLocationHub method when created', async () => {
        const store = await factory.create('store');
        expect(store.isLocationHub).to.be.a('function');
    });

    it('Store model should return isLocationHub method result', async () => {
        const store = await factory.create('store', {
            type: 'HUB',
        });
        expect((await store.isLocationHub())).to.eq(true);
    });

    it('Store model should have isLocationIntakeOnly method when created', async () => {
        const store = await factory.create('store');
        expect(store.isLocationIntakeOnly).to.be.a('function');
    });

    it('Store model should return isLocationIntakeOnly method result', async () => {
        const store = await factory.create('store', {
            type: 'INTAKE_ONLY',
        });
        expect((await store.isLocationIntakeOnly())).to.eq(true);
    });

    it('Store model should have isLocationStore method when created', async () => {
        const store = await factory.create('store');
        expect(store.isLocationStore).to.be.a('function');
    });

    it('Store model should return isLocationStore method result', async () => {
        const store = await factory.create('store', {
            type: 'STORE',
        });
        expect((await store.isLocationStore())).to.eq(true);
    });

    it('Store model should have getStoreTheme method when created', async () => {
        const store = await factory.create('store');
        expect(store.getStoreTheme).to.be.a('function');
    });

    it('Store model getStoreTheme method should return storeTheme', async () => {
        const store = await factory.create('store'),
            storeTheme = await factory.create('storeTheme', {
                storeId: store.id,
            });
        expect((await store.getStoreTheme())[0].storeId).to.be.eq(storeTheme.storeId);
    });

    it('Store model should have getCciSettings method when created', async () => {
        const store = await factory.create('store');
        expect(store.getCciSettings).to.be.a('function');
    });

    it('Store model getCciSettings method should return cciSettings', async () => {
        const store = await factory.create('store'),
            cciSetting = await factory.create('cciSetting', {
                storeId: store.id,
            });
        expect((await store.getCciSettings()).id).to.be.eq(cciSetting.id);
    });

    it('Store model should have getStoreSettings method when created', async () => {
        const store = await factory.create('store');
        expect(store.getStoreSettings).to.be.a('function');
    });

    it('Store model getStoreSettings method should return settings', async () => {
        const store = await factory.create('store');
        expect((await store.getStoreSettings()).storeId).should.exist;
    });

    it('Store model should have getPrinterSettings method when created', async () => {
        const store = await factory.create('store');
        expect(store.getPrinterSettings).to.be.a('function');
    });

    it('Store model getPrinterSettings method should return printerSettings', async () => {
        const store = await factory.create('store'),
            printerStoreSetting = await factory.create('printerStoreSetting', {
                storeId: store.id,
            });
        expect((await store.getPrinterSettings()).id).to.be.eq(printerStoreSetting.id);
    });

    it('Store model should have getLaundroworksSettings method when created', async () => {
        const store = await factory.create('store');
        expect(store.getLaundroworksSettings).to.be.a('function');
    });

    it('Store model getLaundroworksSettings method should return laundroworksSettings', async () => {
        const store = await factory.create('store'),
            laundroworksSettings = await factory.create('laundroworksSettings', {
                storeId: store.id,
            });
        expect((await store.getLaundroworksSettings()).id).to.be.eq(laundroworksSettings.id);
    });

    it('Store model should have getSpyderWashSettings method when created', async () => {
        const store = await factory.create('store');
        expect(store.getSpyderWashSettings).to.be.a('function');
    });

    it('Store model getSpyderWashSettings method should return spyderWashSettings', async () => {
        const store = await factory.create('store'),
            spyderWashSettings = await factory.create('spyderWashSettings', {
                storeId: store.id,
            });
        expect((await store.getSpyderWashSettings()).id).to.be.eq(spyderWashSettings.id);
    });

});