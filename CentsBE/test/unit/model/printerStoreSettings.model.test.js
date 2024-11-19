require('../../testHelper');
const { expect } = require('../../support/chaiHelper');
const { hasAssociation,
        hasTable,
        hasOneThrough,
        hasOne,
} = require('../../support/objectionTestHelper');
const PrinterStoreSettings = require('../../../models/printerStoreSettings');
const factory = require('../../factories');

describe('test PrinterStoreSettings model', () => {
    it('should return true if printerStoreSettings table exists', async () => {
        const hasTableName = await hasTable(PrinterStoreSettings.tableName);
        expect(hasTableName).to.be.true;
    });

    it('idColumn should return id', async () => {
        expect(PrinterStoreSettings.idColumn).to.equal('id');
    });

    it('PrinterStoreSettings should have business association', () => {
        hasAssociation(PrinterStoreSettings, 'business');
    });

    it('PrinterStoreSettings should HasOneThrough business association', async () => {
        hasOneThrough(PrinterStoreSettings, 'business');
    });

    it('PrinterStoreSettings should have store association', () => {
        hasAssociation(PrinterStoreSettings, 'store');
    });

    it('PrinterStoreSettings should HasOne store association', async () => {
        hasOne(PrinterStoreSettings, 'store');
    });

    it('PrinterStoreSettings model should have updatedAt field when updated for beforeUpdate hook', async () => {
        const printerStoreSettings = await factory.create('printerStoreSetting');
        const updatedBrand = await PrinterStoreSettings.query()
            .patch({
                brand: 'brand123'
            })
            .findById(printerStoreSettings.id)
            .returning('*');
        expect(updatedBrand.updatedAt).to.not.be.null;
        expect(updatedBrand.updatedAt).to.not.be.undefined;
    });
});
