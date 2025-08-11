/*
 *******************************************************************************
 *
 * %name:  event_workflow.js %
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
const eventWorkflow = {};
const config = require("../../config/config");
const logger = config.logger;
const commonModel = require("../common/common_model");
const genericWorkflow = require("../generic/generic_workflow");
const filename = "eventWorkflow";

eventWorkflow.createEvent = async (username, req) => {
  const functionName = "createEvent";
  let apiResponse = createApiResponse(true,"Event Created Sucessfully.",200,{});
  try {
    logger.info(`${username}: ${filename}:${functionName}: Enter`);
    //Check Manadatory paramter exist
    let checkManadatoryParamterExist = await genericWorkflow.checkManadatoryParamterExist(["eventName","eventDescription","eventStartDate","eventEndDate","eventRegClosingDate","eventTime","eventLocation","eventTermsAndCondition","eventMiscDetails","eventImageList"],req);
    if (!checkManadatoryParamterExist.validation) {
      apiResponse.meta.status = false;
      apiResponse.meta.message = checkManadatoryParamterExist.message;
      return Promise.reject(apiResponse);
    } else if(req.eventImageList.length === 0) {
      apiResponse.meta.status = false;
      apiResponse.meta.message = "Require atleast one image to create an event";
      return Promise.reject(apiResponse);
    }

    let isUnique = false;
    let eventCode = "";
    while (!isUnique) {
      eventCode = generateAlphaNumericCode(6);
      const checkShortCodeUsedReq = {
        sql: "SELECT eventCode FROM event_details WHERE eventCode = ?",
        bindParams: [eventCode]
      };
      let checkShortCodeUsed = await commonModel.getAllTableData(username, checkShortCodeUsedReq);
      if (checkShortCodeUsed.response.length == 0) {
        isUnique = true;
      }
    }

    let insertEventReq = {
      sql: "insert into event_details(eventName,eventDescription,eventStartDate,eventEndDate,eventRegClosingDate,eventTime,eventLocation,eventTermsAndCondition,eventMiscDetails,eventCode) OUTPUT INSERTED.eventId values (?,?,?,?,?,?,?,?,?,?)",
      bindParams: [req.eventName, req.eventDescription, req.eventStartDate, req.eventEndDate, req.eventRegClosingDate, req.eventTime, req.eventLocation, req.eventTermsAndCondition, req.eventMiscDetails, eventCode]
    };
    let insertEventResponse = await commonModel.createRowWithReturn(username, insertEventReq);

    logger.info(`insertEventResponse : ${JSON.stringify(insertEventResponse)}`);
    let eventId = insertEventResponse.response.eventId;
    for(let image of req.eventImageList) {
      let insertEventImageReq = {
        sql: "insert into event_images(eventId,imageUrl) values (?,?)",
        bindParams: [eventId, image]
      };
      await commonModel.createRow(username, insertEventImageReq);
    }
    return Promise.resolve(apiResponse);
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

function generateAlphaNumericCode(length = 6) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

module.exports = eventWorkflow;