'use strict';

const express = require('express');
const uploadController = require('../../controllers/upload.controller');
const { asyncHandler } = require('../../helpers/asyncHandler');
const { authenticationV2 } = require('../../auth/authUtils');
const { uploadMemory } = require('../../configs/multer.config');
const router = express.Router();

// router.use(authenticationV2)
router.post('/product', asyncHandler(uploadController.uploadFile));

//upload S3
router.post('/product/bucket', uploadMemory.single('file'), asyncHandler(uploadController.uploadFileFromLocalS3));

module.exports = router
