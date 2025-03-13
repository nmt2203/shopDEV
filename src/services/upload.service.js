'use strict';

const cloudinary = require("../configs/cloudinary.config");

const {s3, PutObjectCommand, GetObjectCommand} = require("../configs/s3.config");
// const { getSignedUrl } = require ("@aws-sdk/s3-request-presigner");
const { getSignedUrl } = require("@aws-sdk/cloudfront-signer"); // CJS

const urlImagePublic = 'https://d2hohozk933ijz.cloudfront.net'
// upload file use S3Client

// upload from local
const uploadImageFromLocalS3 = async ({
  file
}) => {
  try {
    const imgName = `${Date.now()}-${file.originalname}`
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: imgName,
      Body: file.buffer,
      ContentType: file.mimetype,
    })

    const result = await s3.send(command)

    // const signUrl =  new GetObjectCommand({
    //   Bucket: process.env.AWS_BUCKET_NAME,
    //   Key: imgName,
      
    // });
    // const url = await getSignedUrl(s3, signUrl, { expiresIn: 3600 });
    const url = getSignedUrl({
      url: `${urlImagePublic}/${imgName}`,
      keyPairId: "K13UH5ZJY8FFFL", // id cua public key
      dateLessThan: new Date(Date.now() + 1000 * 60), //het han sau 60s
      privateKey: process.env.AWS_BUCKET_PUBLIC_KEY_ID,
    });
    return {
      url,
      result
    }
  } catch (error) {
    console.log("error: ", error);
  }
}

// END S3 service

//1. upload from url img
const uploadImageFromUrl = async () => {
  try {
    const urlImage = 'https://down-vn.img.susercontent.com/file/vn-11134258-7ras8-m5b8b1yhqc5f52';
    const folderName = 'product/777';
    const newFileName = 'testName';

    const result = await cloudinary.uploader.upload(urlImage, {
      public_id: newFileName,
      folder: folderName,
    })

    return result;
  } catch (error) {
    console.log("error: ", error);
    
  }
}
uploadImageFromUrl().catch(console.error);

module.exports = {
  uploadImageFromUrl,
  uploadImageFromLocalS3
}