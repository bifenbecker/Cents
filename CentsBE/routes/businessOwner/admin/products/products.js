const { transaction, raw } = require('objection');
const _ = require('lodash');
const Inventory = require('../../../../models/inventory');
const ProductCategory = require('../../../../models/inventoryCategory');
const InventoryItem = require('../../../../models/inventoryItem');
const getBusiness = require('../../../../utils/getBusiness');
const { productFields } = require('../../../../constants/constants');
const getProductQuery = require('./getProduct');

// pipelines
const updateProductPipeline = require('../../../../pipeline/products/updateProductPipeline');
const LoggerHandler = require('../../../../LoggerHandler/LoggerHandler');

const apiEndPoints = {
    getProducts: async (req, res, next) => {
        try {
            const business = await getBusiness(req);
            if (!business) {
                const errMsg = 'Invalid request. Could not find the provided business';
                LoggerHandler('error', errMsg, req);
                return res.status(400).json({
                    error: errMsg,
                });
            }
            const { offset, withoutCategory, withArchived } = req.query;
            const categoryCheck = withoutCategory === 'true';
            const archivedCheck = withArchived === 'true';
            let products = ProductCategory.query()
                .select(
                    `inventoryCategories.id as ${categoryCheck ? 'categoryId' : 'id'}`,
                    'inventoryCategories.name as categoryName',
                    'inventory.id as inventoryId',
                    'inventory.productName',
                    'inventory.createdAt',
                    'inventory.description',
                    'inventory.productImage',
                    'inventory.sku',
                    'inventory.isDeleted',
                    'inventory.deletedAt',
                    raw(
                        `array_agg(distinct(coalesce("inventoryItems".price, 0))) as prices,
                        count(inventory.id) over() as "totalRecords"`,
                    ),
                )
                .join('inventory', 'inventory.categoryId', 'inventoryCategories.id')
                .leftJoin(
                    raw(
                        `(select * from "inventoryItems"${
                            !archivedCheck ? ' where "deletedAt" is null' : ''
                        }) as "inventoryItems"`,
                    ),
                    'inventoryItems.inventoryId',
                    'inventory.id',
                )
                .where({
                    'inventoryCategories.businessId': business.id,
                })
                .modify((queryBuilder) => {
                    if (!archivedCheck) {
                        queryBuilder.andWhere('inventoryCategories.deletedAt', null);
                        queryBuilder.andWhere('inventoryItems.deletedAt', null);
                        queryBuilder.andWhere('inventoryItems.isDeleted', false);
                        queryBuilder.andWhere('inventory.deletedAt', null);
                        queryBuilder.andWhere('inventory.isDeleted', false);
                    }
                })
                .groupBy('inventoryCategories.id', 'inventory.id');
            products = offset ? products.limit(20).offset((Number(offset) - 1) * 20) : products;
            products = await products;
            if (categoryCheck) {
                return res.status(200).json({
                    success: true,
                    products,
                });
            }
            const resp = {};
            const totalRecords = products.length ? products[0].totalRecords : 0;
            // map response to nested structure.
            for (const product of products) {
                const temp = {
                    sku: product.sku,
                    id: product.inventoryId,
                    productName: product.productName,
                    description: product.description,
                    productImage: product.productImage,
                    createdAt: product.createdAt,
                    price: product.prices,
                    isDeleted: product.isDeleted,
                };
                if (resp[product.id]) {
                    resp[product.id].inventory.push(temp);
                } else {
                    resp[product.id] = {
                        id: product.id,
                        name: product.categoryName,
                        inventory: [temp],
                    };
                }
            }
            return res.status(200).json({
                totalRecords,
                categories: Object.values(resp),
            });
        } catch (error) {
            return next(error);
        }
    },
    bulkUpdate: async (req, res, next) => {
        let trx = null;
        try {
            const business = await getBusiness(req);
            const { inventoryItemIds, price } = req.body;
            trx = await transaction.start(InventoryItem.knex());
            if (!business) {
                const errMsg = 'Invalid request. Could not find the provided business';
                LoggerHandler('error', errMsg, req);
                return res.status(400).json({
                    error: errMsg,
                });
            }
            await Promise.all(
                inventoryItemIds.map(async (id) => {
                    await InventoryItem.query(trx)
                        .patch({
                            price: price.storePrice,
                            isTaxable: price.isTaxable,
                            updatedAt: new Date().toISOString,
                        })
                        .findById(id);
                }),
            );
            await trx.commit();
            return res.status(200).json({
                success: true,
            });
        } catch (error) {
            if (trx) {
                await trx.rollback();
            }
            return next(error);
        }
    },
    saveProducts: async (req, res, next) => {
        let trx = null;
        try {
            const business = await getBusiness(req);
            const { body } = req;
            trx = await transaction.start(Inventory.knex());
            if (!business) {
                const errMsg = 'Invalid request. Could not find the provided business';
                LoggerHandler('error', errMsg, req);
                return res.status(400).json({
                    error: errMsg,
                });
            }
            const data = {
                categoryId: body.categoryId,
                description: body.description.trim() || null,
                price: body.price || null,
                productName: body.productName.trim(),
                sku: body.sku || null,
                isDeleted: false,
            };
            // by default Price and quantity for all the locations
            data.inventoryItems = body.inventoryItems.map((a) => ({
                storeId: a.storeId,
                price: a.price,
                isTaxable: a.isTaxable,
                quantity: a.quantity,
                isDeleted: false,
                isFeatured: a.isFeatured,
            }));
            const product = await Inventory.query(trx).insertGraphAndFetch(data);
            await trx.commit();
            return res.status(200).json({
                success: true,
                product,
            });
        } catch (error) {
            if (trx) {
                await trx.rollback();
            }
            return next(error);
        }
    },
    // updating the product prices on location wise
    updateProductPrice: async (req, res, next) => {
        try {
            const business = await getBusiness(req);
            const { field, value } = req.body;
            const payload = {
                inventoryItemId: req.constants.id,
                field,
                value,
                businessId: business.id,
            };

            const output = await updateProductPipeline(payload);
            const { updatedProduct } = output;

            return res.status(200).json({
                success: true,
                record: updatedProduct,
            });
        } catch (error) {
            return next(error);
        }
    },
    // get single product details with inventoryItems
    getProduct: async (req, res, next) => {
        try {
            const { id } = req.params;
            const business = await getBusiness(req);
            if (!business) {
                const errMsg = 'Invalid request. Could not find the provided business';
                LoggerHandler('error', errMsg, req);
                return res.status(400).json({
                    error: errMsg,
                });
            }
            if (!Number(id)) {
                const errMsg = 'productId of type number is required.';
                LoggerHandler('error', errMsg, req);
                return res.status(422).json({
                    error: errMsg,
                });
            }
            const product = await getProductQuery(id);
            const prices = [];
            product[0].inventoryItems.map((item) => prices.push(item.price));
            const numOfUniquePrices = new Set(prices).size;
            const allEqual = (arr) => arr.every((v) => v === arr[0]);
            const singlePrice = [...new Set(prices)];
            const unique = allEqual(prices);
            product[0].price = unique ? singlePrice[0] : `${numOfUniquePrices} prices`;
            return res.status(200).json({
                ...product[0],
            });
        } catch (error) {
            return next(error);
        }
    },
    updateProducts: async (req, res, next) => {
        let trx = null;
        try {
            // soft delete the current record.
            // soft delete all the related records.
            // map the soft deleted records
            // use insertWithRelated to add the new records.
            if (!req.body.id || !req.body.field || _.isNil(req.body.value)) {
                const errMsg = 'Bad Request,id, field and value are required';
                LoggerHandler('error', errMsg, req);
                return res.status(400).json({
                    error: errMsg,
                });
            }
            if (!Object.values(productFields).includes(req.body.field)) {
                const errMsg = 'Invalid field name';
                LoggerHandler('error', errMsg, req);
                return res.status(400).json({
                    error: errMsg,
                });
            }
            const { field, value } = req.body;
            trx = await transaction.start(Inventory.knex());
            // soft delete the existing record.
            const deletedProduct = await Inventory.query(trx)
                .patch({
                    isDeleted: true,
                    deletedAt: new Date().toISOString(),
                })
                .findById(req.body.id)
                .returning(
                    'categoryId',
                    'description',
                    'productName',
                    'price',
                    'sku',
                    'quantity',
                    'productImage',
                );
            const deletedPrices = await InventoryItem.query(trx)
                .patch({
                    isDeleted: true,
                    deletedAt: new Date().toISOString(),
                })
                .where({
                    inventoryId: req.body.id,
                    deletedAt: null,
                })
                .returning('storeId', 'inventoryId', 'quantity', 'isFeatured', 'price');
            const insertData = {
                ...deletedProduct,
                [field]: value,
                inventoryItems: deletedPrices,
            };
            const insertedData = await Inventory.query(trx).insertGraphAndFetch(insertData);
            await trx.commit();
            return res.status(200).json({
                success: true,
                product: {
                    ...insertedData,
                    prevId: req.body.id,
                },
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
