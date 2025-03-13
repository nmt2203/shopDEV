'use strict';

const { NotFoundError } = require("../core/error.response");
const {cart} = require("../models/cart.model");
const { getProductById } = require("../models/repositories/product.repo");

/**
  key features: cart service
  - add product to cart [User]
  - reduce product quantity by one [User]
  - increase product quantity by one [User]
  - get cart [User]
  - delete cart [User]
  - delete cart items [User]
 */
class CartService {
  // START REPO CART
  static async createUserCart({ userId, product}){
    const query = { cart_userId: userId, cart_state: 'active' }
    const updateOrInsert = {
      $addToSet: {
        cart_products: product
      }
    }
    const options = {
      upsert: true,
      new: true,
    }
    return await cart.findOneAndUpdate(query, updateOrInsert, options)
  }

  static async updateUserCartQuantity({ userId, product}){
    const { productId, quantity } = product;
    const query = {
      cart_userId: userId,
      'cart_products.productId': productId,
      cart_state: 'active'
    }, updateSet = {
      $inc: {
        'cart_products.$.quantity': quantity
      }
    }, options = {
      new: true,
      upsert: true,
    }
    return await cart.findOneAndUpdate(query, updateSet, options)
  }
  //END REPO CART
  static async addToCart({ userId, product = {}}){
    // check cart ton tai khong?
    const userCart = await cart.findOne({ cart_userId: userId})
    if(!userCart){
      //create new cart
      return await this.createUserCart({ userId, product })
    }

    // neu co gio hang  roi nhung  chua co san pham nao
    if (!userCart.cart_products.length){
      userCart.cart_products = [product]
      return await userCart.save();
    }

    // neu gio hang ton tai va da co sp nay thi update quantity
    return await this.updateUserCartQuantity({ userId, product })
  }

  //update cart
  /*
    shop_order_ids: [
      {
        shopId,
        item_products: [
          {
            price,
            shopId,
            old_quantity,
            quantity,
            productId
          }
        ],
        version
      }
    ]
  */
  static async addToCartV2({ userId, shop_order_ids}){
    const { productId, quantity, old_quantity } = shop_order_ids[0]?.item_products[0];
    // check product exist?
    const foundProduct = await getProductById(productId);
    if(!foundProduct) throw new NotFoundError('Product not exist!');

    //compare
    if(foundProduct.product_shop.toString() !== shop_order_ids[0]?.shopId) 
      throw new NotFoundError('Product khong phai trong shop');

    if(quantity == 0) {
      //deleted
    }

    return await this.updateUserCartQuantity({ userId, product: {
      productId,
      quantity: quantity - old_quantity
    } })
  }

  static async deleteUserCart({ userId, productId }){
    const query = {
      cart_userId: userId,
      'cart_products.productId': productId,
      cart_state: 'active'
    }, 
    updateSet = {
      $pull: {
        cart_products: { productId }
      }
    }
    const deleteCart = await cart.updateOne(query, updateSet)
    return deleteCart;
  };


  static async getListCart({ userId }) {
    return await cart.findOne({
      cart_userId: +userId,
      cart_state: 'active'
    }).lean();
  }
}

module.exports = CartService;