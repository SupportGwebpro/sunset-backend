/*
 *******************************************************************************
 *
 * %name:  guest_route.js %
 * %derived_by:  Rakesh Bhandarkar  %
 *
 * %version:  1 %
 * %release:  sunset_rocks_backend/1.0 %
 * %date_modified:  Mon Aug 11 22:14:32 2025 %
 *
 * Date          By             Description
 * ------------  -----------    -----------
 * Aug 11, 2025  Rakesh B       created
 *******************************************************************************
 */
/*jshint esversion: 6 */

const express = require("express");
const config = require("../../config/config");
const guestRoute = express.Router();
const guestWorkflow = require("../../app/guest/guest_workflow");
const logger = config.logger;
const api = require("../../lib/api");
const filename = "guestRoute";

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
    logger.error(`${apiConstants.username}:${filename}:${apiConstants.method}:${apiConstants.url}:${apiConstants.apiName}:Response Sent: ${JSON.stringify(err.meesage)}`);
    return api.ok(req, res, err);
  }
}

guestRoute.post("/v1/guest/getEventCodeDetails", async function(req, res) {
  await handleRequest(req, res, "getEventCodeDetails", req.body.eventCode, guestWorkflow.getEventCodeDetails);
});

guestRoute.post("/v1/guest/registerEvent", async function(req, res) {
  await handleRequest(req, res, "registerEvent", req.body.eventCode, guestWorkflow.registerEvent);
});

module.exports = guestRoute;