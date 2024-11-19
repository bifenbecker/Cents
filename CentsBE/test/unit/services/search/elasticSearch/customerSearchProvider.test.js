require('../../../../testHelper');
const factory = require('../../../../factories');
const { expect } = require('../../../../support/chaiHelper');
const {businessCustomerSchema} = require('../../../../../elasticsearch/businessCustomer/schema');
const {fetchAndReindexBusinessCustomers} = require('../../../../../elasticsearch/businessCustomer/queries')
const CustomerSearchService = require('../../../../../services/search/service/customerSearchService');
const {languages} = require('../../../../../constants/constants');

const defaultCustomerData = {
    firstName: 'cents',
    lastName: 'customer',
    phoneNumber: '1234567890',
    email: 'cents@gmail.com'
}
async function createCentsCustomer(data) {
    return factory.create('centsCustomer', {
        ...data
    });
}

async function createStoreCustomer(censtCustomer, storeId, businessId, businessCustomerId) {
    const storeCustomer = await factory.create('storeCustomer', {
        centsCustomerId: censtCustomer.id,
        storeId,
        businessId,
        businessCustomerId,
        firstName: censtCustomer.firstName,
        lastName: censtCustomer.lastName,
        email: censtCustomer.email,
        phoneNumber: censtCustomer.phoneNumber
    });
    return storeCustomer
}

async function createBusinessCustomer(businessId, centsCustomerId) {
    const businessCustomer = await factory.create('businessCustomer', {
        businessId,
        centsCustomerId
    })
    return businessCustomer
}

async function createCustomer(businessId, customerData) {
    const store = await createStore(businessId)
    const customer = await createCentsCustomer(customerData)
    const businessCustomer = await createBusinessCustomer(businessId, customer.id)           
    const storeCustomer = await createStoreCustomer(
        customer, store.id, businessId, businessCustomer.id
    )
    return {customer, currentStore: store, businessCustomer, storeCustomer}
}

function createMultipleStoreCustomers(businessId, centsCustomer) {
    const a = Array(5).fill(1)
    return Promise.all(a.map(async (ele) => {
        const store = await createStore(businessId)
        return createStoreCustomer(
            centsCustomer, store.id, businessId
        )
    }))
}

function createStore(businessId) {
    return factory.create('store', {
        businessId
    });
}

function createLaundromatBusiness() {
    return factory.create('laundromatBusiness')
}

function createMultipleBusinessCustomers(centsCustomer) {
    const a = Array(5).fill(1)
    return Promise.all(
        a.map(async (ele) => {
            const business = await createLaundromatBusiness()
            const store = await createStore(business.id)
            const storeCustomers = await createStoreCustomer(
                centsCustomer,
                store.id,
                business.id,
            )
            return store;
        })
    )
}

