'use strict';

const { SuccessResponse } = require("../core/success.response");
const ProductService = require("../services/product.service");

class ProductController {
  createProduct = async (req, res, next) => {
    new SuccessResponse({
      message: 'Product created successfully',
      metadata: await ProductService.createProduct(req.body.product_type,{
        ...req.body,
        product_shop: req.user.userId
      })
    }).send(res)
  }

  updateProduct = async (req, res, next) => {
    new SuccessResponse({
      message: 'Product updated successfully',
      metadata: await ProductService.updateProduct(req.body.product_type, req.params.product_id, {
        ...req.body,
        product_shop: req.user.userId
      })
    }).send(res)
  }

  publishProductForShop = async (req, res, next) => {
    new SuccessResponse({
      message: 'Product published successfully',
      metadata: await ProductService.publishProductShop(
        {product_shop: req.user.userId, product_id: req.params.id}
      )
    }).send(res)
  }

  unPublishProductForShop = async (req, res, next) => {
    new SuccessResponse({
      message: 'Product unPublished successfully',
      metadata: await ProductService.unPublishProductShop(
        {product_shop: req.user.userId, product_id: req.params.id}
      )
    }).send(res)
  }

  //QUERY
  /**
   * @desc Get all drafts for shop
   * @param {Number} limit 
   * @param {Number} skip 
   * @param {Number} limit 
   * @return {JSON} res 
   */
  getAllDraftForShop = async (req, res, next) => {
    new SuccessResponse({
      message: 'get list draft successfully',
      metadata: await ProductService.fillAllDraftForShop(
        {product_shop: req.user.userId}
      )
    }).send(res)
  }

  getAllPublishForShop = async (req, res, next) => {
    new SuccessResponse({
      message: 'get list publish successfully',
      metadata: await ProductService.fillAllPublishForShop(
        {product_shop: req.user.userId}
      )
    }).send(res)
  }

  getListSearchProduct = async (req, res, next) => {
    new SuccessResponse({
      message: 'get list search successfully',
      metadata: await ProductService.getListSearchProduct(req.params)
    }).send(res)
  }

  findAllProducts = async (req, res, next) => {
    new SuccessResponse({
      message: 'get list product successfully',
      metadata: await ProductService.findAllProducts(req.query)
    }).send(res)
  }

  findProduct = async (req, res, next) => {
    new SuccessResponse({
      message: 'get detail product successfully',
      metadata: await ProductService.findProduct({ product_id: req.params.product_id})
    }).send(res)
  }
  
  //END QUERY
}
module.exports = new ProductController();
