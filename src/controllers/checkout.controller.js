'use strict';

const { SuccessResponse } = require("../core/success.response");
const CheckoutService = require("../services/checkout.service");

class CheckoutController {
  checkout = async (req, res, next) => {
    new SuccessResponse({
      message: 'Discount code created successfully',
      metadata: await CheckoutService.checkoutReview({...req.body})
    }).send(res);
  }

 
}

module.exports = new CheckoutController();