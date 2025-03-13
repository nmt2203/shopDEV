'use strict';

const { model, Schema, Types } = require('mongoose'); // Erase if already required

const DOCUMENT_NAME = 'Order';
const COLLECTION_NAME = 'Orders';

const orderSchema = new Schema({
   order_userId: { type: Number, required: true},
   order_checkout: { type: Object, default: {}},
   /*
    {
      order_checkout: {
        totalPrice,
        totalApplyDiscount,
        feeShip
      }
    }
   */
  order_shipping: { type: Object, default: {}},
  /*
    {
      street,
      city,
      state,
      country,
    }
  */
 order_payment: { type: Object, default: {}},
 order_products: {type: Array, required: true},
 order_trackingNumber: { type: String, default: "#000120102024"},
 order_status: { type: String, enum: ['pending', 'confirmed', 'shipped', 'canceled', 'delivered'], default: 'pending'},
  }, {
  timestamps: {
    createdAt: 'created_on',
    updatedAt: 'modified_on'
  },
  collection: COLLECTION_NAME,
});

//Export the model
module.exports = {
  order: model( DOCUMENT_NAME, orderSchema)
}