describe('store customers list', () => {
    let laundromatBusiness = {}
    let store;
    let centsCustomer;
    let businessCustomer;
    let storeCustomer;
    let queryParams = {}
    before(async () => {
        await businessCustomerSchema()
    })
    beforeEach(async () => {
        try {
            laundromatBusiness = await createLaundromatBusiness();
            const result = await createCustomer(laundromatBusiness.id, defaultCustomerData);
            queryParams = {}
            queryParams.storeIds = [result.currentStore.id]
            centsCustomer = result.customer
            store = result.currentStore
            storeCustomer = result.storeCustomer
            businessCustomer = result.businessCustomer
            await fetchAndReindexBusinessCustomers()
        } catch (error) {
            console.log('error in storeCustomers list beforeEach hook', error)
        }
        
    })

    it('should return the customer part of the store', async () => {
        const customerSearchService = new CustomerSearchService(queryParams)
        const {data, totalCount} = await customerSearchService.storeCustomersList()
        expect(totalCount).to.equal(1)
        data.map((ele) => {
            expect(ele.centsCustomerId).to.equal(centsCustomer.id)
            expect(ele.businessId).to.equal(laundromatBusiness.id)
            expect(ele.fullName).to.equal(`${centsCustomer.firstName} ${centsCustomer.lastName}`)
            expect(ele.storeCustomers).to.be.of.length(1)
            ele.storeCustomers.map((customer) => {
                expect(customer.storeId).to.equal(store.id)
            })
        })
    })

    it('should return the customer if keyword partial matches fullName', async () => {
        queryParams.keyword = 'cents customer'
        const customerSearchService = new CustomerSearchService(queryParams)
        const {data, totalCount} = await customerSearchService.storeCustomersList()
        expect(totalCount).to.equal(1)
        data.map((ele) => {
            ele.fullName = `${centsCustomer.firstName} + ' ' + ${centsCustomer.lastName}`
        })
    })

    it('should return the customer if keyword partial matches or full matches email', async () => {
        queryParams.keyword = 'cents@gmail.com'
        const customerSearchService = new CustomerSearchService(queryParams)
        const {data, totalCount} = await customerSearchService.storeCustomersList()
        expect(totalCount).to.equal(1)
        data.map((ele) => {
            ele.email = centsCustomer.email
        })
    })

    it('should return the customer if keyword partial matches or full matches phoneNumber', async () => {
        queryParams.keyword = '1234567890'
        const customerSearchService = new CustomerSearchService(queryParams)
        const {data, totalCount} = await customerSearchService.storeCustomersList()
        expect(totalCount).to.equal(1)
        data.map((ele) => {
            ele.phoneNumber = centsCustomer.phoneNumber
        })
    })

    it('should return empty array if non existing customer is searched', async () => {
        queryParams.keyword = 'joseph'
        const customerSearchService = new CustomerSearchService(queryParams)
        const {data, totalCount} = await customerSearchService.storeCustomersList()
        expect(totalCount).to.equal(0)
    })

    it('should return empty array if we query with another store where customer is not present', async () => {
        delete queryParams.keyword
        queryParams.storeIds = [1234]
        const customerSearchService = new CustomerSearchService(queryParams)
        const {data, totalCount} = await customerSearchService.storeCustomersList()
        expect(totalCount).to.equal(0)
        expect(data).to.be.of.length(0)
    })

    it('should return the customer with  multiple storeCustomers', async () => {
        queryParams.storeIds = [store.id]
        const customers = await createMultipleStoreCustomers(laundromatBusiness.id, centsCustomer)
        await fetchAndReindexBusinessCustomers()
        const customerSearchService = new CustomerSearchService(queryParams)
        const {data, totalCount} = await customerSearchService.storeCustomersList()
        expect(totalCount).to.equal(1)
    })

    it('should return the current store customer only even if customer is created in multiple businesses', async () => {
        const otherStores = await createMultipleBusinessCustomers(centsCustomer)
        await fetchAndReindexBusinessCustomers()
        const customerSearchService = new CustomerSearchService(queryParams)
        const {data, totalCount} = await customerSearchService.storeCustomersList();
        expect(totalCount).to.equal(1)
    })
})

