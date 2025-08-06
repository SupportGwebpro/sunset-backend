/*
 *******************************************************************************
 *
 * %name:  login_workflow.js %
 * %derived_by:  Rakesh Bhandarkar  %
 *
 * %version:  1 %
 * %release:  activate_backend/1.0 %
 * %date_modified:  Thu Jul 11 22:14:32 2024 %
 *
 * Date          By             Description
 * ------------  -----------    -----------
 * Jul 11, 2024  Rakesh B       created
 *******************************************************************************
 */
/*jshint esversion: 6 */
const loginWorkflow = {};
const msal = require('@azure/msal-node')
const config = require("../../config/config");
const logger = config.logger;
const commonModel = require("../common/common_model");
const jwt = require("jsonwebtoken");
const { log } = require('winston');
const filename = "loginWorkflow";

loginWorkflow.getOutlookLoginUrl = async (username, req) => {
  const functionName = "getOutlookLoginUrl";
  let apiResponse = createApiResponse(true,"",200,{});
  try {
    logger.info(`${username}: ${filename}:${functionName}: Enter`);
    const azureTenantId = config.azureDetails.azureTenantId;
    const azureClientId = config.azureDetails.azureClientId;
    const redirectUri = encodeURIComponent(`${config.setting.backendendUrl}/v1/admin/login`)
    const scopes = encodeURIComponent("openid profile email")
    const state = 12345
    const authUrl = `https://login.microsoftonline.com/${azureTenantId}/oauth2/v2.0/authorize?client_id=${azureClientId}&response_type=code&redirect_uri=${redirectUri}&response_mode=query&scope=${scopes}&state=${state}`
    apiResponse.data.authUrl = authUrl;
    return Promise.resolve(apiResponse);
  } catch (err) {
    logger.error(`${username}: ${filename}:${functionName}: Response Sent :`,err);
    apiResponse.meta.status = false;
    apiResponse.meta.message = "Server Error";
    return Promise.reject(apiResponse);
  }
};

loginWorkflow.login = async (username, req) => {
  const functionName = "login";
  let apiResponse = createApiResponse(true,"",200,{});
  try {
    logger.info(`{username}: ${filename}:${functionName}: Enter`);
    const azureLogin = {
      auth: {
          clientId: config.azureDetails.azureClientId,
          authority: `https://login.microsoftonline.com/${config.azureDetails.azureTenantId}`,
          clientSecret: `${config.azureDetails.clientSecret}`
      }
    }
    const confClientApp = new msal.ConfidentialClientApplication(azureLogin)

    const azureTokenRequest = {
      code: req.code,
      scopes: ["openid", "profile", "email"],
      redirectUri: `${config.setting.backendendUrl}/v1/admin/login`
    }
    const response = await confClientApp.acquireTokenByCode(azureTokenRequest);
    const {name, username} = response.account
    const decodedIdToken = jwt.decode(response.idToken)
    const roles = decodedIdToken?.roles || []
    logger.info(`decodedIdToken : ${JSON.stringify(decodedIdToken)}`);
    if(roles.includes("Admin") || roles.includes("Staff")) {
      const jwtToken = jwt.sign({name, username, roles}, 'SunsetRocksSecret', {expiresIn: '1h'});
      apiResponse.data.token = jwtToken;
      let insertJwtTokenReq = {
        sql: "insert into admin_active_users() values ()",
        bindParams: [],
      }
      return Promise.resolve(apiResponse);
    } else {
      apiResponse.meta.status = false;
      apiResponse.meta.message = "You are not authorized to access this application!!";
      return Promise.reject(apiResponse);
    }
  } catch (err) {
    logger.error(`${username}: ${filename}:${functionName}: Response Sent :`,err);
    apiResponse.meta.status = false;
    apiResponse.meta.message = "Server Error";
    return Promise.reject(apiResponse);
  }
};

loginWorkflow.logout = async (username, req) => {
  const functionName = "logout";
  let apiResponse = createApiResponse(true,"User Logged out sucessfully.",200,{});
  try {
    logger.info(`{username}: ${filename}:${functionName}: Enter`);
    // Remove the JWT token from the database table admin_active_users by matching req.JWTToken
  } catch (err) {
    logger.error(`${username}: ${filename}:${functionName}: Response Sent :`,err);
    apiResponse.meta.status = false;
    apiResponse.meta.message = "Server Error";
    return Promise.reject(apiResponse);
  }
};


function createApiResponse(status = true, message = "", code = 200, data = {}) {
  return {
    meta: { status, message, code },
    data,
  };
};

module.exports = loginWorkflow;