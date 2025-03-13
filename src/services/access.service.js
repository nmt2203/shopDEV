'use strict';

const shopModel = require('../models/shop.model')
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const KeyTokenService = require('./keytoken.service');
const { createTokenPair, verifyJWT } = require('../auth/authUtils');
const { getInfoData } = require('../utils');
const { BadRequestError, AuthFailureError, ForbiddenError } = require('../core/error.response');
const { findByEmail } = require('./shop.service');

const RoleShop = {
  SHOP: 'SHOP',
  WRITER: 'WRITER',
  EDITOR: 'EDITOR',
  ADMIN: 'ADMIN'
}

class AccessService {
  /*
   check token used
  */
  static handleRefreshToken = async ( refreshToken ) => {
    //check token used
    const foundToken = await KeyTokenService.findByRefreshTokenUsed( refreshToken );
    if(foundToken) {
      // decode xem la ai?
      const { userId, email} = verifyJWT(refreshToken, foundToken.privateKey)
      //xoa tat ca token trong key Store
      await KeyTokenService.removeKeyByUserId(userId)
      throw new ForbiddenError('Something went wrong!! please re-login')
    }
    //no
    const holderToken = await KeyTokenService.findByRefreshToken(refreshToken)
    if(!holderToken) {
      throw new AuthFailureError('Shop not registered')
    }

    //verify token
    const { userId, email} = verifyJWT(refreshToken, holderToken.privateKey)
    //check userId
    const foundShop = await findByEmail({email})
    if(!foundShop) {
      throw new AuthFailureError('Shop not registered')
    }

    // create 1 cap moi
    const tokens = await createTokenPair({
      userId: userId,
      email
    }, holderToken.publicKey, holderToken.privateKey)

    //update token
    await holderToken.updateOne({
      $set: {
        refreshToken: tokens.refreshToken
      },
      $addToSet: {
        refreshTokensUsed: tokens.refreshToken //da duoc su dung de lay token moi
      }
    })

    return {
      user: { userId, email },
      tokens
    }
  }

  static handleRefreshTokenV2 = async ( {refreshToken, user, keyStore } ) => {
    const { userId, email } = user;

    if (keyStore.refreshTokensUsed.includes(refreshToken)) {
      await KeyTokenService.removeKeyByUserId(userId)
      throw new ForbiddenError('Something went wrong!! please re-login')
    }

    if (keyStore.refreshToken !== refreshToken){
      throw new AuthFailureError('Shop not registered')
    }

    const foundShop = await findByEmail({email})
    if(!foundShop) {
      throw new AuthFailureError('Shop not registered')
    }

    // create 1 cap moi
    const tokens = await createTokenPair({
      userId: userId,
      email
    }, keyStore.publicKey, keyStore.privateKey)

    //update token
    await keyStore.updateOne({
      $set: {
        refreshToken: tokens.refreshToken
      },
      $addToSet: {
        refreshTokensUsed: tokens.refreshToken //da duoc su dung de lay token moi
      }
    })

    return {
      user,
      tokens
    }
  }

  static logout = async ({ keyStore }) => {
    return await KeyTokenService.removeKeyById(keyStore._id);
  }
  /*
  1- check email
  2- check password
  3- create access token and refresh token
  4- generate token
  5- get data return
  */
  static signIn = async ({ email, password, refreshToken = null}) => {
    const foundShop = await findByEmail(email);
    console.log("foundShop: ", foundShop);
    if (!foundShop) {
      throw new BadRequestError('Error: shop not found')
    }

    const match = await bcrypt.compare(password, foundShop.password)
    if(!match){
      throw new AuthFailureError('Authentication failed')
    }

    //create private key, public key
    const privateKey = crypto.randomBytes(64).toString('hex');
    const publicKey = crypto.randomBytes(64).toString('hex');

     //create token pair
     const tokens = await createTokenPair({
      userId: foundShop._id,
      email
    }, publicKey, privateKey)

    await KeyTokenService.createKeyToken({
      userId: foundShop._id,
      privateKey,
      publicKey,
      refreshToken: tokens.refreshToken
    })
    return {
      metadata: {
        shop: getInfoData({ fields: ['_id', 'name', 'email'], object: foundShop}),
        tokens
      }
    }
  }

  static signUp = async ({ name, email, password }) => {
    try {
      //check email exists?
      const shop = await shopModel.findOne({ email }).lean();
      if (shop) {
        throw new BadRequestError('Error: shop already exists')
      }

      const hashPassword = await bcrypt.hash(password, 10)

      const newShop = await shopModel.create({
        name,
        email,
        password: hashPassword,
        roles: [RoleShop.SHOP]
      })

      if (newShop){
        // created privateKey and public key
        // const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
        //   modulusLength: 4096,
        //   privateKeyEncoding: {
        //     type: 'pkcs1',
        //     format: 'pem',
        //   },
        //   publicKeyEncoding: {
        //     type: 'pkcs1',
        //     format: 'pem',
        //   }
        // })

        const privateKey = crypto.randomBytes(64).toString('hex');
        const publicKey = crypto.randomBytes(64).toString('hex');

        const keyStore = await KeyTokenService.createKeyToken({
          userId: newShop._id,
          publicKey,
          privateKey
        })
        
        console.log("keyStore: ", keyStore);
        if(!keyStore) {
        throw new BadRequestError('Error: error public key')
        }

        //create token pair
        const tokens = await createTokenPair({
          userId: newShop._id,
          email
        }, publicKey, privateKey) 
        return {
          code: 201,
          metadata: {
            shop: getInfoData({ fields: ['_id', 'name', 'email'], object: newShop}),
            tokens
          }
        }
      }
      return {
        code: 200,
        metadata: null
      }

    } catch (error) {
      return {
        code: '400',
        message: error.message,
        status: 'error'
      }
    }
  }
}

module.exports = AccessService;