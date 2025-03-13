'use strict';

const { convertToObjectIdMongodb } = require("../../utils");
const { inventory } = require("../inventory.model");

const insertInventory = async ({
  productId, shopId, stock, location = 'unknown',
}) => {
  return await inventory.create({
    inven_product_id: productId,
    inven_location: location,
    inven_shop_id: shopId,
    inven_stock: stock,
  })
}

const reservationInventory = async ({ productId, quantity, cartId }) => {
  const query = {
    inven_product_id: convertToObjectIdMongodb(productId),
    inven_stock: { $gte: quantity },
  }
  const updateSet = {
    $inc: { inven_stock: -quantity },
    $push: { inven_reservations: {
      quantity,
      cartId,
      createOn: new Date(),
    }},
  }
  const options = {
    upsert: true, new: true
  }
  return await inventory.findOneAndUpdate(query, updateSet, options)
}

module.exports = {
  insertInventory,
  reservationInventory,
}