require('../../testHelper');
const { expect } = require('../../support/chaiHelper');
const { hasTable, hasOne, hasAssociation } = require('../../support/objectionTestHelper');
const factory = require('../../factories');
const PartnerSubsidiaryStore = require('../../../models/partnerSubsidiaryStore');

describe('test PartnerSubsidiaryStore model', () => {
    it('should return true if partnerSubsidiaryStore table exists', async () => {
        const hasTableName = await hasTable(PartnerSubsidiaryStore.tableName);
        expect(hasTableName).to.be.true;
    });

    it('PartnerSubsidiaryStore should have store association', async () => {
        hasAssociation(PartnerSubsidiaryStore, 'store');
    });

    it('PartnerSubsidiaryStore should HasOneRelation store association', async () => {
        hasOne(PartnerSubsidiaryStore, 'store');
    });

    it('PartnerSubsidiaryStore should have partnerSubsidiary association', async () => {
        hasAssociation(PartnerSubsidiaryStore, 'partnerSubsidiary');
    });

    it('PartnerSubsidiaryStore should HasOneRelation partnerSubsidiary association', async () => {
        hasOne(PartnerSubsidiaryStore, 'partnerSubsidiary');
    });

    it('PartnerSubsidiaryStore should have updatedAt field when updated for beforeUpdate hook', async () => {
        const partnerSubsidiaryStore = await factory.create('partnerSubsidiaryStore');
        const initialSubsidiaryStore = await PartnerSubsidiaryStore.query()
            .findById(partnerSubsidiaryStore.id)
            .returning('*');
        const updatedSubsidiaryStore = await PartnerSubsidiaryStore.query()
            .patch({
                store: partnerSubsidiaryStore.storeId,
            })
            .findById(partnerSubsidiaryStore.id)
            .returning('*');
        expect(updatedSubsidiaryStore.updatedAt).to.not.be.null;
        expect(updatedSubsidiaryStore.updatedAt).to.not.be.undefined;
        expect(updatedSubsidiaryStore.updatedAt).to.be.a.dateString();
        expect(initialSubsidiaryStore.updatedAt.getTime()).to.not.equal(
            updatedSubsidiaryStore.updatedAt.getTime(),
        );
    });

    it('PartnerSubsidiaryStore should set updatedAt according insert', async () => {
        const time = new Date().toUTCString();
        const partnerSubsidiaryStore = await factory.create('partnerSubsidiaryStore');
        const updatedSubsidiaryStore = await PartnerSubsidiaryStore.query()
            .patch({
                store: partnerSubsidiaryStore.storeId,
                updatedAt: time,
            })
            .findById(partnerSubsidiaryStore.id)
            .returning('*');
        expect(updatedSubsidiaryStore.updatedAt).to.not.be.null;
        expect(updatedSubsidiaryStore.updatedAt).to.not.be.undefined;
        expect(updatedSubsidiaryStore.updatedAt).to.be.a.dateString();
        expect(updatedSubsidiaryStore.updatedAt.toUTCString()).equal(time);
    });
});
