require('../../testHelper');
const { expect } = require('../../support/chaiHelper');
const { formattedTime } = require('../../../utils/formattedTime');

describe('test formattedTime', () => {
    it('should return formatted time successfully', async () => {
        const date = new Date('2022-06-26T23:57:44.658Z');
        const expectedDate = '06/26/2022 11:57 PM';
        expect(formattedTime(date)).to.eq(expectedDate);
    });

    it('should return formatted time when timeZone is America/New_York', async () => {
        const date = new Date('2022-06-26T23:57:44.658Z');
        const timeZone = 'America/New_York';
        const expectedDate = '06/26/2022 07:57 PM';
        expect(formattedTime(date, timeZone)).to.eq(expectedDate);
    });

    it('should return null if date is not provided', async () => {
        expect(formattedTime()).to.eq(null);
    });
});
