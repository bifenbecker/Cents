const sinon = require('sinon');

require('../../../testHelper');
const { expect } = require('../../../support/chaiHelper');
const twilio = require('../../../../services/sms/twilio');

const { send, sendScheduledText } = require('../../../../services/sms/twilioSmsService');

const twilioScheduledSmsResponse = {
    account_sid: 'ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
    api_version: '2010-04-01',
    body: 'This is a scheduled message',
    date_created: 'Mon, 29 Nov 2021 22:40:10 +0000',
    date_sent: null,
    date_updated: 'Mon, 29 Nov 2021 22:40:10 +0000',
    direction: 'outbound-api',
    error_code: null,
    error_message: null,
    from: null,
    messaging_service_sid: 'MGXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
    num_media: '0',
    num_segments: '0',
    price: null,
    price_unit: null,
    sid: 'SMXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
    status: 'scheduled',
    subresource_uris: {
        media: '/2010-04-01/Accounts/ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX/Messages/SMXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX/Media.json',
    },
    to: '+15558675310',
    uri: '/2010-04-01/Accounts/ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX/Messages/SMXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX.json',
};

const twilioSmsResponse = {
  account_sid: 'ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
  api_version: '2010-04-01',
  body: 'Hi there',
  date_created: 'Thu, 30 Jul 2015 20:12:31 +0000',
  date_sent: 'Thu, 30 Jul 2015 20:12:33 +0000',
  date_updated: 'Thu, 30 Jul 2015 20:12:33 +0000',
  direction: 'outbound-api',
  error_code: null,
  error_message: null,
  from: "+15017122661",
  messaging_service_sid: 'MGXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
  num_media: '0',
  num_segments: "1",
  price: null,
  price_unit: null,
  sid: 'SMXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
  'status': 'sent',
  subresource_uris: {
    media: '/2010-04-01/Accounts/ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX/Messages/SMXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX/Media.json'
  },
  to: '+15558675310',
  uri: '/2010-04-01/Accounts/ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX/Messages/SMXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX.json'
};

describe('test twilioSmsService', async () => {
    describe('test the sendScheduledText function', async () => {
        it('should send a mocked scheduled SMS', async () => {
            const payload = {
                message: 'pierre is my son',
                phoneNumber: '+15555555555',
                dateScheduled: 'this is a date',
            };
            const twilioBody = {
                body: payload.message,
                from: process.env.TWILIO_MESSAGING_SERVICE_SID,
                to: payload.phoneNumber,
                scheduleType: 'fixed',
                sendAt: payload.dateScheduled,
            };
            sinon.stub(twilio.messages, 'create').withArgs(twilioBody).returns(twilioScheduledSmsResponse);
            const sms = await sendScheduledText(
                payload.phoneNumber,
                payload.message,
                payload.dateScheduled,
            );
            expect(sms).to.deep.equal(twilioScheduledSmsResponse);
        });
    });

    describe('test the send function', async () => {
        it('should send a mocked SMS', async () => {
            const payload = {
                message: 'pierre is my son',
                phoneNumber: '+15555555555',
            };
            const twilioBody = {
                body: payload.message,
                from: process.env.TWILIO_phoneNumber,
                to: payload.phoneNumber,
            };
            sinon.stub(twilio.messages, 'create').withArgs(twilioBody).returns(twilioSmsResponse);
            const sms = await send(
                payload.phoneNumber,
                payload.message,
            );
            expect(sms).to.deep.equal(twilioSmsResponse);
        });
    });
});
