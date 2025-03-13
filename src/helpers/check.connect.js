'use strict';

const mongoose = require('mongoose');
const os = require('os');
const process = require('process');
const _SECONDS = 5000;
//count connect
const countConnect = () => {
  const numConnections = mongoose.connections.length;
  console.log(`Number of connections: ${numConnections}`);
}

//check over load
const checkOverload = () => {
  setInterval(() => {
    const numConnections = mongoose.connections.length;
    const numCores = os.cpus().length;
    const memoryUsage =  process.memoryUsage().rss;

    //example maximum number of connection base of number osf cores
    const maxConnections = numCores * 5;

    console.log(`Memory usage: ${memoryUsage / 1024 /1024}`);
    console.log(`Active connections: ${numConnections}`);
    
    if (numConnections > maxConnections){
      console.log('Overload detected, closing connections');
}  }, _SECONDS);
}
 module.exports = {
  countConnect,
  checkOverload
 }