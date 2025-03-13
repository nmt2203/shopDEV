const express = require('express');
const app = express();
const morgan = require('morgan');
const { default: helmet } = require('helmet');
const compression = require('compression');
const dotenv = require('dotenv');
dotenv.config()

//init middleware
app.use(morgan("dev"))
app.use(helmet())
app.use(compression())
app.use(express.json())
app.use(express.urlencoded({
    extended: true
}))

//test pub sub redis
require('./tests/inventory.test')
const productTest = require('./tests/product.test')
productTest.purchaseProduct('prd:001', 20)

//init db
require('./dbs/init.mongodb')

//init routes
app.use('/', require('./routes'))
//handle error
app.use((req, res, next) => {
    const error = new Error('Not Found')
    error.status = 404
    next(error)
})

app.use((error, req, res, next) => {
    const statusCode = error.status || 500
   res.status(statusCode).json({
        status: 'error',
        code: statusCode,
        stack: error.stack,
        message: error.message || 'Internal Server Error',
   })
})

module.exports = app