require('../../../../testHelper');
const { transaction } = require('objection');
const sinon = require('sinon');
const ChaiHttpRequestHepler = require('../../../../support/chaiHttpRequestHelper');
const { generateLiveLinkCustomerToken } = require('../../../../support/apiTestHelper');
const factory = require('../../../../factories');
const { expect } = require('../../../../support/chaiHelper');
const StoreCustomer = require('../../../../../models/storeCustomer');

describe('test updateCustomerNotes API', () => {
    const apiEndpoint = '/api/v1/live-status/customer/notes';
    describe('when auth token validation fails', () => {
        it('should respond with a 401 code when token is empty', async () => {
            const res = await ChaiHttpRequestHepler.patch(`${apiEndpoint}/100/update`, {}, {});
            res.should.have.status(401);
        });

        it('should respond with a 404 when customerauthtoken is invalid', async () => {
            const token = generateLiveLinkCustomerToken({ id: 100 });
            const res = await ChaiHttpRequestHepler.patch(`${apiEndpoint}/100/update`, {}, {}).set(
                'customerauthtoken',
                token,
            );
            res.should.have.status(404);
        });
    });

    describe('when auth token is valid', () => {
        let token;
        let centsCustomer;
        let storeCustomer;

        beforeEach(async () => {
            centsCustomer = await factory.create('centsCustomer');
            storeCustomer = await factory.create('storeCustomer', { centsCustomerId: centsCustomer.id });
            token = generateLiveLinkCustomerToken({ id: centsCustomer.id });
        });

        describe('when payload is invalid', () => {
            it('should respond with a 422 code when a property is not expected', async () => {
                const body = {
                    isHangDrySelected: 'here are my notes',
                    notes: 'notes',
                    hangDryInstructions: 'instructions',
                };
                const res = await ChaiHttpRequestHepler.patch(
                    `${apiEndpoint}/${storeCustomer.id}/update`,
                    {},
                    body,
                ).set('customerauthtoken', token);

                res.should.have.status(422);
            });

            it('should respond with a 422 code when a property is not provided', async () => {
                const body = {
                    notes: 'here are my notes alone',
                };
                const res = await ChaiHttpRequestHepler.patch(
                    `${apiEndpoint}/${storeCustomer.id}/update`,
                    {},
                    body,
                ).set('customerauthtoken', token);

                res.should.have.status(422);
            });
        });

        describe('when payload is valid', () => {
            it('should update notes and hang dry selections successfully when all values are provided', async () => {
                const body = {
                    notes: 'here are my notes',
                    isHangDrySelected: true,
                    hangDryInstructions: 'here are my hang dry instructions'
                };
                const res = await ChaiHttpRequestHepler.patch(
                    `${apiEndpoint}/${storeCustomer.id}/update`,
                    {},
                    body,
                ).set('customerauthtoken', token);

                res.should.have.status(200);

                const storeCustomerAfterUpdate = await StoreCustomer.query().findById(storeCustomer.id);

                expect(res.body.customer.notes).to.deep.equal(storeCustomerAfterUpdate.notes);
                expect(res.body.customer.isHangDrySelected).to.deep.equal(storeCustomerAfterUpdate.isHangDrySelected);
                expect(res.body.customer.hangDryInstructions).to.deep.equal(storeCustomerAfterUpdate.hangDryInstructions);
            });

            it('should update notes and hang dry selections successfully when all values are provided and notes are empty', async () => {
                const body = {
                    notes: '',
                    isHangDrySelected: true,
                    hangDryInstructions: 'here are my hang dry instructions'
                };
                const res = await ChaiHttpRequestHepler.patch(
                    `${apiEndpoint}/${storeCustomer.id}/update`,
                    {},
                    body,
                ).set('customerauthtoken', token);

                res.should.have.status(200);

                const storeCustomerAfterUpdate = await StoreCustomer.query().findById(storeCustomer.id);

                expect(res.body.customer.notes).to.deep.equal('');
                expect(res.body.customer.isHangDrySelected).to.deep.equal(storeCustomerAfterUpdate.isHangDrySelected);
                expect(res.body.customer.hangDryInstructions).to.deep.equal(storeCustomerAfterUpdate.hangDryInstructions);
            });

            it('should update notes and hang dry selections successfully when all values are provided and notes are empty', async () => {
                const body = {
                    notes: 'these are my notes',
                    isHangDrySelected: true,
                    hangDryInstructions: ''
                };
                const res = await ChaiHttpRequestHepler.patch(
                    `${apiEndpoint}/${storeCustomer.id}/update`,
                    {},
                    body,
                ).set('customerauthtoken', token);

                res.should.have.status(200);

                const storeCustomerAfterUpdate = await StoreCustomer.query().findById(storeCustomer.id);

                expect(res.body.customer.notes).to.deep.equal(storeCustomerAfterUpdate.notes);
                expect(res.body.customer.isHangDrySelected).to.deep.equal(storeCustomerAfterUpdate.isHangDrySelected);
                expect(res.body.customer.hangDryInstructions).to.deep.equal('');
            });

            it('should catch error when transaction.start return undefined or null', async () => {
                const body = {
                    notes: 'these are my notes',
                    isHangDrySelected: true,
                    hangDryInstructions: ''
                };

                const res = await ChaiHttpRequestHepler.patch(
                    `${apiEndpoint}/${storeCustomer.hangDryInstructions}/update`,
                    {},
                    body,
                ).set('customerauthtoken', token);

                res.should.have.status(500);
            });

            it('should catch error when transaction.start return the result', async () => {
                const errorMessage = 'Unprovided error!';
                sinon.stub(transaction, 'start').throws(new Error(errorMessage));
                
                const body = {
                    notes: 'these are my notes',
                    isHangDrySelected: true,
                    hangDryInstructions: ''
                };
                const res = await ChaiHttpRequestHepler.patch(
                    `${apiEndpoint}/${storeCustomer.hangDryInstructions}/update`,
                    {},
                    body,
                ).set('customerauthtoken', token);

                res.should.have.status(500);
            });
        });
    });
});
