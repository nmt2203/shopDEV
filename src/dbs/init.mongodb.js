'use strict';

const mongoose = require('mongoose');
const { countConnect } = require('../helpers/check.connect');

// const connectString = `mongodb://${process.env.DEV_DB_HOST}:${process.env.DEV_DB_PORT}/${process.env.DEV_DB_NAME}`;
const connectString = `mongodb://localhost:27017/shopDEV`;

class Database {
  constructor(){
    this.connect();
  }

  //connect
  connect(type = 'mongodb'){
    if( 1 == 1) {
      mongoose.set('debug', true);
      mongoose.set('debug', { colors: true })
    }

    mongoose.connect(connectString, {
      maxPoolSize: 50
    }, { useNewUrlParser: true, useUnifiedTopology: true })
     .then(() =>{
       countConnect()
       console.log(`Connected to MongoDB Success`)
     })
     .catch(err => console.log(`Error connecting to MongoDB:: ${err}`));
  }

  static getInstance() {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }
}

const instanceMongoDb = Database.getInstance()

module.exports = instanceMongoDb;