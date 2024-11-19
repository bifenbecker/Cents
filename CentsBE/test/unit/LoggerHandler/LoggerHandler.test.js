require('../../testHelper');
const sinon = require('sinon');
const logger = require('../../../lib/logger');
const { expect } = require('../../support/chaiHelper');
const LoggerHandler = require('../../../LoggerHandler/LoggerHandler');

describe('test LoggerHandler', () => {
    const req = {
        body: {
            password: 'secret info',
            value1: 'mister',
            value2: 'test',
        },
    };
    const expectedBody = {
        password: '*#REDACTED#*',
        value1: 'mister',
        value2: 'test',
    };

    it('should create info message', async () => {
        const type = 'info';
        const msg = 'some info message';
        const spy = sinon.spy(logger, "info");
        expect(LoggerHandler(type, msg, req)).not.to.eq(null);
        expect(spy.lastCall.args[0]).contains(expectedBody.password);
        expect(spy.lastCall.args[0]).contains(expectedBody.value1);
        expect(spy.lastCall.args[0]).contains(expectedBody.value2);
        expect(spy.lastCall.args[0]).contains(msg);
    });

    it('should create error message', async () => {
        const type = 'error';
        const msg = 'some error message';
        const spy = sinon.spy(logger, "error");
        expect(LoggerHandler(type, msg, req)).not.to.eq(null);
        expect(spy.lastCall.args[0]).contains(expectedBody.password);
        expect(spy.lastCall.args[0]).contains(expectedBody.value1);
        expect(spy.lastCall.args[0]).contains(expectedBody.value2);
        expect(spy.lastCall.args[0]).contains(msg);
    });

    it('should create debug message', async () => {
        const type = 'debug';
        const msg = 'some debug message';
        const spy = sinon.spy(logger, "debug");
        expect(LoggerHandler(type, msg, req)).not.to.eq(null);
        expect(spy.lastCall.args[0]).contains(expectedBody.password);
        expect(spy.lastCall.args[0]).contains(expectedBody.value1);
        expect(spy.lastCall.args[0]).contains(expectedBody.value2);
        expect(spy.lastCall.args[0]).contains(msg);
    });

    it('should return null if type is wrong', async () => {
        const type = 'wrong';
        const msg = 'some message';
        expect(LoggerHandler(type, msg, req)).to.eq(null);
    });
});
