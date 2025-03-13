'use strict';

const { Types } = require('mongoose');
const { product, electronic, clothing, furniture } = require('../../models/product.model');
const { getSelectData, unGetSelectData, convertToObjectIdMongodb } = require('../../utils');

const fillAllDraftForShop = async ({ query, limit, skip }) => {
  return await queryProduct({ query, limit, skip })
}

const fillAllPublishForShop = async ({ query, limit, skip }) => {
  return await queryProduct({ query, limit, skip })
}

const findAllProducts = async ({ limit, page, sort, filter, select }) => {
  const skip = (page - 1) * limit;
  const sortBy = sort === 'ctime' ? {_id: -1} : {_id: 1};
  const products = await product.find( filter )
  .sort( sort)
  .skip(skip)
  .limit(limit)
  .select(getSelectData(select))
  .lean()

  return products;
}

const findProduct = async ({ product_id, unSelect }) => {
  return await product.findById(product_id).select(unGetSelectData(unSelect))
}

const getProductById = async (product_id) => {
  return await product.findOne({_id: convertToObjectIdMongodb(product_id)}).lean();
}

const updateProductById = async ({
  product_id,
  bodyUpdate,
  model,
  isNew = true
}) => {
  return await model.findByIdAndUpdate(product_id, bodyUpdate, {
    new: isNew
  })
}

const searchProductByUser = async ({ keySearch }) => {
  const regexSearch = new RegExp(keySearch)
  const results = await product.find({
    isDraft: false,
    $text: { $search: regexSearch }
  },
  {
    score: { $meta: "textScore" }
  }
  ).sort({score: { $meta: "textScore" }}).lean()
  return results
}

const publishProductShop = async ({ product_shop, product_id}) => {
  const foundShop = await product.findOne({
    product_shop: new Types.ObjectId(product_shop),
    _id: new Types.ObjectId(product_id),
  })

  if (!foundShop) {
    return null
  }

  foundShop.isDraft = false;
  foundShop.isPublished = true;
  const { modifiedCount } = await foundShop.updateOne(foundShop)
  return modifiedCount
}

const unPublishProductShop = async ({ product_shop, product_id }) => {
  const foundShop = await product.findOne({
    product_shop: new Types.ObjectId(product_shop),
    _id: new Types.ObjectId(product_id),
  })

  if (!foundShop) {
    return null
  }

  foundShop.isDraft = true;
  foundShop.isPublished = false;
  const { modifiedCount } = await foundShop.updateOne(foundShop)
  return modifiedCount
}

const queryProduct = async ({ query, limit, skip}) => {
  return await product.find(query)
  .populate('product_shop', 'name email -_id')
  .sort({ updatedAt: -1 })
  .skip(skip)
  .limit(limit)
  .lean();
}

const checkProductByServer = async (products) => {
  return await Promise.all(products.map(async (product) => {
    const foundProduct = await getProductById(product.productId)

    if(foundProduct) {
      return {
        price: foundProduct.product_price,
        quantity: product.quantity,
        productId: product.productId
      }
    }
  }))
}

module.exports = {
  fillAllDraftForShop,
  publishProductShop,
  fillAllPublishForShop,
  unPublishProductShop,
  searchProductByUser,
  findAllProducts,
  findProduct,
  updateProductById,
  getProductById,
  checkProductByServer
}