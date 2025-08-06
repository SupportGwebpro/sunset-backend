/*
 *******************************************************************************
 *
 * %name:  sunsetRocks.js %
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
const useragent = require('express-useragent');
const config = require("./config/config");
const app = express();
const database = require("./db/ms_sql");
const port = process.env.PORT || config.SERVER.PORT;
const environment = process.env.NODE_ENV || config.SERVER.ENVIRONMENT;
const logger = config.logger;
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
let server;
const loginRoute = require("./routes/login/login_route");
const path = require("path");
const cors = require('cors');
const fs = require('fs');
app.use(cors());
app.use(express.static('public'));

if (logger.loggers.default.transports.length > 0) {
  if (logger.loggers.default.transports[0].name === "console" && environment === "production" && !config.LOG.CONSOLE_PRINT) {
    try {
      logger.remove(logger.transports.Console);
    } catch (err) {
      logger.error(err.message);
    }
  }
}
global.appRoot = path.resolve(__dirname);

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin,X-Requested-With,Content-Type,Accept,username,apiname,Authorization");
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Common middleware.
app.use(
  bodyParser.urlencoded({
    extended: "true",
  })
);
app.use(fileUpload());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    extended: true,
    parameterLimit: 50000,
  })
);
app.use(require("./middleware/common_middleware"));
app.use(express.static(__dirname + "/public")); // set the static files location /public/img will be /img for users

app.disable("x-powered-by");
app.enable("trust proxy"); //Enable only when behind nginx.

app.set("title", config.APP_TITLE);
app.set("version", config.APP_VERSION);
app.set("port", port);
app.set("env", environment);

// routes for User Case Rest Api 
app.use("/", loginRoute);
app.use(useragent.express());

const startServer = () => {
  return new Promise((resolve, reject) => {
    logger.info("SERVER - Starting process...", {
      title: app.get("title"),
      version: app.get("version"),
      port: app.get("port"),
      NODE_ENV: app.get("env"),
      pid: process.pid,
    });
    server = app.listen(app.get("port"), () => {
      logger.info("App listening on port " + port);
      server.timeout = config.SERVER.TIMEOUT;
      resolve(server);
    });
    server.on('error', reject);
  });
};

const startInstance = async () => {
  try {
    console.log("Pool to be Initialized");
    await database.init();
    console.log("Pool has been Initialized");
    const httpServer = await startServer();
    return httpServer;
  } catch (err) {
    logger.error("Failed to start app:",err);
  }
};

module.exports = startInstance().then(server => {
  return server;
});

const shutdown = async () => {
  try {
    logger.info("Shutting down ");
    await database.terminateConnection();
    process.exit(0);
  } catch (err) {
    console.log(err);
    process.exit(0);
  }
};

// If the Node process ends, close the orawrap connection & the Express server.
process.on("SIGINT", function () {
  logger.error("SIGINT Received");
  shutdown();
});

/* istanbul ignore next */
process.on("SIGTERM", function () {
  logger.error("SIGTERM Received");
  shutdown();
});

process.on("exit", function () {
  logger.error("Exit Received");
});

process.on("uncaughtException", function (err) {
  logger.error("Error occurred: " + err.stack);
  shutdown();
});