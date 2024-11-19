const CentsCustomer = require('../../../models/centsCustomer');

const verifyPhone = async (req, res, next) => {
    const { phoneNumber } = req.query;

    try {
        const customer = await CentsCustomer.query()
            .where('phoneNumber', phoneNumber)
            .first('firstName', 'lastName');

        res.status(200).json({
            isVerified: !!customer,
            firstName: customer ? customer.firstName : null,
            lastName: customer ? customer.lastName : null,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = exports = verifyPhone;