describe('business customers list', () => {
    let centsCustomer;
    let business;
    let customerNames = []
    let customerPhoneNumbers = []
    let customerEmails = []
    let queryParams = {}
    const customersData = [
        {
            firstName: 'ram',
            lastName: 'test',
            phoneNumber: '1212121212',
            email: 'ram@gmail.com'
        },
        {
            firstName: 'ravi',
            lastName: 'abcd',
            phoneNumber: '2323232323',
            email: 'ravi@gmail.com'
        }
    ]
    beforeEach(async () => {
        try {
            business = await createLaundromatBusiness()
            queryParams = {}
            queryParams.businessId = business.id;
            const result = await Promise.all(
                customersData.map((customer) => {
                    return createCustomer(business.id, customer) 
                })
            )
            await fetchAndReindexBusinessCustomers()
        } catch (error) {
            console.log('error in before each hook of business customers list', error)
        }
    })

    it('should return the list of customers of the business', async () => {
        const customerSearchService = new CustomerSearchService(queryParams)
        const {data, totalCount} = await customerSearchService.businessCustomersList()
        expect(totalCount).to.equal(2)
    })
    
    it('should return one customer based on the full search by name', async () => {
        queryParams.field = 'name'
        queryParams.keyword = 'ram test'
        const customerSearchService = new CustomerSearchService(queryParams)
        const {data, totalCount} = await customerSearchService.businessCustomersList()
        expect(totalCount).to.equal(1)
    })

    it('should return one customer based on the partial search by name', async () => {
        queryParams.field = 'name'
        queryParams.keyword = 'ra'
        const customerSearchService = new CustomerSearchService(queryParams)
        const {data, totalCount} = await customerSearchService.businessCustomersList()
        expect(totalCount).to.equal(2)
    })

    it('should return one customer based on the search by phoneNumber', async () => {
        queryParams.field = 'phoneNumber'
        queryParams.keyword = '1212121212'
        const customerSearchService = new CustomerSearchService(queryParams)
        const {data, totalCount} = await customerSearchService.businessCustomersList()
        expect(totalCount).to.equal(1)
    })

    it('should return one customer based on the partial search by phoneNumber', async () => {
        queryParams.field = 'phoneNumber'
        queryParams.keyword = '2323'
        const customerSearchService = new CustomerSearchService(queryParams)
        const {data, totalCount} = await customerSearchService.businessCustomersList()
        expect(totalCount).to.equal(1)
    })

    it('should return one customer based on the search by email', async () => {
        queryParams.field = 'email'
        queryParams.keyword = 'ram@gmail.com'
        const customerSearchService = new CustomerSearchService(queryParams)
        const {data, totalCount} = await customerSearchService.businessCustomersList()
        expect(totalCount).to.equal(1)
    })

    it('should return a data of length 1 when limit is 2', async () => {
        queryParams.limit = 1
        const customerSearchService = new CustomerSearchService(queryParams)
        const {data, totalCount} = await customerSearchService.businessCustomersList();
        expect(data).to.be.of.length(1)
        expect(totalCount).to.equal(2)
    })

    it('should return a data of length 1 when limit is 1 and page is 2', async () => {
        queryParams.limit = 1
        queryParams.page = 2
        const customerSearchService = new CustomerSearchService(queryParams)
        const {data, totalCount} = await customerSearchService.businessCustomersList();
        expect(data).to.be.of.length(1)
        expect(totalCount).to.equal(2)
    })

    it('should return customer of another store in stores under the same business', async () => {
        const store = await createStore(business.id)
        const customer = await createCentsCustomer({
            firstName: 'john',
            lastName: 'cents',
            phoneNumber: '3434343434',
            email: 'john@cents.com'
        })
        // const businessCustomer = await createBusinessCustomer(business.id, customer.id)           
        const storeCustomer = await createStoreCustomer(
            customer, store.id, business.id
        )
        await fetchAndReindexBusinessCustomers()
        const customerSearchService = new CustomerSearchService(queryParams)
        const {data, totalCount} = await customerSearchService.businessCustomersList();
        expect(data).to.be.of.length(3)
        expect(totalCount).to.equal(3)
    })

    describe('customer part of multiple businesses', () => {
        let centsCustomer;
        queryParams.page = 1
        queryParams.limit = 5
        let otherBusinessIds = []
        beforeEach(async () => {
            centsCustomer = await createCentsCustomer(defaultCustomerData)
            const otherStores = await createMultipleBusinessCustomers(centsCustomer)
            await fetchAndReindexBusinessCustomers()
            otherBusinessIds = otherStores.map((store) => store.businessId)
        })

        it('should return the customer in another business as well', async () => {
            queryParams.businessId = otherBusinessIds[0]
            const customerSearchService = new CustomerSearchService(queryParams)
            const {data, totalCount} = await customerSearchService.businessCustomersList()
            expect(totalCount).to.equal(1)
        })
    })


    // multiple customers in the business

    // multiple storeCustomers for cents customer of one business

    // multiple cents customer with multiple store customers in multiple businesses
})