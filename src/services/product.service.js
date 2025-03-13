'use strict';

const { Types } = require('mongoose');
const { BadRequestError } = require('../core/error.response');
const { product, electronic, clothing, furniture } =  require('../models/product.model');
const { fillAllDraftForShop, publishProductShop, fillAllPublishForShop, unPublishProductShop, searchProductByUser, findAllProducts, findProduct, updateProductById } = require('../models/repositories/product.repo');
const { removeUndefinedObject , updateNestedObject} = require('../utils');
const { insertInventory } = require('../models/repositories/inventory.repo');
const { pushNotiToSystem } = require('./notification.service');

// define Factory class to  create product
class ProductFactory {
   /*
      type: Clothing,
      payload
    */

  static productRegistry = {};

  static registerProductType(type, classRef) {
    ProductFactory.productRegistry[type] = classRef;
  }

  static async createProduct( type, payload ){
   const productClass = ProductFactory.productRegistry[type];
   if(!productClass) {
    throw new BadRequestError('Invalid product type', type);
   }
   return new productClass(payload).createProduct();
  }

  static async updateProduct( type, product_id, payload ){
    const productClass = ProductFactory.productRegistry[type];
    if(!productClass) {
     throw new BadRequestError('Invalid product type', type);
    }
    return new productClass(payload).updateProduct(product_id);
   }

  // PUT //
  static async publishProductShop({product_shop, product_id}) {
    return await publishProductShop({product_shop, product_id})
  }

  static async unPublishProductShop({product_shop, product_id}) {
    return await unPublishProductShop({product_shop, product_id})
  }
  // END PUT //

  //query
  static async fillAllDraftForShop({product_shop, limit = 50, skip = 0}){
    const query = {
      product_shop,
      isDraft: true,
    }
    return await fillAllDraftForShop({query, limit, skip})
  }

  static async fillAllPublishForShop({product_shop, limit = 50, skip = 0}){
    const query = {
    product_shop,
    isPublished: true,
    }
    return await fillAllPublishForShop({query, limit, skip})
  }

  static async getListSearchProduct({ keySearch }) {
    return await searchProductByUser({ keySearch })
  }

  static async findAllProducts({ limit = 50, page = 1, sort = 'ctime', filter = {isPublished: true}}) {
    return await findAllProducts({ limit, page, sort, filter, select: ['product_name', 'product_price', 'product_thumb', 'product_shop']})
  }

  static async findProduct({ product_id }) {
    return await findProduct({product_id, unSelect: ['__v']})
  }
}
// define base class product
class Product {
  constructor({ product_name,
    product_thumb,
    product_description,
    product_price,
    product_quantity,
    product_type,
    product_shop,
    product_attributes }) {
    this.product_name = product_name;
    this.product_thumb = product_thumb;
    this.product_description = product_description;
    this.product_price = product_price;
    this.product_quantity = product_quantity;
    this.product_type = product_type;
    this.product_shop = product_shop;
    this.product_attributes = product_attributes;
  }

  //create new product

  async createProduct(product_id){
    const newProduct = await product.create({...this, _id: product_id});
    if (newProduct) {
      // add product_stock in inventory collection
      await insertInventory({
        productId: newProduct._id,
        shopId: this.product_shop,
        stock: this.product_quantity
      })

      //push noti system
      pushNotiToSystem({
        type: 'SHOP-001',
        receivedId: 1,
        senderId: this.product_shop,
        options: {
          productId: newProduct._id,
          productName: this.product_name,
          shop_id: this.product_shop
        }
      }).then((res) => console.log(1212, res))
      .catch((err) => console.error(2323, err))
    }
    return newProduct;
  }

  // update prd
  async updateProduct(product_id, bodyUpdate){
    return await updateProductById({product_id, bodyUpdate, model:product})
  }
}

//Define sub-class for different products type = clothing
class Clothing extends Product {
  async createProduct(){
    const newClothing = await clothing.create({
      ...this.product_attributes,
      product_shop: this.product_shop
    });
    if(!newClothing) throw new BadRequestError('create new Clothing error');

    const newProduct = await super.createProduct(newClothing._id);
    if(!newProduct) throw new BadRequestError('create new Product error');

    return newProduct;
  }

  async updateProduct(product_id){
    // remove attributes = null, undefined
    const objectParams = removeUndefinedObject(this)
    
    // check vi tri update?
    if(objectParams.product_attributes) {
      // update child
    await updateProductById({product_id, bodyUpdate: (objectParams.product_attributes), model:clothing})
  }
    const updateProduct = await super.updateProduct(product_id, objectParams);
    return updateProduct;
  }
}

//Define sub-class for different products type = Electronic
class Electronic extends Product {
  async createProduct(){
    const newElectronic = await electronic.create({
      ...this.product_attributes,
      product_shop: this.product_shop
    });
    if(!newElectronic) throw new BadRequestError('create new Electronic error');

    const newProduct = await super.createProduct(newElectronic._id);
    if(!newProduct) throw new BadRequestError('create new Product error');

    return newProduct;
  }
}

//Define sub-class for different products type = Furniture
class Furniture extends Product {
  async createProduct(){
    const newFurniture = await furniture.create({
      ...this.product_attributes,
      product_shop: this.product_shop
    });
    if(!newFurniture) throw new BadRequestError('create new Furniture error');

    const newProduct = await super.createProduct(newFurniture._id);
    if(!newProduct) throw new BadRequestError('create new Product error');

    return newProduct;
  }
}

//register product types
ProductFactory.registerProductType('Clothing', Clothing);
ProductFactory.registerProductType('Electronic', Electronic);
ProductFactory.registerProductType('Furniture', Furniture);

module.exports = ProductFactory