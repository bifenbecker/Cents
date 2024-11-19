require('../../../testHelper');
const sinon = require('sinon');
const Joi = require('@hapi/joi');
const {
    createMiddlewareMockedArgs,
} = require('../../../support/mockers/createMiddlewareMockedArgs');
const { expect } = require('../../../support/chaiHelper');
const validateRequest = require('../../../../validations/liveLink/nearbyStores');

describe('test validateRequest', () => {
    describe('should call next()', () => {
        it('when validation is passed', () => {
            const req = {
                query: {
                    businessId: 1,
                    googlePlacesId: 'googlePlacesId',
                    timeZone: 'timeZone',
                    lat: 1,
                    lng: 1,
                    zipCode: 2001,
                },
            };
            const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs(req);
            const joiSpy = sinon.spy(Joi, 'validate');
            const schema = [
                {
                    key: 'businessId',
                    type: 'number',
                },
                {
                    key: 'googlePlacesId',
                    type: 'string',
                },
                {
                    key: 'timeZone',
                    type: 'string',
                },
                {
                    key: 'lat',
                    type: 'number',
                },
                {
                    key: 'lng',
                    type: 'number',
                },
                {
                    key: 'zipCode',
                    type: 'number',
                },
                {
                    key: 'type',
                    type: 'string',
                },
            ];

            // call validator
            validateRequest(mockedReq, mockedRes, mockedNext);

            // assert
            expect(mockedNext.called, 'should call next()').to.be.true;
            expect(mockedNext.getCall(0).args, 'should call next() without error in args').to.be.an(
                'array',
            ).that.is.empty;
            expect(
                joiSpy.getCall(0).args[1]._inner.children.map((item) => ({
                    key: item.key,
                    type: item.schema._type,
                })),
                'should have valid schema',
            ).deep.equal(schema);
        });
    });

    describe('should response', () => {
        it('error when validation is not passed', () => {
            const req = {
                query: {},
            };
            const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs(req);

            // call validator
            validateRequest(mockedReq, mockedRes, mockedNext);

            // assert
            expect(mockedRes.status.calledWith(422)).to.be.true;
            expect(mockedRes.json.getCall(0).args[0]).to.have.property(
                'error',
                'Business Id greater than 0 is required.',
            );
            expect(mockedNext.called, 'should call next()').to.be.false;
        });
    });

    describe('should call next(error)', () => {
        it('with unprovided error', () => {
            const errorMessage = 'Unprovided error!';
            const req = {
                query: {},
            };
            const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs(req);
            sinon.stub(Joi, 'validate').throws(new Error(errorMessage));

            // call validator
            validateRequest(mockedReq, mockedRes, mockedNext);

            // assert
            expect(mockedNext.called, 'should call next(error)').to.be.true;
            expect(mockedNext.getCall(0).args[0].message).equals(errorMessage);
        });
    });
});
