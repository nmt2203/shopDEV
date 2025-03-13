'use strict';

const { BadRequestError, NotFoundError } = require("../core/error.response");
const discountModel = require("../models/discount.model");
const { findAllDiscountCodeUnSelect, checkDiscountExists } = require("../models/repositories/discount.repo");
const { findAllProducts } = require("../models/repositories/product.repo");
const { convertToObjectIdMongodb } = require("../utils");

/**
 * Discount Services
 * 1 - generator DIscount code [Shop | Admin]
 * 2 - Get discount amount [User]
 * 3 - Get all discount codes [User | Shop]
 * 4 - verify discount codes [User]
 * 5 - Delete discount codes [Admin | Shop]
 * 6 - Cancel discount code [User]
 */
class DiscountService {
  static async createDiscountCode(payload) {
    const {
      code, start_date, end_date, is_active, shopId, min_order_value, product_ids, applies_to,
      name, description, type, value, max_value, max_uses, uses_count, max_uses_per_user, users_used
    } = payload;
    // check
    if (new Date() < new Date(start_date) || new Date(end_date) < new Date() || new Date(start_date) > new Date(end_date)){
      throw new BadRequestError('Discount code has expired!');
    }

    //create index for discount code
    const foundDiscount = await discountModel.findOne({
      discountCode: code,
      discount_shopId: convertToObjectIdMongodb(shopId),
      discount_is_active: true
    }).lean();

    if(foundDiscount) throw new BadRequestError('Discount is already exist!');

    const newDiscount = await discountModel.create({
      discount_name: name,
      discount_description: description,
      discount_type: type,
      discount_code: code,
      discount_value: value,
      discount_min_order_value: min_order_value || 0,
      discount_max_value: max_value,
      discount_start_date: new Date(start_date),
      discount_end_date: new Date(end_date),
      discount_max_uses: max_uses,
      discount_uses_count: uses_count,
      discount_users_used: users_used,
      discount_shopId: convertToObjectIdMongodb(shopId),
      discount_max_uses_per_user: max_uses_per_user,
      discount_is_active: is_active,
      discount_applies_to: applies_to,
      discount_product_ids: applies_to == 'all' ? [] : product_ids,
    })

    return newDiscount;
  }

  static async updateDiscountCode() {

  }

  /**
   * Get all discount codes available with products
   */
  static async getAllDiscountCodeWithProduct({
    code, shopId, userId, limit, page
  }) {
    //create index for discount_code
    const foundDiscount = await discountModel.findOne({
      discount_code: code,
      discount_shopId: convertToObjectIdMongodb(shopId),
      discount_is_active: true
    }).lean();
    if(!foundDiscount) {
      throw new NotFoundError('Discount not exist!');
    }

    const {discount_applies_to, discount_product_ids} = foundDiscount;
    let products;
    if(discount_applies_to == 'all'){
      //get all prod
      products = await findAllProducts({
        filter: {
          product_shop: convertToObjectIdMongodb(shopId),
          isPublished: true,
        },
        limit: +limit,
        page: +page,
        sort: 'ctime',
        select: ['product_name', 'product_price', 'product_thumb'],
      })
    }
    if(discount_applies_to == 'specific'){
      //get product by ids
      products = await findAllProducts({
        filter: {
          _id: {
            $in: discount_product_ids
          },
          isPublished: true,
        },
        limit: +limit,
        page: +page,
        sort: 'ctime',
        select: ['product_name', 'product_price', 'product_thumb'],
      })
    }
    return products;
  }

  /**
   * Get all discount code of shop
   */
  static async getAllDiscountCodeByShop({
    limit, page, shopId,
  }){
    const discounts = await findAllDiscountCodeUnSelect({
      limit: +limit,
      page: +page,
      filter: {
        discount_shopId: convertToObjectIdMongodb(shopId),
        discount_is_active: true,
      },
      unSelect: ['__v', 'discount_shopId'],
      model: discountModel
    })
    return discounts;
  }

  /**
   * apply discount code
    product = [
    {
      productId,
      shopId,
      quantity,
      name,
      price,
    },
    {
      productId,
      shopId,
      quantity,
      name,
      price,
    }
    ]
   */
  static async getDiscountAmount({ codeId, userId, shopId, products}){
    const foundDiscount = await checkDiscountExists(discountModel, {
      discount_code: codeId,
      discount_shopId: convertToObjectIdMongodb(shopId),
    })

    if(!foundDiscount) throw new NotFoundError('Discount not exist!');

    const {
      discount_max_uses,
      discount_start_date,
      discount_end_date,
      discount_min_order_value,
      discount_max_uses_per_user,
      discount_users_used,
      discount_value,
      discount_type
    } = foundDiscount

    if(!discount_max_uses) throw new NotFoundError('Discount are out!');


    if(new Date() < new Date(discount_start_date) || new Date() > new Date(discount_end_date)){
      throw new NotFoundError('Discount code expired!');
    }

    //check xem co xet gia tri toi thieu khong
    let totalOrder = 0;
    if(discount_min_order_value > 0) {
      //get total
      totalOrder = products.reduce((acc, product) => {
        return acc + (product.price * product.quantity)
      }, 0)

      if(totalOrder < discount_min_order_value) {
        throw new NotFoundError(`Discount required minium order value of ${discount_min_order_value}!`);
      }

      if(discount_max_uses_per_user > 0) {
        const userUsedDiscount = discount_users_used.find(user => user.userId = userId);
        if(userUsedDiscount){

        }
      }

      //check xem discount la fixed_amount hay percen
      const amount = discount_type === 'fixed_amount' ? discount_value : totalOrder * (discount_value / 100)

      return {
        totalOrder,
        discount: amount,
        totalPrice: totalOrder - amount
      }
    }
  }

  static async deleteDiscountCode({shopId,
    codeId}) {
      const deleted = await discountModel.findOneAndDelete({
        discount_code: codeId,
        discount_shopId: convertToObjectIdMongodb(shopId),
      })

      return deleted;
  }

  static async cancelDiscountCode({ shopId, codeId, userId }){
    const foundDiscount = await checkDiscountExists(discountModel, {
      discount_codeId: codeId,
      discount_shopId: convertToObjectIdMongodb(shopId),
    })

    if(foundDiscount) throw new NotFoundError('Discount doest not exist!');

    const result = await discountModel.findByIdAndUpdate(foundDiscount._id, {
      $pull: {
        discount_users_used: { userId }
      },
      $inc: {
        discount_max_uses: 1,
        discount_uses_count: -1
      }
    })
    return result;
  }
}

module.exports = DiscountService;