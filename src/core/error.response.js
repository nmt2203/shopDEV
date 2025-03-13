'use strict';

const StatusCode = {
  BAD_REQUEST: 400,
  AUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409
}

const ResponseStatusCode = {
  BAD_REQUEST: 'Bad Request error',
  AUTHORIZED: 'Authentication',
  NOT_FOUND: 'Not Found error',
  FORBIDDEN: 'Forbidden error',
  CONFLICT: 'Conflict error'
}

class ErrorResponse extends Error {
  constructor(message, status) {
    super(message)
    this.status = status
  }

}

class ConflictRequestError extends ErrorResponse {
  constructor(message = ResponseStatusCode.CONFLICT, statusCode = StatusCode.FORBIDDEN) {
    super(message, statusCode)
  }
}

class BadRequestError extends ErrorResponse {
  constructor(message = ResponseStatusCode.CONFLICT, statusCode = StatusCode.FORBIDDEN) {
    super(message, statusCode)
  }
}

class AuthFailureError extends ErrorResponse {
  constructor(message = ResponseStatusCode.AUTHORIZED, statusCode = StatusCode.AUTHORIZED) {
    super(message, statusCode)
  }
}

class NotFoundError extends ErrorResponse {
  constructor(message = ResponseStatusCode.NOT_FOUND, statusCode = StatusCode.NOT_FOUND) {
    super(message, statusCode)
  }
}

class ForbiddenError extends ErrorResponse {
  constructor(message = ResponseStatusCode.FORBIDDEN, statusCode = StatusCode.FORBIDDEN) {
    super(message, statusCode)
  }
}
module.exports = {
  ConflictRequestError,
  BadRequestError,
  AuthFailureError,
  NotFoundError,
  ForbiddenError
}