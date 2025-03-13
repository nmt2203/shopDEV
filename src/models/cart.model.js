'use strict';

const { model, Schema, Types } = require('mongoose'); // Erase if already required

const DOCUMENT_NAME = 'Cart';
const COLLECTION_NAME = 'Carts';

const cartSchema = new Schema({
    cart_state: {
      type:String,
      enum: ['active', 'completed','failed', 'pending'],
      default: 'active'
    },
    cart_products: { type: Array, required: true, default: []},
    /*
      [
        {
          product_id,
          shop_id,
          quantity,
          name,
          price
        }
      ]
    */
   cart_count_product: {type: Number, default: 0},
   cart_userId: { type: Number, required: true}
  }, {
  timestamps: {
    createdAt: 'created_on',
    updatedAt: 'modified_on'
  },
  collection: COLLECTION_NAME,
});

//Export the model
module.exports = {
  cart: model( DOCUMENT_NAME, cartSchema)
}
