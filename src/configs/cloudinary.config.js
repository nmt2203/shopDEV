 'use strict';

 const cloudinary = require('cloudinary').v2;

// Return "https" URLs by setting secure: true
cloudinary.config({
  cloud_name: "shopdev111",
  api_key: "717657576718634",
  api_secret: "1zVma4p26dHpXPv6qBGGNzO47PE"
});

module.exports = cloudinary