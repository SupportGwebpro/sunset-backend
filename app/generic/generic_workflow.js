/*
 *******************************************************************************
 *
 * %name:  genric_workflow.js %
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
const genericWorkflow = {};
const config = require("../../config/config");
const logger = config.logger;
const commonModel = require("../common/common_model");
const filename = "genericWorkflow";
const api = require("../../lib/api");
const path = require('path');
const fs = require('file-system');

genericWorkflow.uploadFile = async (username, req, files) => {
  const functionName = "uploadFile";
  let apiResponse = createApiResponse(true,"",200,{});
  try {
    logger.info(`${username}: ${filename}:${functionName}: Enter`);
    if (files?.file?.name) {
      let fileName = files.file.name;
      let extension = path.parse(fileName).ext;
      let fileDir = './public/uploads/';
      let fileNameUploaded = api.generateFilename() + extension;
      let filePath = fileDir + '/' + fileNameUploaded;
      fs.writeFile(filePath, files.file.data, function (err) {
        if (err) {
          apiResponse.meta.status = false;
          apiResponse.meta.message = "Error saving file!!";
          return Promise.reject(apiResponse);
        }
      });
      apiResponse.data.fileUrl = config.setting.backendendUrl + '/uploads/'+fileNameUploaded;
      return Promise.resolve(apiResponse);
    } else {
      apiResponse.meta.status = false;
      apiResponse.meta.message = "File is missing!!";
      return Promise.reject(apiResponse);
    }
  } catch (err) {
    logger.error(`${username}: ${filename}:${functionName}: Response Sent :`,err);
    apiResponse.meta.status = false;
    apiResponse.meta.message = "Server Error";
    return Promise.reject(apiResponse);
  }
};

//only under by internal
genericWorkflow.checkManadatoryParamterExist = async(paramList, req) =>{
  let validationResponse = {
    validation: true,
    message: ""
  };
  for(let param of paramList) { 
    if(!req.hasOwnProperty(param)) {
      validationResponse.validation = false;
      validationResponse.message = `Parameter ${param} is mandatory`;
    }
  }
  return validationResponse;
}

function createApiResponse(status = true, message = "", code = 200, data = {}) {
  return {
    meta: { status, message, code },
    data,
  };
};

module.exports = genericWorkflow;