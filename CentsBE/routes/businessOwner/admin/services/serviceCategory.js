const { transaction } = require('objection');

const ServiceCategories = require('../../../../models/serviceCategories');

const getBusiness = require('../../../../utils/getBusiness');

const apiEnpoints = {
    getCategories: async (req, resp, next) => {
        try {
            const business = await getBusiness(req);
            if (!business) {
                return resp.status(400).json({
                    error: 'Invalid request. No business exists',
                });
            }
            const newSevices = [
                {
                    category: 'PER_POUND',
                    businessId: business.id,
                    imageUrl: null,
                    deletedAt: null,
                },
                {
                    category: 'FIXED_PRICE',
                    businessId: business.id,
                    imageUrl: null,
                    deletedAt: null,
                },
            ];
            const serviceCategories = await ServiceCategories.query()
                .where('businessId', business.id)
                .where('deletedAt', null)
                .whereNot('serviceCategories.category', 'DELIVERY');
            let finalResult = [];
            let newRecord = [];
            if (serviceCategories.length) {
                const Name = serviceCategories.map((serviceCategory) => serviceCategory.category);
                newRecord = ['PER_POUND', 'FIXED_PRICE'].map((item) => {
                    if (!Name.includes(item)) {
                        return ServiceCategories.query().insert({
                            category: item,
                            businessId: business.id,
                            imageUrl: null,
                            deletedAt: null,
                        });
                    }
                    return null;
                });
            } else {
                newRecord = newSevices.map((item) =>
                    ServiceCategories.query().insert({
                        category: item.category,
                        businessId: item.businessId,
                        imageUrl: item.imageUrl,
                        deletedAt: item.deletedAt,
                    }),
                );
            }
            finalResult = await Promise.all(newRecord);
            finalResult = finalResult.concat(serviceCategories);
            finalResult = finalResult.filter((ele) => ele);
            return resp.json({
                categories: finalResult,
            });
        } catch (error) {
            return next(error);
        }
    },
    saveCategory: async (req, resp, next) => {
        try {
            const business = await getBusiness(req);
            const { body } = req;
            const trx = await transaction.start(ServiceCategories.knex());
            if (!business) {
                return resp.status(400).json({
                    error: 'Invalid request. No business exists',
                });
            }
            let serviceCategory;
            const data = {
                businessId: business.id,
                category: body.category,
                imageUrl: body.imageUrl || null,
            };
            if (body.id) {
                data.updatedAt = new Date();
                serviceCategory = await ServiceCategories.query(trx)
                    .patch(data)
                    .findById(body.id)
                    .where('deletedAt', null)
                    .returning('*');
            } else {
                serviceCategory = await ServiceCategories.query(trx).insert(data).returning('*');
            }
            await trx.commit();

            return resp.status(200).json({
                success: true,
                serviceCategory,
            });
        } catch (error) {
            return next(error);
        }
    },
    removeCategory: async (req, resp, next) => {
        try {
            const business = await getBusiness(req);
            const { body } = req;
            const trx = await transaction.start(ServiceCategories.knex());
            if (!business) {
                return resp.status(400).json({
                    error: 'Invalid request. No business exists',
                });
            }
            const serviceCategory = await ServiceCategories.query(trx)
                .patch({
                    deletedAt: new Date(),
                })
                .where('businessId', business.id)
                .where('deletedAt', null)
                .where('id', body.id);
            await trx.commit();
            return resp.status(200).json({
                success: true,
                deleted: serviceCategory,
            });
        } catch (error) {
            return next(error);
        }
    },
};
module.exports = apiEnpoints;
