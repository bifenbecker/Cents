const { WebClient } = require('@slack/web-api');
const LoggerHandler = require('../../LoggerHandler/LoggerHandler');

const web = new WebClient(process.env.SLACK_TOKEN);

/**
 * Send a Slack message to the Cents workspace that notifies the team of new DoorDash orders
 *
 * @param {Object} job
 * @param {void} done
 */
async function doorDashOrderSubmittedNotification(job, done) {
    try {
        const { data } = job;
        const { orderDelivery } = data;
        await web.chat.postMessage({
            channel: '#doordash-order-alerts',
            text: `A new DoorDash order has been placed!
          The customer is: ${orderDelivery.customerName} and the total cost is $${Number(
                orderDelivery.totalDeliveryCost + orderDelivery.courierTip,
            )}.
          Follow the order here: ${orderDelivery.trackingUrl}.
          `,
        });
        LoggerHandler('info', 'Slack message triggered successfully::::::');
        done();
    } catch (error) {
        LoggerHandler('error', error, {
            manualMessage: 'Error occurred while sending the slack message.',
            job,
        });
        done(error);
    }
}

module.exports = exports = doorDashOrderSubmittedNotification;
