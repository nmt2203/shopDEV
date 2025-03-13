'use strict';

const mongoose = require('mongoose')

const connectString = `mongodb://localhost:27017/shopDEV`

mongoose.connect(connectString).then( _ => console.log('Connected to MongoDB Success') ).catch(err => console.log(`Error connecting to MongoDB:: ${err}`));

module.exports = mongoose;