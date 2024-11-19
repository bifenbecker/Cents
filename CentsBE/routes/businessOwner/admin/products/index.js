const router = require('express').Router();
const productCategory = require('./productCategories');
const products = require('./products');

const insights = require('./insights');
const insightsValidator = require('../../../../validations/products/insights');
const updateProduct = require('./updateProduct');

// validations
const createProductValidations = require('../../../../validations/products/createProduct');
const updateProductPriceValidations = require('../../../../validations/products/updateProductPrices');
const createProductCategory = require('../../../../validations/products/createProductCategory');
const updateProductValidations = require('../../../../validations/products/updateProduct');
const bulkUpdateValidation = require('../../../../validations/products/bulkUpdateValidation');
const archiveProduct = require('./archiveProduct');

router.put('/archive/:id', archiveProduct);
router.get('/categories/list', productCategory.getCategories);
router.post('/categories/save', createProductCategory, productCategory.saveCategory);
router.get('/list', products.getProducts);
router.get('/:id', products.getProduct);
router.post('/save', createProductValidations, products.saveProducts);
router.put('/prices/update', updateProductPriceValidations, products.updateProductPrice);
router.put('/:inventoryId/prices', bulkUpdateValidation, products.bulkUpdate);
router.put('/:id', updateProductValidations, updateProduct);
router.get('/:id/insights', insightsValidator, insights);

module.exports = router;
