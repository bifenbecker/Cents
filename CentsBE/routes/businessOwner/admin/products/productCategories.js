const { transaction } = require('objection');
const LoggerHandler = require('../../../../LoggerHandler/LoggerHandler');

const InventoryCategory = require('../../../../models/inventoryCategory');

const getBusiness = require('../../../../utils/getBusiness');

const apiEndPoints = {
    getCategories: async (req, res, next) => {
        try {
            const business = await getBusiness(req);
            if (!business) {
                const errMsg = 'Invalid request. Could not find the provided business';
                LoggerHandler('error', errMsg, req);
                return res.status(400).json({
                    error: errMsg,
                });
            }
            const productCategories = await InventoryCategory.query()
                .where('businessId', business.id)
                .where('deletedAt', null);
            return res.json({
                categories: productCategories,
            });
        } catch (error) {
            return next(error);
        }
    },
    saveCategory: async (req, res, next) => {
        let trx = null;
        try {
            let errMsg;
            const business = await getBusiness(req);
            const { body } = req;
            trx = await transaction.start(InventoryCategory.knex());
            if (!business) {
                errMsg = 'Invalid request. Could not find the provided business';
                LoggerHandler('error', errMsg, req);
                return res.status(400).json({
                    error: errMsg,
                });
            }
            let productCategory;
            const data = {
                businessId: business.id,
                name: body.name.trim(),
            };
            if (body.id) {
                data.updatedAt = new Date();
                productCategory = await InventoryCategory.query(trx)
                    .patch(data)
                    .findById(body.id)
                    .where('deletedAt', null)
                    .returning('*');
            } else {
                if (req.body.name === '' || req.body.name.trim().length === 0) {
                    errMsg = 'Category name cannot be empty';
                    LoggerHandler('error', errMsg, req);
                    return res.status(400).json({
                        error: errMsg,
                    });
                }
                productCategory = await InventoryCategory.query(trx).insert(data).returning('*');
            }
            await trx.commit();

            return res.status(200).json({
                success: true,
                productCategory,
            });
        } catch (error) {
            if (trx) {
                await trx.rollback();
            }
            return next(error);
        }
    },
};

module.exports = apiEndPoints;
