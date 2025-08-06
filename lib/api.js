const config = require("../config/config");
const logger = config.logger;
const api = {};
const fs = require("fs");
const _ = require("lodash");
const path = require("path");
const chance = require('chance').Chance();

const Status = {
  OK: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  UNSUPPORTED_ACTION: 405,
  VALIDATION_FAILED: 422,
  SERVER_ERROR: 500,
};

const jsonResponse = (res, body, options) => {
  options = options || {};
  options.status = options.status || Status.OK;
  res.status(options.status).json(body || 0);
};

api.ok = (req, res, data) => {
  if (req?.body?.timestamp) {
    data.timestamp = req.body.timestamp;
    logger.info("For Request Tracking", JSON.stringify(data));
  }
  jsonResponse(res, data, {
    status: Status.OK,
  });
};

api.okText = (req, res, data) => {
  res.status(Status.Ok).text(5);
};

api.serverError = function (req, res, data) {
  jsonResponse(res, data, {
    status: Status.SERVER_ERROR,
  });
};

api.unauthorized = function (req, res, data) {
  jsonResponse(res, data, {
    status: Status.UNAUTHORIZED,
  });
};

api.handleError = (promise) => {
  return promise.then((data) => [undefined, data]).catch((err) => [err, undefined]);
};

api.mergeTwoArraysUniquely = (arr1, arr2) => {
  let jointArray = [];
  jointArray = [...arr1, ...arr2];
  const uniqueArray = jointArray.filter((item, index) => {
    return jointArray.indexOf(item) === index;
  });
  return uniqueArray;
};

api.removeDuplicatesArrayObject = (arr1, arr2, attributeName) => {
  let jointArray = [...arr1, ...arr2];
  function removeDuplicates(array, key) {
    let lookup = {};
    return array.filter((element) => {
      if (!lookup[element[key]]) {
        lookup[element[key]] = true;
        return true;
      }
      return false;
    });
  }
  return removeDuplicates(jointArray, attributeName);
};

api.subtract2Arrays = (arr1, arr2) => {
  return _.differenceBy(arr1, arr2, "id");
};

api.checkFileExtensions = (username, files) => {
  return new Promise((resolve, reject) => {
    try {
      if (files) {
        const failureResponse = {
          responseCode: -1,
          response: {},
          errorMsg: "",
        };
        for (let file in files) {
          const extname = path.extname(files[file].name);
          if (extname != ".jpg" && extname != ".jpeg" && extname != ".png") {
            failureResponse.errorMsg = "Please upload images Only. Supported Formats: jpg, jpeg and png";
            logger.error(`${username}: common: checkFileExtensions: : Error Received :`, failureResponse);
            return reject(failureResponse);
          }
        }
      }
      return resolve();
    } catch (err) {
      return reject(err);
    }
  });
};

api.fetchFileNames = (files) => {
  let fileNamesStr = "";
  const fileNames = [];
  if (files) {
    const keyName = Object.keys(files);
    let i = 0;
    for (let file in files) {
      fileNames.push(`${keyName[i]} : ${files[file].name}`);
      i++;
    }
    fileNamesStr = fileNames.join(",");
  }
  return fileNamesStr;
};

api.uploadFile = (username, filePath, filename, file) => {
  return new Promise((resolve, reject) => {
    file.mv(`${filePath}${filename}`, async function (err) {
      if (err) {
        logger.error(`${username}: common: uploadFile: : Error Received :`, err);
        return reject();
      }
      logger.info(`${username}: common: File: ${filename}: Uploaded Successfully`);
      resolve();
    });
  });
};

api.deleteFile = (partnerId, filePath) => {
  return new Promise((resolve) => {
    fs.unlink(filePath, function (err) {
      if (err) {
        logger.error(`${partnerId}: common: deleteFile: : Error Received :`, err);
      }
      logger.info(`${partnerId}: common: File deleted Successfully`);
      return resolve();
    });
  });
};

api.shuffle = (array) => {
  let currentIndex = array.length;
  let temporaryValue;
  let randomIndex;
  while (0 !== currentIndex) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  return array;
};

api.IsJsonString = (str) => {
  try {
    JSON.parse(str);
  } catch (e) {
    logger.error(`${e.message}`);
    return false;
  }
  return true;
};

api.generateFilename = function() {
  return chance.string({
      length: 8,
      pool: '0123456789ABCDEF'
  }) + '-' + chance.string({
      length: 4,
      pool: '0123456789ABCDEF'
  });
};

module.exports = api;