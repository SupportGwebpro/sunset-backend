/*
 *******************************************************************************
 *
 * %name:  event_route.js %
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
const eventRoute = express.Router();
const eventWorkflow = require("../../app/event/event_workflow");
const logger = config.logger;
const api = require("../../lib/api");
const filename = "eventRoute";

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

eventRoute.post("/v1/admin/createEvent", async function(req, res) {
  await handleRequest(req, res, "createEvent", req.body.tokenUsername, eventWorkflow.createEvent);
});

eventRoute.post("/v1/admin/updateEvent", async function(req, res) {
  await handleRequest(req, res, "updateEvent", req.body.tokenUsername, eventWorkflow.updateEvent);
});

eventRoute.post("/v1/admin/getAllEvents", async function(req, res) {
  await handleRequest(req, res, "getAllEvents", req.body.tokenUsername, eventWorkflow.getAllEvents);
});

eventRoute.post("/v1/admin/eventDetails", async function(req, res) {
  await handleRequest(req, res, "eventDetails", req.body.tokenUsername, eventWorkflow.eventDetails);
});

eventRoute.post("/v1/admin/downloadEventReport", async function(req, res) {
  await handleRequest(req, res, "downloadEventReport", req.body.tokenUsername, eventWorkflow.downloadEventReport);
});

module.exports = eventRoute;