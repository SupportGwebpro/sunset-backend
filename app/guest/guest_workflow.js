/*
 *******************************************************************************
 *
 * %name:  guest_workflow.js %
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
const guestWorkflow = {};
const config = require("../../config/config");
const logger = config.logger;
const commonModel = require("../common/common_model");
const genericWorkflow = require("../generic/generic_workflow");
const filename = "guestWorkflow";

guestWorkflow.getEventCodeDetails = async (username, req) => {
  const functionName = "getEventCodeDetails";
  let apiResponse = createApiResponse(true,"",200,{});
  try {
    logger.info(`${username}: ${filename}:${functionName}: Enter`);
    let checkManadatoryParamterExist = await genericWorkflow.checkManadatoryParamterExist(["eventCode"],req);
    if (!checkManadatoryParamterExist.validation) {
      apiResponse.meta.status = false;
      apiResponse.meta.message = checkManadatoryParamterExist.message;
      return Promise.reject(apiResponse);
    }

    let eventDetailsReq = {
      sql: "select eventId,eventName,eventDescription,eventStartDate,eventEndDate,eventTime,eventLocation,eventTermsAndCondition,eventMiscDetails,eventCode,eventRegClosingDate from event_details where eventCode=?",
      bindParams: [req.eventCode],
    };
    let eventDetails = await commonModel.getAllTableData(username,eventDetailsReq);

    if (eventDetails.response.length === 0) {
      apiResponse.meta.status = false;
      apiResponse.meta.message = "Event not found";
      return Promise.reject(apiResponse);
    }

    let eventImageListReq = {
      sql: "select imageUrl from event_images where eventId=?",
      bindParams: [eventDetails.response[0].eventId]
    };
    let eventImageList = await commonModel.getAllTableData(username,eventImageListReq);

    apiResponse.data = {
      eventDetails: eventDetails.response[0],
      eventImages: eventImageList.response.map(image => image.imageUrl)
    };

    return Promise.resolve(apiResponse);
  } catch (err) {
    logger.error(`${username}: ${filename}:${functionName}: Response Sent :`,err);
    apiResponse.meta.status = false;
    apiResponse.meta.message = "Server Error";
    return Promise.reject(apiResponse);
  }
};

guestWorkflow.registerEvent = async (username, req) => {
  const functionName = "registerEvent";
  let apiResponse = createApiResponse(true,"Event registered sucessfully.",200,{});
  try {
    logger.info(`${username}: ${filename}:${functionName}: Enter`);
    let checkManadatoryParamterExist = await genericWorkflow.checkManadatoryParamterExist(["eventCode","firstName","lastName","emailId","phoneNo"], req);
    if (!checkManadatoryParamterExist.validation) {
      apiResponse.meta.status = false;
      apiResponse.meta.message = checkManadatoryParamterExist.message;
      return Promise.reject(apiResponse);
    }

    let eventDetailsReq = {
      sql: "select eventId,eventRegClosingDate from event_details where eventCode=?",
      bindParams: [req.eventCode]
    };
    let eventDetails = await commonModel.getAllTableData(username,eventDetailsReq);

    if (eventDetails.response.length === 0) {
      apiResponse.meta.status = false;
      apiResponse.meta.message = "Event not found";
      return Promise.reject(apiResponse);
    }
    const { eventId } = eventDetails.response[0];
    const { eventRegClosingDate } = eventDetails.response[0];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (eventRegClosingDate < today) {
      apiResponse.meta.status = false;
      apiResponse.meta.message = "Registration for this event is now closed.";
      return Promise.reject(apiResponse);
    }

    let registerEventReq = {
      sql: "insert into event_guests(eventId, firstName, lastName, emailId, phoneNo) OUTPUT INSERTED.guestId values (?, ?, ?, ?, ?)",
      bindParams: [eventId, req.firstName, req.lastName, req.emailId, req.phoneNo]
    };
    let insertEventResponse = await commonModel.createRowWithReturn(username, registerEventReq);
    let guestId = insertEventResponse.response.guestId;

    let createTicket = {
      sql: "insert into event_guest_tickets(guestId, ticketCode, status) values (?, ?, 'pending')",
      bindParams: [guestId, generateAlphaNumericCode(12)]
    };
    await commonModel.createRow(username, createTicket);
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

module.exports = guestWorkflow;