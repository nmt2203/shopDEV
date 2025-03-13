'use strict';

const StatusCode = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  CONFLICT: 409,
}

const ReasonStatusCode = {
  OK: 'OK',
  CREATED: 'created',
  BAD_REQUEST: 'bad request',
  NOT_FOUND: 'no found',
  UNAUTHORIZED: 'unauthorized',
  FORBIDDEN: 'forbidden',
  CONFLICT: 'conflict',
}

class SuccessResponse {
  constructor(message, statusCode = StatusCode.OK, reasonStatusCode = ReasonStatusCode.OK, metadata = {}){
    console.log("message: ", message);
    this.message = !message ? reasonStatusCode : message;
    this.status = statusCode;
    this.metadata = metadata;
  }

  send(res, headers = {}){
    return res.status(this.status).json( this )
  }
}

class OK extends SuccessResponse {
  constructor({ message, metadata }) {
    super({ message, metadata })
  }
}

class CREATED extends SuccessResponse {
  constructor({options = {}, message, statusCode = StatusCode.CREATED, reasonStatusCode = ReasonStatusCode.CREATED, metadata }) {
    super({ message, statusCode, reasonStatusCode, metadata })
    this.options = options
  }
}

module.exports = {
  OK,
  CREATED,
  SuccessResponse
}