'use strict';

const { Schema, model} = require('mongoose'); // Erase if already required

const DOCUMENT_NAME = 'Product';
const COLLECTION_NAME = 'Products';
const slugify = require('slugify');

// Declare the Schema of the Mongo model
var ProductSchema = new Schema({
    product_name: { type: String, required: true},
    product_thumb: { type: String, required: true},
    product_description: { type: String },
    product_slug: String,
    product_price: { type: Number, required: true},
    product_quantity: { type: Number, required: true},
    product_type: { type: String, required: true}, enum: ['Electronic', 'Clothing', 'Furniture'],
    product_shop: { type: Schema.Types.ObjectId, ref: 'Shop' },
    product_attributes: { type: Schema.Types.Mixed, required: true },
    //more
    product_ratingsAverage: {
      type: Number,
      default: 3,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be above 5.0'],
      set: (val) => Math.round(val * 10) / 10
    },
    product_variations: { type: Array, default: [] },
    isDraft: { type: Boolean, default: true, index: true, select: false },
    isPublished: { type: Boolean, default: false, index: true, select: false }
}, {
  collection: COLLECTION_NAME,
  timestamps: true
});
//create index for search
ProductSchema.index({ product_name: 'text', product_description: 'text'})

//Document middleware: run before .save() and .create()
ProductSchema.pre('save', function(next) {
  this.product_slug = slugify(this.product_name, { lower: true });
  next();
});

ProductSchema.pre('create', function(next) {
  this.product_slug = slugify(this.product_name, { lower: true });
  next();
});

//define the product type  = clothing
const ClothingSchema = new Schema({
  brand: { type: String, require: true },
  size: { type: String},
  product_shop: { type: Schema.Types.ObjectId, ref: 'Shop' },
  material: String
}, {
  collection: 'clothes',
  timestamps: true
})

//define the product type  = electronic
const ElectronicSchema = new Schema({
  manufacturer: { type: String, require: true },
  model: { type: String},
  product_shop: { type: Schema.Types.ObjectId, ref: 'Shop' },
  color: { type: String }
}, {
  collection: 'electronics',
  timestamps: true
})

//define the product type  = electronic
const FurnitureSchema = new Schema({
  brand: { type: String, require: true },
  size: { type: String},
  product_shop: { type: Schema.Types.ObjectId, ref: 'Shop' },
  material: String
}, {
  collection: 'furniture',
  timestamps: true
})

//Export the model
module.exports = {
  product: model(DOCUMENT_NAME, ProductSchema),
  clothing: model('Clothing', ClothingSchema),
  electronic: model('Electronic', ElectronicSchema),
  furniture: model('Furniture', FurnitureSchema)   
}