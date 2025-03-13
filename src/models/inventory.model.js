'use strict';

const { model, Schema, Types } = require('mongoose'); // Erase if already required

const DOCUMENT_NAME = 'Inventory';
const COLLECTION_NAME = 'Inventories';

const inventorySchema = new Schema({
    inven_product_id:{
        type: Schema.Types.ObjectId, ref: 'Product',
        required:true,
        unique:true,
    },
    inven_location:{
        type: String,
        default: 'unknown',
    },
    inven_stock:{
        type: Number,
        require: true
    },
    inven_shop_id: {type: Schema.Types.ObjectId, ref: 'Shop'},
    inven_reservations: {type: Array, default: []}
  }, {
  timestamps: true,
  collection: COLLECTION_NAME,
});

//Export the model
module.exports = {
    inventory: model( DOCUMENT_NAME, inventorySchema)
}