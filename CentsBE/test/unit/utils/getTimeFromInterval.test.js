const moment = require('moment');
require('../../testHelper');
const { expect } = require('../../support/chaiHelper');
const getTimeFromInterval = require('../../../utils/getTimeFromInterval');

describe('test getTimeFromInterval', () => {
    const nowMoment = moment.utc();

    it(`should return null when startDate and endDate not passed`, async () => {
        const time = getTimeFromInterval();
        expect(time).to.be.null;
    });

    it(`interval more than day`, async () => {
        const startDate = nowMoment
            .clone()
            .subtract(2, 'days')
            .subtract(10, 'hours')
            .subtract(25, 'minutes')
            .toDate();
        const endDate = nowMoment.clone().toDate();

        const time = getTimeFromInterval(startDate, endDate);
        expect(time).to.equal(58.42);
    });

    it(`interval for the same startDate and endDate`, async () => {
        const startDate = nowMoment.clone().toDate();
        const endDate = nowMoment.clone().toDate();

        const time = getTimeFromInterval(startDate, endDate);
        expect(time).to.equal(0);
    });
});
