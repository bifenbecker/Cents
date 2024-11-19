/* eslint-disable */

// Need to disable eslint in this file as static variable not recognize
const config = require('./config');
const Rascal = require('rascal');

const Strategy = require('../integrations/rabbit_mq/Operations');
const LoggerHandler = require('../LoggerHandler/LoggerHandler');
class MessageBroker {
    static instance = null;
    static sub_queue = 'cents_sub';
    static pub_queue = 'cents_pub';

    static async GetInstance() {
        if (!MessageBroker.instance) {
            MessageBroker.instance = await Rascal.BrokerAsPromised.create(config);
            MessageBroker.instance.on('error', (err) => {
                LoggerHandler(
                    'info', 
                    `
                    ************************************************************************\n
                    *                            Connection Error                          *\n
                    ************************************************************************\n\n
                    ${err}
                    `
                )
            });
        }

        return MessageBroker.instance;
    }

    static async publish(message) {
        const { RABBITMQ_URL } = process.env;
        if (!RABBITMQ_URL) {
            return;
        }
        await MessageBroker.instance.publish(MessageBroker.pub_queue, JSON.stringify(message), '#');
    }

    static async subscribe(on_message) {
        const subscription = await MessageBroker.instance.subscribe(MessageBroker.sub_queue);
        subscription
            .on('message', async (message, content, ackOrNack) => {
                try {
                    LoggerHandler('info', content);
                    await new Strategy(content).perform();
                } catch (error) {
                    LoggerHandler('error', `Error occurred while handling mqtt server: \n\n${error}\n\n${content}`);
                }
                ackOrNack();
            })
            .on('error', (err) => {
                LoggerHandler('error', `Error while subscribing: \n\n${err}`);
            })
            .on('invalid_content', (err, message, ackOrNack) => {
                LoggerHandler('error', `Invalid content: ${err}\n\nMessage Content: ${message}`);
                ackOrNack(err);
            });
    }
}

module.exports = exports = MessageBroker;
