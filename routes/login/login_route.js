/*
 *******************************************************************************
 *
 * %name:  login_route.js %
 * %derived_by:  Rakesh Bhandarkar  %
 *
 * %version:  1 %
 * %release:  sunset_rocks_backend/1.0 %
 * %date_modified:  Fri Aug 1 22:14:32 2025 %
 *
 * Date          By             Description
 * ------------  -----------    -----------
 * Aug 01, 2025  Rakesh B       created
 *******************************************************************************
 */
/*jshint esversion: 6 */

const express = require("express");
const config = require("../../config/config");
const loginRoute = express.Router();
const loginWorkflow = require ("../../app/login/login_workflow");
const logger = config.logger;
const api = require("../../lib/api");
const filename = "loginRoute";

async function handleRequest(req, res, apiName, username, workflowMethod) {
  const apiConstants = {
    url: `/${apiName}`,
    apiName: apiName,
    username: username,
    method: "post",
  };
  try {
    logger.info(`${apiConstants.username}:${filename}:${apiConstants.method}:${apiConstants.url}:${apiConstants.apiName}:Request Received:${JSON.stringify(req.body)}`);
    const results = await workflowMethod(apiConstants.username, req.body, req.files);
    logger.info(`${apiConstants.username}:${filename}:${apiConstants.method}:${apiConstants.url}:${apiConstants.apiName}:Response Sent:${JSON.stringify(results)}`);
    return api.ok(req, res, results);  
  } catch (err) {
    logger.error(`${apiConstants.username}:${filename}:${apiConstants.method}:${apiConstants.url}:${apiConstants.apiName}:Response Sent: ${JSON.stringify(err)}`);
    return api.ok(req, res, err);
  }
}

loginRoute.get("/v1/admin/getOutlookLoginUrl", async function(req, res) {
  const apiConstants = {
    url: `/getOutlookLoginUrl`,
    apiName: 'getOutlookLoginUrl',
    username: '',
    method: "post",
  };
  try {
    logger.info(`${apiConstants.username}:${filename}:${apiConstants.method}:${apiConstants.url}:${apiConstants.apiName}:Request Received:${JSON.stringify(req.body)}`);
    const results = await loginWorkflow.getOutlookLoginUrl(apiConstants.username, req.body, req.files);
    logger.info(`${apiConstants.username}:${filename}:${apiConstants.method}:${apiConstants.url}:${apiConstants.apiName}:Response Sent:${JSON.stringify(results)}`);
    res.redirect(results.data.authUrl);
  } catch (err) {
    logger.error(`${apiConstants.username}:${filename}:${apiConstants.method}:${apiConstants.url}:${apiConstants.apiName}:Response Sent: ${JSON.stringify(err)}`);
    return api.ok(req, res, err);
  }
});

loginRoute.get("/v1/admin/login", async function(req, res) {
  req.body.code = req.query.code;
  await handleRequest(req, res, "login", "user", loginWorkflow.login);
});

loginRoute.post("/v1/admin/logout", async function(req, res) {
  req.body.JWTToken = req.headers.authorization;
  await handleRequest(req, res, "logout", req.body.tokenUsername, loginWorkflow.logout);
});

module.exports = loginRoute;