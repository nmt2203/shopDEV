'use strict';

const { SuccessResponse } = require("../core/success.response");
const DiscountService = require("../services/discount.service");

class DiscountController {
  createDiscountCode = async (req, res, next) => {
    new SuccessResponse({
      message: 'Discount code created successfully',
      metadata: await DiscountService.createDiscountCode({...req.body, shopId: req.user.userId})
    }).send(res);
  }

  getAllDiscountCodeByShop = async (req, res, next) => {
    new SuccessResponse({
      message: 'success',
      metadata: await DiscountService.getAllDiscountCodeByShop({...req.body, shopId: req.user.userId})
    }).send(res);
  }

  getDiscountAmount= async (req, res, next) => {
    new SuccessResponse({
      message: 'success',
      metadata: await DiscountService.getDiscountAmount({...req.body})
    }).send(res);
  }

  getAllDiscountCodeWithProduct= async (req, res, next) => {
    new SuccessResponse({
      message: 'success',
      metadata: await DiscountService.getAllDiscountCodeWithProduct({...req.query})
    }).send(res);
  }
}

module.exports = new DiscountController();