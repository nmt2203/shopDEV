'use strict';

const express = require('express');
const productController = require('../../controllers/product.controller');
const { asyncHandler } = require('../../helpers/asyncHandler');
const { authenticationV2 } = require('../../auth/authUtils');
const { authentication } = require('../../auth/authUtils');
const router = express.Router();

router.get('/search/:keySearch', asyncHandler(productController.getListSearchProduct))
router.get('', asyncHandler(productController.findAllProducts))
router.get('/:product_id', asyncHandler(productController.findProduct))


//authentication
router.use(authenticationV2)

///
router.post('', asyncHandler(productController.createProduct))
router.patch('/:product_id', asyncHandler(productController.updateProduct))
router.post('/publish/:id', asyncHandler(productController.publishProductForShop))
router.post('/unPublish/:id', asyncHandler(productController.unPublishProductForShop))

//QUERY //
router.get('/drafts', asyncHandler(productController.getAllDraftForShop))
router.get('/publishs/prd', asyncHandler(productController.getAllPublishForShop))

module.exports = router