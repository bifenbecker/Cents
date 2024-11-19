const ServiceOrder = require('../../models/serviceOrders');
const SecondaryDetails = require('../../models/secondaryDetails');
const Language = require('../../models/language');
const smsText = require('../smsText');
const twilio = require('./index');

async function orderRating(req, res, next) {
    try {
        const { Body, From } = req.body;
        const rating = Body;
        let orderId;

        const messages = await twilio.messages.list({
            from: process.env.TWILIO_phoneNumber,
            to: From,
            limit: 10,
        });

        for (const message of messages) {
            // Check Last 10 messages which has been send to the current user
            // and find a message with #orderId
            const query = message.body.split(' ').filter((word) => word.includes('#'));
            if (query.length === 1) {
                // remove # from the orderId
                orderId = query[0].substr(1);
                break;
            }
        }

        if (typeof orderId === 'undefined') throw new Error('ORDER_DOES_NOT_EXIST');

        const order = await ServiceOrder.query().findById(orderId);
        if (typeof order === 'undefined') throw new Error('ORDER_DOES_NOT_EXIST');

        if (parseInt(rating, 10) < 1 || parseInt(rating, 10) > 5)
            throw new Error('INCORRECT_MESSAGE_FORMAT');

        const details = await SecondaryDetails.query().where('userId', order.userId).first();
        const user = await order.getUser();
        const phoneNumber = details.phoneNumber || user.phone;
        if (!From.includes(phoneNumber.replace(/[^0-9]/g, ''))) throw new Error('NOT_AUTHORIZED');

        await ServiceOrder.query().findById(order.id).patch({ rating });
        let userLanguage = await Language.query().findById(details.languageId || user.languageId);

        if (typeof userLanguage === 'undefined') {
            userLanguage = {
                language: 'english',
            };
        }
        res.send(
            `<Response><Message> ${smsText(
                order,
                user,
                userLanguage,
                { phoneNumber: null },
                'RATING_REPLY',
            )} </Message></Response>`,
        );
    } catch (error) {
        switch (error.message) {
            case 'NOT_AUTHORIZED':
                res.status(401).json({
                    error: 'You are not authorized to rate this order',
                });
                break;
            case 'INCORRECT_MESSAGE_FORMAT':
                res.status(422).json({
                    error: 'incorrect rating number',
                });
                break;
            case 'ORDER_DOES_NOT_EXIST':
                res.status(404).json({
                    error: 'OrderId is invalid',
                });
                break;
            default:
                next(error);
        }
    }
}

module.exports = exports = orderRating;
