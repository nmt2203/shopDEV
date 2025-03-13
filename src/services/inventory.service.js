'use strict';

const { BadRequestError } = require("../core/error.response");
const { inventory } = require("../models/inventory.model");
const { getProductById } = require("../models/repositories/product.repo");

class InventoryService {
  static async addStockToInventory({
    stock,
    productId,
    shopId,
    location = '195 tran cung',
  }){
    const product = await getProductById(productId);
    if (!product) throw new BadRequestError('Product not exist');

    const query = {
      inven_shop_id: shopId,
      inven_product_id: productId,
    }, updateSet = {
      $inc: { inven_stock: stock },
      $set: { inven_location: location }
    }, options = { upsert: true, new: true }

    return await inventory.findOneAndDelete(query, updateSet, options)
  }

  /**
   1 - query order [user]
   */
  static async getOrderByUser(){

  }

  /**
   1 - query order using Id[user]
   */
   static async getOneOrderByUser(){

   }

   /**
   1 - cancel order [user]
   */
  static async cancelOrderByUser(){

  }

  /**
   1 - update order status [shop | admin]
   */
   static async updateOrderStatusByShop(){

   }
}

module.exports = InventoryService;