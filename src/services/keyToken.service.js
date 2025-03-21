'use strict';

const keytokenModel = require("../models/keytoken.model");
const { Types } = require('mongoose')
 class KeyTokenService {

  static createKeyToken = async ({ userId, publicKey, privateKey, refreshToken }) => {
    try {
      // const tokens = await keytokenModel.create({
      //   user: userId,
      //   publicKey,
      //   privateKey
      // })
      // return tokens ? tokens.publicKey : null;
      
      const filter = { user: (userId)}, update = {
        publicKey,
        privateKey, refreshTokensUsed: [], refreshToken
      }, options = { upsert: true, new: true }
      
      console.log("filter: ", filter);
      const token = await keytokenModel.findOneAndUpdate(filter, update, options)
      return token ? token.publicKey : null
    } catch (error) {
      return error;
    }
  }

  static findByUserId = async (userId) => {
    return await keytokenModel.findOne({ user: new Types.ObjectId(userId) });
  }

  static removeKeyById = async (id) => {
    return await keytokenModel.deleteOne({
      _id: new Types.ObjectId(id)
    })
  }

  static findByRefreshTokenUsed = async (refreshToken) => {
    return await keytokenModel.findOne({ refreshTokensUsed: refreshToken}).lean();
  }

  static findByRefreshToken= async (refreshToken) => {
    return await keytokenModel.findOne({refreshToken})
  }

  static removeKeyByUserId = async (userId) => {
    return await keytokenModel.deleteOne({
      user:  Types.ObjectId(userId)
    })
  }
}

module.exports = KeyTokenService;