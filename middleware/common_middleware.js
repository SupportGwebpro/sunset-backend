/*jslint node: true */
const express = require('express');
const config = require('../config/config');
const reqFilter = express.Router();
const logger = config.logger;
const jwt = require('jsonwebtoken');
const api = require('../lib/api');
const path = require('path');

reqFilter.use(async function(req, res, next) {
  decodeURIComponent(req.url);
  const url = req.url.split("?")[0];
  const apiName = url.split("/")[3];
  if(apiName == "login" || apiName == "getOutlookLoginUrl") {
    next();
  } else if(req.headers.authorization  && req.headers.authorization != null  && req.headers.authorization != "null" && req.headers.authorization != "undefined")  {
    try{
      let token = req.headers.authorization;
      jwt.verify(token,config.auth.SECRET,{algorithm: "HS256", ignoreExpiration: true,}, function (err, decoded) {
        req.body.tokenUsername = decoded.username
      });
      next();
    } catch (err) {
      logger.info("invalid Token", err.message);
      return api.unauthorized(req , res, {meta: {status: false, message: "Invalid Token", code: 401}});
    }
  } else {
    return api.unauthorized(req , res, {meta: {status: false, message: "Invalid Session", code: 401}});   
  }
});

module.exports = reqFilter;
