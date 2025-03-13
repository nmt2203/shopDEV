'use strict';

const { SuccessResponse } = require("../core/success.response");
const { uploadImageFromUrl, uploadImageFromLocalS3 } = require("../services/upload.service");
const { BadRequestError } = require('../core/error.response');

class UploadController {
  uploadFile = async (req, res, next) => {
    new SuccessResponse({
      message: 'upload file successfully',
      metadata: await uploadImageFromUrl()
    }).send(res);
  }

  uploadFileFromLocalS3 = async (req, res, next) => {
    const {file} = req;
    if(!file) {
      throw new BadRequestError('File missing')
    }
    new SuccessResponse({
      message: 'upload file s3 successfully',
      metadata: await uploadImageFromLocalS3({file})
    }).send(res);
  }
}

module.exports = new UploadController();