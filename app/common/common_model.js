/*
 *******************************************************************************
 *
 * %name:  common_model.js %
 * %derived_by:  Rakesh Bhandarkar %
 *
 * %version:  1 %
 * %release:  sunset_rocks_backend/1.0 %
 * %date_modified:  Fri Aug 1 22:14:32 2025 %
 *
 * Date          By             Description
 * ------------  -----------    -----------
 * Aug 01, 2025   rakesh        created
 *******************************************************************************
 */
 const commonDB = {};
 const config = require("../../config/config");
 const sqlDb = require("../../db/ms_sql");
 const logger = config.logger;
 const filename = "common-model";
 
 commonDB.getAllTableData = async ( username, request) => {
   const functionName = "getAllTableData";
   const successResponse = {
     responseCode: 0,
     response: [],
     successMsg: "",
   };
   const failureResponse = {
     responseCode: -1,
     response: {},
     errorMsg: "Something went wrong. Please Try Again Later",
   };
   let conn;
   try {
     conn = await sqlDb.doConnect(username);
     const sql = request.sql;
     const bindParams = request.bindParams;
     const rows = await sqlDb.executeSql(username,conn,sql,bindParams);
     if (rows && rows.length > 0) {
       successResponse.response = rows;    
     }
     await sqlDb.doRelease(username, conn);
     logger.debug(`${username}: ${filename}:${functionName}: Response Sent : `, successResponse);
     return Promise.resolve(successResponse);  
   } catch (err) {
     logger.error(`${username}: ${filename}:${functionName}: Error Received : `, err);
     await sqlDb.doRelease(username, conn);
     failureResponse.errorMsg = err.message;
     logger.error(`${username}: ${filename}:${functionName}: Response Sent : `, failureResponse);
     return Promise.reject(failureResponse);
   }
 };
 
 
 commonDB.createRow = async ( username, request) => {
   const functionName = "createRow";
   const successResponse = {
     responseCode: 0,
     response: {},
     successMsg: "",
   };
   const failureResponse = {
     responseCode: -1,
     response: {},
     errorMsg: "Something went wrong. Please Try Again Later",
   };
   
   let conn;
   try {
     conn = await sqlDb.doConnect(username);
     const sql = request.sql;
     const bindParams = request.bindParams;
     await sqlDb.executeSql(username,conn,sql,bindParams);
     await sqlDb.doRelease(username, conn);
     return Promise.resolve(successResponse);
   } catch (err) {
     logger.error(`${username}: ${filename}:${functionName}: Error Received : `, err);
     await sqlDb.doRelease(username, conn);
     failureResponse.errorMsg = err.message;
     logger.error(`${username}: ${filename}:${functionName}: Response Sent : `, failureResponse);
     return Promise.reject(failureResponse);
   }
 };
 
 commonDB.checkRowExist = async ( username, request) => {
   const functionName = "checkRowExist";
   const successResponse = {
     responseCode: 0,
     response: {},
     successMsg: "",
   };
   const failureResponse = {
     responseCode: -1,
     response: {},
     errorMsg: "Something went wrong. Please Try Again Later",
   };
   let conn;
   try {
     conn = await sqlDb.doConnect(username);
     const sql = request.sql;
     const bindParams = request.bindParams;
     const rows = await sqlDb.executeSql(username,conn,sql,bindParams);
     if (rows && rows.length > 0) {
       await sqlDb.doRelease(username, conn);
       return Promise.resolve(successResponse);
     }else{
       failureResponse.errorMsg = "Item not found";
       await sqlDb.doRelease(username, conn);
       return Promise.resolve(failureResponse);
     }   
   } catch (err) {
     logger.error(`${username}: ${filename}:${functionName}: Error Received : `, err);
     await sqlDb.doRelease(username, conn);
     failureResponse.errorMsg = err.message;
     logger.error(`${username}: ${filename}:${functionName}: Response Sent : `, failureResponse);
     return Promise.reject(failureResponse);
   }
 };
 
 commonDB.createRowWithReturn = async ( username, request) => {
   const functionName = "createRowWithReturn";
   const successResponse = {
     responseCode: 0,
     response: {},
     successMsg: "",
   };
   const failureResponse = {
     responseCode: -1,
     response: {},
     errorMsg: "Something went wrong. Please Try Again Later",
   };
   
   let conn;
   try {
     conn = await sqlDb.doConnect(username);
     const sql = request.sql;
     const bindParams = request.bindParams;
     const rows = await sqlDb.executeSql(username,conn,sql,bindParams);
     successResponse.response.returnParam = rows.insertId;
     await sqlDb.doRelease(username, conn);
     return Promise.resolve(successResponse);
   } catch (err) {
     logger.error(`${username}: ${filename}:${functionName}: Error Received : `, err);
     await sqlDb.doRelease(username, conn);
     failureResponse.errorMsg = err.message;
     logger.error(`${username}: ${filename}:${functionName}: Response Sent : `, failureResponse);
     return Promise.reject(failureResponse);
   }
 };
 
 commonDB.updateTable = async ( username, request) => {
   const functionName = "updateTable";
   const successResponse = {
     responseCode: 0,
     response: {},
     successMsg: "",
   };
   const failureResponse = {
     responseCode: -1,
     response: {},
     errorMsg: "Something went wrong. Please Try Again Later",
   };
   
   let conn;
   try {
     conn = await sqlDb.doConnect(username);
     const sql = request.sql;
     const bindParams = request.bindParams;
     await sqlDb.executeSql(username,conn,sql,bindParams);
     await sqlDb.doRelease(username, conn);
     return Promise.resolve(successResponse);
   } catch (err) {
     logger.error(`${username}: ${filename}:${functionName}: Error Received : `, err);
     await sqlDb.doRelease(username, conn);
     failureResponse.errorMsg = err.message;
     logger.error(`${username}: ${filename}:${functionName}: Response Sent : `, failureResponse);
     return Promise.reject(failureResponse);
   }
 };
 
 commonDB.deleteTable = async (username, request) => {
  const functionName = "deleteTable";
  const successResponse = {
    responseCode: 0,
    response: {},
    successMsg: "",
  };
  const failureResponse = {
    responseCode: -1,
    response: {},
    errorMsg: "Something went wrong. Please Try Again Later",
  };
  
  let conn;
  try {
    conn = await sqlDb.doConnect(username);
    const sql = request.sql;
    const bindParams = request.bindParams;
    await sqlDb.executeSql(username, conn, sql, bindParams);
    await sqlDb.doRelease(username, conn);
    return Promise.resolve(successResponse);
  } catch (err) {
    logger.error(`${username}: ${filename}:${functionName}: Error Received : `, err);
    await sqlDb.doRelease(username, conn);
    failureResponse.errorMsg = err.message;
    logger.error(`${username}: ${filename}:${functionName}: Response Sent : `, failureResponse);
    return Promise.reject(failureResponse);
  }
};

module.exports = commonDB; 