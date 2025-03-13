'use strict';

const { CREATED, SuccessResponse } = require("../core/success.response");
const AccessService = require("../services/access.service");

class AccessController {
  handleRefreshToken = async (req, res) => {
    //v1
    // new SuccessResponse({
    //   message: 'Get token successful',
    //   metadata: await AccessService.handleRefreshToken(req.body.refreshToken)
    // } ).send(res)
    
    //v2 fixed, no need accessToken
    new SuccessResponse({
      message: 'Get token successful',
      metadata: await AccessService.handleRefreshTokenV2({
        refreshToken: req.refreshToken,
        user: req.user,
        keyStore: req.keyStore
      })
    } ).send(res)
  }

  logout = async (req, res) => {
    new SuccessResponse({
      message: 'Logout successful',
      metadata: await AccessService.logout(req.keyStore)
    }).send(res)
  }

  login = async (req, res) => {
    new SuccessResponse({
      metadata: await AccessService.signIn( req.body )
    }).send(res)
  }

  signUp = async ( req, res, next ) => {
    new CREATED({
      message: 'Register OK',
      metadata: await AccessService.signUp(req.body),
      options: {
        page: 1,
        limit: 10
      }
    }).send(res);
  }
}

module.exports = new AccessController();