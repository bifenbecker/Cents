const sinon = require('sinon');
const { expect } = require('../chaiHelper');

const createMiddlewareMockedArgs = (initialReq = {}, initialRes = {}) => {
    const mockedReq = {
        ...initialReq,
    };
    const mockedRes = { ...initialRes };
    mockedRes.status = sinon.stub().returns(mockedRes);
    mockedRes.json = sinon.stub().returns(mockedRes);
    const mockedNext = sinon.spy();

    const expectedNextCall = (assertExpectedError) => {
        const isErrorCall = typeof assertExpectedError === 'function';

        expect(mockedNext.called, `should call next(${isErrorCall ? 'error' : ''})`).to.be.true;
        expect(mockedRes.json.called, `should not call json on response object`).to.be.false;
        expect(mockedRes.status.called, `should not call status on response object`).to.be.false;

        const nextArgs = mockedNext.getCall(0).args;
        if(isErrorCall) {
            expect(nextArgs).to.be.have.property('length', 1);
            assertExpectedError(nextArgs[0])
        } else {
            expect(nextArgs).to.be.have.property('length', 0);
        }
    };

    const expectedResponseCall = (expectedStatus, assertExpectedJson) => {
        expect(mockedNext.called, `should NOT call next()`).to.be.false;

        expect(mockedRes.status.called, `should call res.status(${expectedStatus})`).to.be.true;
        expect(mockedRes.status.getCall(0).args[0]).to.be.equal(expectedStatus);

        expect(mockedRes.json.called, `should call res.json(...)`).to.be.true;
        const jsonArgs = mockedRes.json.getCall(0).args;
        expect(jsonArgs).to.be.have.property('length', 1);
        assertExpectedJson(jsonArgs[0]);
    };

    return { mockedNext, mockedRes, mockedReq, expectedNextCall, expectedResponseCall };
};

module.exports = {
    createMiddlewareMockedArgs,
};