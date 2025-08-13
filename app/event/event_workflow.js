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
const express = require('express');
const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');

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

eventWorkflow.updateEvent = async (username, req) => {
  const functionName = "updateEvent"
  let apiResponse = createApiResponse(true, "Event Updated Sucessfully", 200, {})
  try {
    logger.info(`${username}: ${filename}: ${functionName}: Enter`)
    //Check Manadatory paramter exist
    let checkManadatoryParamterExist = await genericWorkflow.checkManadatoryParamterExist(["eventId","eventName","eventDescription","eventStartDate","eventEndDate","eventRegClosingDate","eventTime","eventLocation","eventTermsAndCondition","eventMiscDetails","eventImageList"],req);
    if (!checkManadatoryParamterExist.validation) {
      apiResponse.meta.status = false;
      apiResponse.meta.message = checkManadatoryParamterExist.message;
      return Promise.reject(apiResponse);
    } else if(req.eventImageList.length === 0) {
      apiResponse.meta.status = false;
      apiResponse.meta.message = "Require atleast one image to create an event";
      return Promise.reject(apiResponse);
    }

    // Checking event exists or not
    const checkEventExistsReq = {
      sql: "SELECT eventId FROM event_details WHERE eventId = ?",
      bindParams: [req.eventId]
    }
    let checkEventExists = await commonModel.getAllTableData(username, checkEventExistsReq)
    if (checkEventExists.response.length === 0) {
      apiResponse.meta.status = false;
      apiResponse.meta.message = "Event not found"
      return Promise.reject(apiResponse)
    }

    //Updating event details
    const updateEventReq = {
      sql: "UPDATE event_details SET eventName = ?, eventDescription = ?, eventStartDate = ?, eventEndDate = ?, eventRegClosingDate = ?, eventTime = ?, eventLocation = ?, eventTermsAndCondition = ?, eventMiscDetails = ? WHERE eventId = ?",
      bindParams: [req.eventName, req.eventDescription, req.eventStartDate, req.eventEndDate, req.eventRegClosingDate, req.eventTime, req.eventLocation, req.eventTermsAndCondition, req.eventMiscDetails, req.eventId]
    }
    await commonModel.updateTable(username, updateEventReq)

    //Deleting existing image
    const deleteEventImagesReq = {
      sql: "DELETE FROM event_images WHERE eventId = ?",
      bindParams: [req.eventId]
    }
    await commonModel.deleteTable(username, deleteEventImagesReq)

    // Inserting updated event images
    for (let image of req.eventImageList) {
      const insertEventImageReq = {
        sql: "INSERT INTO event_images(eventId,imageUrl) VALUES (?,?)",
        bindParams: [req.eventId, image]
      }
      await commonModel.createRow(username, insertEventImageReq)
    }

    return Promise.resolve(apiResponse)
  } catch (error) {
    logger.error(`${username}: ${filename}:${functionName}: Response Sent :`,error);
    apiResponse.meta.status = false;
    apiResponse.meta.message = "Server Error";
    return Promise.reject(apiResponse);
  }
};

eventWorkflow.getAllEvents = async (username, req) => {
  const functionName = "getAllEvents";
  let apiResponse = createApiResponse(true,"",200,{});
  try {
    logger.info(`${username}: ${filename}:${functionName}: Enter`);
    let checkManadatoryParamterExist = await genericWorkflow.checkManadatoryParamterExist(["eventStatus","page","size"], req);
    if (!checkManadatoryParamterExist.validation) {
      apiResponse.meta.status = false;
      apiResponse.meta.message = checkManadatoryParamterExist.message;
      return Promise.reject(apiResponse);
    } else if(req.eventStatus !== "upcoming" && req.eventStatus !== "past") {
      apiResponse.meta.status = false;
      apiResponse.meta.message = "Invalid event status. Allowed values are 'upcoming' or 'past'.";
      return Promise.reject(apiResponse);
    }
    let offset = (req.page - 1) * req.size;

    let eventListCntReq = {
      sql: "select count(1) as count from event_details ",
      bindParams: []
    };

    let eventListReq = {
      sql: "select eventId,eventCode,eventName,eventStartDate,eventEndDate,eventRegClosingDate,eventTime,eventLocation from event_details ",
      bindParams: [offset,req.size]
    };
    if(req.eventStatus === "upcoming") {
      eventListReq.sql += " where eventEndDate >= getdate()";
      eventListCntReq.sql += " where eventEndDate >= getdate()";
    } else if(req.eventStatus === "past") {
      eventListReq.sql += " where eventEndDate < getdate()";
      eventListCntReq.sql += " where eventEndDate < getdate()";
    }
    eventListReq.sql += " order by eventStartDate desc offset ? rows fetch next ? rows only";
    let eventList = await commonModel.getAllTableData(username, eventListReq);
    let eventListCnt = await commonModel.getAllTableData(username, eventListCntReq);
    apiResponse.data.totalCount = eventListCnt.response[0].count;

    for(var i=0; i<eventList.response.length; i++) {
      eventList.response[i].eventLink = `${config.setting.frontendUrl}/event/invite?eventCode=${eventList.response[i].eventCode}`;
      eventList.response[i].pending = 0;
      eventList.response[i].approved = 0;
      eventList.response[i].rejected = 0;
      eventList.response[i].badgeCollected = 0;
      eventList.response[i].checkedIn = 0;

      let eventRegistrationReq = {
        sql: "select b.status,count(1) as count from event_guests a, event_guest_tickets b where a.guestId=b.guestId and a.eventId = ? group by b.status",
        bindParams: [eventList.response[i].eventId]
      };
      let eventRegistration = await commonModel.getAllTableData(username, eventRegistrationReq);
      for(let { status, count } of eventRegistration.response) {
        eventList.response[i][status] = count;
      }
    }
    apiResponse.data.eventList = eventList.response;
    return Promise.resolve(apiResponse);
  } catch (err) {
    logger.error(`${username}: ${filename}:${functionName}: Response Sent :`,err);
    apiResponse.meta.status = false;
    apiResponse.meta.message = "Server Error";
    return Promise.reject(apiResponse);
  }
};

