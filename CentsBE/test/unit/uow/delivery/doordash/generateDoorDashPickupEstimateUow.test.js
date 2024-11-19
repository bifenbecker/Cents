require('../../../../testHelper');
const nock = require('nock');
const { cloneDeep } = require('lodash');
const { expect, assert } = require('../../../../support/chaiHelper');
const factory = require('../../../../factories');
const generateDoorDashPickupEstimate = require('../../../../../uow/delivery/doordash/generateDoorDashPickupEstimateUow');
const { toDateWithTimezone } = require('../../../../../helpers/dateFormatHelper');
const { envVariables } = require('../../../../../constants/constants');
const { FACTORIES_NAMES: FN } = require('../../../../constants/factoriesNames');

describe('test generateDoorDashPickupEstimate UoW', () => {
    const googlePlacesId = 'googlePlacesId';
    const createGooglePlacesNock = (response) => {
        const params = {
            place_id: googlePlacesId,
            fields: 'formatted_address,address_component',
            key: process.env.GOOGLE_PLACES_API_KEY,
        };

        return nock(envVariables.GOOGLE_PLACES_DETAILS_URL)
            .get('')
            .query(params)
            .reply(200, response);
    };

    afterEach(() => {
        nock.cleanAll();
    });

    describe('should return correct payload', () => {
        it('without changes', async () => {
            const googlePlacesApi = createGooglePlacesNock({
                result: {},
            });
            const payload = { googlePlacesId };
            const initialPayload = cloneDeep(payload);

            // call UoW
            const newPayloads = await generateDoorDashPickupEstimate({ googlePlacesId });

            // assert
            expect(googlePlacesApi.isDone(), 'should call Google Places API').to.be.true;
            assert.deepEqual(newPayloads, initialPayload, 'should not change payload');
        });

        it('with doorDashEstimate', async () => {
            const business = await factory.create(FN.laundromatBusiness);
            const store = await factory.create(FN.store, {
                businessId: business.id,
            });
            const googlePlacesApi = createGooglePlacesNock({
                result: { formatted_address: '111 8th Avenue, New York, NY' },
            });
            const body = {
                pickup_address: {
                    city: ' New York',
                    state: 'NY',
                    street: '111 8th Avenue',
                    unit: undefined,
                    zip_code: 10001,
                },
                dropoff_address: {
                    city: store.city,
                    state: store.state,
                    street: store.address,
                    unit: null,
                    zip_code: store.zipCode,
                },
                order_value: 3000,
                external_business_name: business.name,
                pickup_time: toDateWithTimezone(new Date(), null).set(9, 'hour').utc().format(),
            };
            const headers = {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${process.env.DOORDASH_API_KEY}`,
            };
            const doorDashResponse = { estimate: 'very fast' };
            const doorDashApi = nock(process.env.DOORDASH_API_URL, {
                reqheaders: headers,
            })
                .post('/estimates', body)
                .reply(200, doorDashResponse);

            const payload = {
                storeId: store.id,
                googlePlacesId,
                zipCode: 10001,
            };

            // call UoW
            const newPayload = await generateDoorDashPickupEstimate(payload);

            // assert
            expect(googlePlacesApi.isDone(), 'should call Google Places API').to.be.true;
            expect(doorDashApi.isDone(), 'should call DoorDash API').to.be.true;
            expect(newPayload).have.property('doorDashEstimate').to.deep.equal(doorDashResponse);
        });
    });

    it('should throw Error', async () => {
        const business = await factory.create(FN.laundromatBusiness);
        const store = await factory.create(FN.store, {
            businessId: business.id,
        });
        const googlePlacesApi = createGooglePlacesNock({
            result: { formatted_address: '111 8th Avenue, New York, NY' },
        });

        const doorDashApi = nock(process.env.DOORDASH_API_URL)
            .post('/estimates')
            .reply(500, { error: 'DoorDash error' });

        const payload = {
            storeId: store.id,
            googlePlacesId,
            zipCode: 10001,
        };
        const initialPayload = cloneDeep(payload);

        // call UoW
        const newPayloads = await generateDoorDashPickupEstimate(payload);

        // assert
        expect(googlePlacesApi.isDone(), 'should call Google Places API').to.be.true;
        expect(doorDashApi.isDone(), 'should call DoorDash API').to.be.true;
        assert.deepEqual(newPayloads, initialPayload, 'should not change payload');
    });
});
