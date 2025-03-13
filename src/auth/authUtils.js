'use strict';

const JWT = require('jsonwebtoken');
const { asyncHandler } = require('../helpers/asyncHandler');
const { AuthFailureError } = require('../core/error.response');
const { findByUserId } = require('../services/keytoken.service');

const HEADER = {
  API_KEY: 'x-api-key',
  CLIENT_ID: 'x-client-id',
  AUTHORIZATION: 'authorization',
  REFRESH_TOKEN: 'x-rtoken-id'
}

const createTokenPair = async ( payload, publicKey, privateKey ) => {
  try {
    //create access token
    const accessToken = JWT.sign(payload, publicKey, { 
      expiresIn: '2 days'
     });

     const refreshToken = JWT.sign(payload, privateKey, { expiresIn: '7 days' });
    
    JWT.verify(accessToken, publicKey, (err, decode) => {
      if (err) console.error('error verify::', err);
      else console.log('verify token::', decode)
     })
   
    return {
      accessToken,
      refreshToken
    }
  } catch (error) {
    
  }
}

const authentication = asyncHandler(async (req, res, next) => {
/*
1 - check userId missing?
2 - get access token
3 - verify token
4 - check user id in db
5 - check keyStore with  this user id
6 - return next()
*/

const userId = req.headers[HEADER.CLIENT_ID]
if (!userId) throw new AuthFailureError('Invalid request')

  //2
  const keyStore = await findByUserId(userId)
if (!keyStore) throw new NotFoundError('Not found key store')
  
  //3
  const accessToken = req.headers[HEADER.AUTHORIZATION]
if (!accessToken) throw new AuthFailureError('Invalid request')

  //4
  try {
    const decodeUser = JWT.verify(accessToken, keyStore.publicKey)
    if(userId !== decodeUser.userId) throw new AuthFailureError('Invalid request')
    req.keyStore = keyStore
    return next()
  } catch (error) {
    throw error
  }
})

const authenticationV2 = asyncHandler(async (req, res, next) => {
  /*
  1 - check userId missing?
  2 - get access token
  3 - verify token
  4 - check user id in db
  5 - check keyStore with  this user id
  6 - return next()
  */
  
  const userId = req.headers[HEADER.CLIENT_ID]
  if (!userId) throw new AuthFailureError('Invalid request')
  
    //2
    const keyStore = await findByUserId(userId)
  if (!keyStore) throw new NotFoundError('Not found key store')
    
    //3
  if (req.headers[HEADER.REFRESH_TOKEN]) {
    try {
      const refreshToken = req.headers[HEADER.REFRESH_TOKEN]
      const decodeUser = JWT.verify(refreshToken, keyStore.privateKey)
      if(userId !== decodeUser.userId) throw new AuthFailureError('Invalid request')
      req.keyStore = keyStore
      req.user = decodeUser
      req.refreshToken = refreshToken
      return next()
    } catch (error) {
      throw error
    }
  }

  const accessToken = req.headers[HEADER.AUTHORIZATION]
  if (!accessToken) throw new AuthFailureError('Invalid request')
  
    try {
      const decodeUser = JWT.verify(accessToken, keyStore.publicKey)
      if(userId !== decodeUser.userId) throw new AuthFailureError('Invalid request')
      req.keyStore = keyStore
      return next()
    } catch (error) {
      throw error
    }
  })

const verifyJWT = (token, keySecret) => {
  return  JWT.verify(token, keySecret)
}

module.exports = {
  createTokenPair,
  authentication,
  authenticationV2,
  verifyJWT
}