const { expect } = require('./chaiHelper');
const factory = require('../factories');
const { createCentsCustomerAndRelatedEntities } = require('./createCustomerHelper');

/**
 * Helper for creation of expected CustomerAddressRecord
 * @param {*} props - expected props values (static values known beforehand)
 * @param {{id: number, createdAt: Date, updatedAt: Date}} customerAddressDynamicProps 
 *  - (optional) dynamic/incremental values: {id, createdAt, updatedAt, centsCustomerId}
 * @returns object representing actual CustomerAddressRecord
 */
const createCustomerAddressRecord = (props, actualCustomerAddressRecord) => {
    let customerAddressDynamicProps;
    if(typeof actualCustomerAddressRecord === 'object') {
        const {id, createdAt, updatedAt, centsCustomerId} = actualCustomerAddressRecord;
        customerAddressDynamicProps = { id, createdAt, updatedAt, centsCustomerId };
    }

    return {
        countryCode: 'US',
        googlePlacesId: null,
        instructions: null,
        leaveAtDoor: null,
        lat: null,
        lng: null,
        ...props,
        ...customerAddressDynamicProps
    };
};

/**
 * Returns address object used in http requests or payloads 
 * with default values which can be optionally overriden with newAddressProps
 */
const createBaseAddressObject = (newAddressProps) => ({
    address1: 'Address 1',
    address2: 'Address 2',
    city: 'City',
    firstLevelSubdivisionCode: '123',
    postalCode: '456-789',
    ...newAddressProps
});

/**
 * Internal payload object used as param for Pipelines and UoW.
 * @param {Number} centsCustomerId 
 * @param {Object} newPayloadProps - object to override all or top-level payload properties
 * @param {Object} newAddressProps - object to override only payload.address data
 * @returns payload object with minimal preset properties
 */
const createPayload = (centsCustomerId, newPayloadProps, newAddressProps) => ({
    centsCustomerId,
    address: createBaseAddressObject(newAddressProps),
    googlePlacesId: '1234567890',
    ...newPayloadProps
});

const createCustomerWithAddress = async (customerProps, addressProps) => {
    const {centsCustomer, storeCustomer, store} = await createCentsCustomerAndRelatedEntities(null, customerProps);
        const centsCustomerAddress = await factory.create('centsCustomerAddress', {
        centsCustomerId: centsCustomer.id,
        ...addressProps
    });
    return {centsCustomer, storeCustomer, store, centsCustomerAddress};
};

const assertCustomerAddressRecord = (actual, expected) => {
    expect(actual).to.be.eql(createCustomerAddressRecord(expected, actual));

    expect(actual.id).to.satisfy(Number.isInteger);
    expect(actual.createdAt).to.be.a.dateString();
    expect(actual.updatedAt).to.be.a.dateString();
};

const assertMissingDataRejections = async (uowRef) => {
    await expect(uowRef()).to.be.rejected;
    await expect(uowRef(null)).to.be.rejected;
    await expect(uowRef(undefined)).to.be.rejected;
    await expect(uowRef({})).to.be.rejected;
    await expect(uowRef({address: null})).to.be.rejected;
    await expect(uowRef({address: undefined})).to.be.rejected;
};

const assertNotNullRestrictions = async (payload, uowRef) => {
    const payloadWithNullAddress1 = {
        ...payload, 
        address: {
            ...payload.address, 
            address1: null 
        }
    };
    await expect(uowRef(payloadWithNullAddress1)).to.be.rejected;

    const payloadWithNullCity = {
        ...payload, 
        address: {
            ...payload.address, 
            city: null 
        }
    };
    await expect(uowRef(payloadWithNullCity)).to.be.rejected;

    const payloadWithNullFirstLevelSubdivisionCode = {
        ...payload, 
        address: {
            ...payload.address, 
            firstLevelSubdivisionCode: null 
        }
    };
    await expect(uowRef(payloadWithNullFirstLevelSubdivisionCode)).to.be.rejected;


    const payloadWithNullPostalCode = {
        ...payload, 
        address: {
            ...payload.address, 
            postalCode: null 
        }
    };
    await expect(uowRef(payloadWithNullPostalCode)).to.be.rejected;
};

module.exports = {
    createCustomerAddressRecord,
    createBaseAddressObject,
    createPayload,
    createCustomerWithAddress,
    assertCustomerAddressRecord,
    assertMissingDataRejections,
    assertNotNullRestrictions,
};