eventWorkflow.eventDetails = async (username, req) => {
  const functionName = "eventDetails";
  let apiResponse = createApiResponse(true,"",200,{});
  try {
    logger.info(`${username}: ${filename}:${functionName}: Enter`);
    let checkManadatoryParamterExist = await genericWorkflow.checkManadatoryParamterExist(["eventId"], req);
    if (!checkManadatoryParamterExist.validation) {
      apiResponse.meta.status = false;
      apiResponse.meta.message = checkManadatoryParamterExist.message;
      return Promise.reject(apiResponse);
    }

    let eventDetailsReq = {
      sql: "select * from event_details ",
      bindParams: [req.eventId]
    };
    let eventDetails = await commonModel.getAllTableData(username, eventDetailsReq);

    let eventImageListReq = {
      sql: "select imageUrl from event_images where eventId = ?",
      bindParams: [req.eventId]
    };
    let eventImageList = await commonModel.getAllTableData(username, eventImageListReq);

    eventDetails.response[0].eventImageList = eventImageList.response.map(image => image.imageUrl);
    eventDetails.response[0].eventLink = `${config.setting.frontendUrl}/event/invite?eventCode=${eventDetails.response[0].eventCode}`;
    eventDetails.response[0].pending = 0;
    eventDetails.response[0].approved = 0;
    eventDetails.response[0].rejected = 0;
    eventDetails.response[0].badgeCollected = 0;
    eventDetails.response[0].checkedIn = 0;

    let eventRegistrationReq = {
      sql: "select b.status,count(1) as count from event_guests a, event_guest_tickets b where a.guestId=b.guestId and a.eventId = ? group by b.status",
      bindParams: [req.eventId]
    };
    let eventRegistration = await commonModel.getAllTableData(username, eventRegistrationReq);

    for(let { status, count } of eventRegistration.response) {
      eventDetails.response[0][status] = count;
    }

    apiResponse.data = eventDetails.response[0];
    return Promise.resolve(apiResponse);
  } catch (err) {
    logger.error(`${username}: ${filename}:${functionName}: Response Sent :`,err);
    apiResponse.meta.status = false;
    apiResponse.meta.message = "Server Error";
    return Promise.reject(apiResponse);
  }
};

eventWorkflow.downloadEventReport = async (username, req) => {
  const functionName = "downloadEventReport";
  let apiResponse = createApiResponse(true,"",200,{});
  try {
    logger.info(`${username}: ${filename}:${functionName}: Enter`);
    let checkManadatoryParamterExist = await genericWorkflow.checkManadatoryParamterExist(["eventId"], req);
    if (!checkManadatoryParamterExist.validation) {
      apiResponse.meta.status = false;
      apiResponse.meta.message = checkManadatoryParamterExist.message;
      return Promise.reject(apiResponse);
    }

    let eventDetailsReq = {
      sql: "select eventName from event_details where eventId = ?",
      bindParams: [req.eventId]
    };
    let eventDetails = await commonModel.getAllTableData(username, eventDetailsReq);
    const eventName = eventDetails.response[0]?.eventName || "Event Report";

    // Create workbook
    const workbook = new ExcelJS.Workbook();
    workbook.creator = username;
    workbook.created = new Date();

    const addSheet = (name, data) => {
      const sheet = workbook.addWorksheet(name);
      sheet.columns = [
        { header: 'Registered At', key: 'createTs', width: 22 },
        { header: 'First Name', key: 'firstName', width: 20 },
        { header: 'Last Name', key: 'lastName', width: 20 },
        { header: 'Email', key: 'emailId', width: 35 },
        { header: 'Phone', key: 'phoneNo', width: 20 },
        { header: 'Company Name', key: 'companyName', width: 30 },
        { header: 'Status', key: 'status', width: 15 },
        { header: 'Total Tickets', key: 'totalTickets', width: 15 }
      ];
      (data || []).forEach(row => sheet.addRow(row));
      sheet.getRow(1).font = { bold: true };
    };

    const statuses = ["pending", "approved", "rejected", "badgeCollected", "checkedIn"];
    for (const status of statuses) {
      let statusDataReq = {
        sql: "select a.createTs, a.firstName, a.lastName, a.emailId, a.phoneNo, a.companyName, b.status, count(b.ticketId) as totalTickets from event_guests a, event_guest_tickets b where a.guestId=b.guestId and a.eventId = ? and b.status = ? group by a.createTs, a.firstName, a.lastName, a.emailId, a.phoneNo, a.companyName, b.status",
        bindParams: [req.eventId, status]
      };
      let statusData = await commonModel.getAllTableData(username, statusDataReq);
      addSheet(status, statusData.response);
    }

    const reportDir = path.join(__dirname, "../../public/report");
    const fileName = `${eventName.replace(/\s+/g, "_")}_${Date.now()}.xlsx`;
    const filePath = path.join(reportDir, fileName);
    await workbook.xlsx.writeFile(filePath);

    apiResponse.data.filePath = `${config.setting.backendendUrl}/report/${fileName}`;
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