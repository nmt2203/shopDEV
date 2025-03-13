'use strict';

const { NotFoundError } = require("../core/error.response");
const commentModel = require("../models/comment.model");
const { findProduct } = require("../models/repositories/product.repo");
const { convertToObjectIdMongodb } = require("../utils");

/**
 key features: Comment service
  + add comment [User | Shop]
  + get list comment [User | Shop]
  + delete a comment [User | Shop | Admin]
 */
class CommentService {
  static async createComment({
    productId,
    userId,
    content,
    parentCommentId = null,
  }){
    const comment = new commentModel({
      comment_productId: productId,
      comment_userId: userId,
      comment_content: content,
      comment_parentId: parentCommentId,
    })

    let rightValue
    if(parentCommentId){
      //reply comment
      const parentComment = await commentModel.findById(parentCommentId)
      if(!parentComment) throw new NotFoundError('Parent comment not found');

      rightValue = parentComment.comment_right
      //update many comment
      await commentModel.updateMany({
        comment_productId: convertToObjectIdMongodb(productId),
        comment_right: { $gte: rightValue },
      }, {
        $inc: {comment_right: 2}
      })

      await commentModel.updateMany({
        comment_productId: convertToObjectIdMongodb(productId),
        comment_left: { $gte: rightValue },
      }, {
        $inc: {comment_left: 2}
      })
      
    }else {
      
      const maxRightValue = await commentModel.findOne({
        comment_productId: convertToObjectIdMongodb(productId)
      }, 'comment_right', { sort: { comment_right: -1 } })
      if(maxRightValue){
        rightValue = maxRightValue.comment_right + 1
      } else {
        rightValue = 1
      }
    }

    //insert comment
    comment.comment_left = rightValue,
    comment.comment_right = rightValue + 1,
    await comment.save()
    return comment
  }

  static async getCommentByParentId({
    productId,
    parentCommentId = null,
    limit = 50,
    offset = 0
  }) {
    if(parentCommentId) {
      const parent = await commentModel.findById(parentCommentId)
      if(!parent) throw new NotFoundError('comment not found');

      const comments = await commentModel.find({
        comment_productId: convertToObjectIdMongodb(productId),
        comment_left: { $gt : parent.comment_left },
        comment_right: { $lte : parent.comment_right },
      }).select({
        comment_left: 1,
        comment_right: 1,
        comment_content: 1,
        comment_parentId: 1,
      }).sort({
        comment_left: 1
      })
      return comments
    }

    const comments = await commentModel.find({
      comment_productId: convertToObjectIdMongodb(productId),
    }).select({
      comment_left: 1,
      comment_right: 1,
      comment_content: 1,
      comment_parentId: 1,
    }).sort({
      comment_left: 1
    })
    return comments
  }

  static async deleteComment({ commentId, productId }){
    //check product exist
    const foundProduct = await findProduct({
      product_id: productId
    });
    if(!foundProduct) throw new NotFoundError('Product not exist!');

   // 1. xac dinh gia tri left, right cura comment
   const comment = await commentModel.findById(commentId)
   if(!comment) throw new NotFoundError('comment not exist!');

   const leftVal = comment.comment_left;
   const rightVal = comment.comment_right;

    //2. tinh wight
    const wight = rightVal - leftVal + 1;

    //3.xoa tat ca comment con
    await commentModel.deleteMany({
      comment_productId: convertToObjectIdMongodb(productId),
      comment_left: { $gte: leftVal, $lte: rightVal }
    });

    //4. update lai left, right cac comment con
    await commentModel.updateMany({
      comment_productId: convertToObjectIdMongodb(productId),
      comment_left: { $gt: leftVal },
    }, {
      $inc: { comment_left: -wight }
    })

    await commentModel.updateMany({
      comment_productId: convertToObjectIdMongodb(productId),
      comment_right: { $gt: rightVal },
    }, {
      $inc: { comment_right: -wight }
    })

    return "Delete comment success"
  }
}

module.exports = CommentService;