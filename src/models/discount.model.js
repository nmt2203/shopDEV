'use strict';

const { model, Schema, Types } = require('mongoose'); // Erase if already required

const DOCUMENT_NAME = 'Discount';
const COLLECTION_NAME = 'discounts';

const discountSchema = new Schema({
    discount_name: {type: String, required: true},
    discount_description: {type: String, required: true},
    discount_type: {type: String, required: true, default: 'fixed_amount'}, // percentage,
    discount_value: {type: Number, required: true}, // 10.00 , 10
    discount_max_value: {type: Number, required: true},
    discount_code:{type: String, required: true},
    discount_start_date: {type: Date, required: true},
    discount_end_date: {type: Date, required: true},
    discount_max_uses: {type: Number, required: true}, // so luong discount duoc ap dung
    discount_uses_count: {type: Number, required: true}, //so discount da duoc su dung
    discount_users_used: {type: Array, default: []}, // ai da su dung
    discount_max_uses_per_user: {type: Number, required: true}, //so luong toi da 1 user duoc su dung
    discount_min_order_value: {type: Number, required: true},
    discount_shopId: {type: Schema.Types.ObjectId, ref: 'Shop'},
    discount_is_active: {type: Boolean, default: true},
    discount_applies_to: {type: String, required: true, enum: ['all', 'specific']},
    discount_product_ids: {type: Array, default: []} // id nhung san pham duoc ap dung
  }, {
  timestamps: true,
  collection: COLLECTION_NAME,
});

//Export the model
module.exports = model( DOCUMENT_NAME, discountSchema)
