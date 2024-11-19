const { transaction } = require('objection');
const eventEmitter = require('../../../config/eventEmitter');
const CentsCustomer = require('../../../models/centsCustomer');
const StoreCustomer = require('../../../models/storeCustomer');

function splitFullName(fullName) {
    const name = fullName.split(' ');
    const firstName = name[0];
    const lastName = name.slice(1).join(' ');
    return { firstName, lastName };
}

async function addSecondaryDetails(req, res, next) {
    let trx = null;
    try {
        const { userId } = req.body;
        const paramDbFieldMapping = {
            boFullName: 'fullName',
            boEmail: 'email',
            boPhoneNumber: 'phoneNumber',
            language: 'languageId',
        };
        // update existing record
        trx = await transaction.start(CentsCustomer.knex());
        let storeCustomers;
        if (req.body.field === 'boFullName') {
            const { firstName, lastName } = splitFullName(req.body.value);
            await CentsCustomer.query(trx)
                .patch({
                    firstName,
                    lastName,
                })
                .findById(userId);
            storeCustomers = await StoreCustomer.query()
                .patch({
                    firstName,
                    lastName,
                })
                .where({
                    centsCustomerId: userId,
                })
                .returning('*');
        } else {
            await CentsCustomer.query(trx)
                .patch({
                    [paramDbFieldMapping[req.body.field]]: req.body.value,
                })
                .findById(userId);
            storeCustomers = await StoreCustomer.query(trx)
                .patch({
                    [paramDbFieldMapping[req.body.field]]: req.body.value,
                })
                .where({
                    centsCustomerId: userId,
                })
                .returning('*');
        }
        await trx.commit();
        storeCustomers.map((customer) => eventEmitter.emit('indexCustomer', customer.id));
        res.status(200).json({
            success: true,
        });
    } catch (error) {
        if (trx) {
            await trx.rollback();
        }
        next(error);
    }
}

module.exports = exports = addSecondaryDetails;
