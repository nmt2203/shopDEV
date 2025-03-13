'use strict';

const { SuccessResponse } = require("../core/success.response");
const CommentService = require("../services/comment.service");

class CommentController {
  createComment = async (req, res, next) => {
    new SuccessResponse({
      message: 'Comment created successfully',
      metadata: await CommentService.createComment(req.body)
    }).send(res);
  }

  deleteComment = async (req, res, next) => {
    new SuccessResponse({
      message: 'delete comment successfully',
      metadata: await CommentService.deleteComment(req.body)
    }).send(res);
  }

  getCommentByParentId = async (req, res, next) => {
    new SuccessResponse({
      message: 'list comment successfully',
      metadata: await CommentService.getCommentByParentId(req.query)
    }).send(res);
  }

}

module.exports = new CommentController();