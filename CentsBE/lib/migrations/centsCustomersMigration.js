const User = require('../../models/user');
const UserRoles = require('../../models/userRoles');
const CentsCustomer = require('../../models/centsCustomer');
const LoggerHandler = require('../../LoggerHandler/LoggerHandler');

const getCentsCustomer = async (user, trx) => {
    const customer = {};
    customer.firstName = user.firstname;
    customer.lastName = user.lastname;
    customer.email = user.email;
    customer.password = user.password;
    customer.phoneNumber = user.phone;
    customer.resetPasswordToken = user.resetPasswordToken;
    customer.passwordResetDate = user.passwordResetDate;
    customer.languageId = user.languageId;
    customer.isDeleted = !user.isActive;
    customer.deletedAt = null;
    customer.createdAt = user.createdAt;
    customer.updatedAt = user.updatedAt;
    let customerList;

    if (customer.phoneNumber) {
        customerList = await CentsCustomer.query().where('phoneNumber', customer.phoneNumber);
    } else if (customer.email) {
        customerList = await CentsCustomer.query().where('email', customer.email);
    } else {
        customerList = await CentsCustomer.query()
            .where('email', customer.email)
            .where('firstName', customer.firstName)
            .where('lastName', customer.lastName);
    }

    if (customerList.length) {
        return null;
    }
    await CentsCustomer.query().insert(customer);
    return customer;
};

const getCustomersList = async (usersList, trx) => {
    if (!usersList.length) {
        return [];
    }
    let centsCustomers = [];

    await usersList.reduce(async (acc, currentVal) => {
        await acc;
        await getCentsCustomer(currentVal, trx);
    }, Promise.resolve());

    return Promise.all(centsCustomers);
};
const migrateCentsCustomers = async (options) => {
    try {
        const usersList = await User.query(options.trx)
            .limit(options.noOfRowsToProcess)
            .offset(options.noOfRowsProcessed)
            .whereIn(
                'id',
                UserRoles.query()
                    .select(`${UserRoles.tableName}.userId`)
                    .where(`${UserRoles.tableName}.roleId`, 6),
            )
            .orderBy(`${User.tableName}.id`, 'desc');
        let centsCustomers = await getCustomersList(usersList, options.trx);
        if (usersList.length > 0) {
            return migrateCentsCustomers({
                ...options,
                noOfRowsProcessed: options.noOfRowsProcessed + usersList.length,
            });
        }
        return null;
    } catch (err) {
        LoggerHandler('error', err);
        return null;
    }
};

module.exports.migrateCentsCustomers = migrateCentsCustomers;
