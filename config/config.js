/*
 *******************************************************************************
 *
 * %name:  config.js %
 * %derived_by:  Rakesh Bhandarkar  %
 *
 * %version:  1 %
 * %release:  sunset_rocks_backend/1.0 %
 * %date_modified:  Fri Aug 1 22:14:32 2022 %
 *
 * Date          By             Description
 * ------------  -----------    -----------
 * Aug 01, 2025  Rakesh B       created
 *******************************************************************************
 */
/*jshint esversion: 6 */
'use strict';
const winston = require("winston");
const packageJson = require("../package.json");
const moment = require("moment");
const path = require("path");
const config = {};
/*
 **********************************************************
 * DO NOT CHANGE THE CONFIGURATION ITEMS SERVER AND LOG
 * THESE ARE USED BY THE library
 **********************************************************
 */
/**
 * Basic App Configuration.
 */
config.APP_VERSION = packageJson.version; // app version is read from package.json
config.APP_TITLE = packageJson.description; // app title is read from package.json
config.APP_STARTUP_FILE = "activate.js"; // start-up file, Don't change this configuration

config.SERVER = {
  PORT: 9000, // Port that application server will run on. If this is changed, the Passenger command's --port parameter has to match this.
  MIN_INSTANCES: 1, // Number of clusters the app will have. This should be (no. of CPU cores - 1), and the Passenger command's --min-instances parameter has to match this.
  MAX_POOL_SIZE: 10, // Maximum number of instances that will be maintained in a static pool, and the Passenger command's --max-pool-size parameter has to match this.
  FRIENDLY_ERROR_PAGES: false, // Set to `true` to show Passenger's friendly error page, which contains a lot of information that can help in debugging.
  ENVIRONMENT: "production",
  TIMEOUT: 0,
};

(config.MSSQL = {
  server: "sunset-rocks.database.windows.net",
  user: "CloudSA03ab2b6b@sunset-rocks",
  password: "Sunset-rocks",
  database: "Sunset_DB",
  options: {
    encrypt: true,
    trustServerCertificate: false
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
});

config.LOG = {
  FILENAME: "./logs/activate", // Main log file's path and name. `FORMAT` is appended to `FILENAME`.
  FORMAT: "MMdd.log", // Date pattern in filename. Allowed tokens are yy, yyyy, M, MM, d, dd, H, HH, m, mm.
  PRETTY_PRINT: false, // Set to `true` if util.inspect should be used on metadata. Helps in debugging.
  CONSOLE_PRINT: false, // Set to `true` if output should also additionally be printed on console.
  JSON: false, // Set to `true` if log file should be in JSON format. Helps when log data needs to be consumed by external service like Loggly.
  COLORIZE: false, // Set to `true` if output should be colorized. Use only when `CONSOLE_PRINT` is also set to `true`.
  TIMESTAMP: function () {
    return moment().format("DD-MM-YYYY HH:mm:ss.SSS");
  }, // Set to `true` to include timestamp in log.
  LEVEL: "debug", // Logging level; allowed values are 'silly' (lowest), 'verbose', 'debug', 'info', 'warn', 'error' (highest).
  MAXSIZE: 500000000, // 500MB  maxsize option which will rotate the logfile when it exceeds a certain size in bytes.
};

winston.add(require("winston-daily-rotate-file"), {
  filename: config.LOG.FILENAME,
  name: "mainLog", // Internal name for logging instance.
  datePattern: config.LOG.FORMAT,
  handleExceptions: true, // Automatically log all unhandled exceptions.
  exitOnError: false, // Set to `true` to exit the application on any unhandled exception. Not recommended.
  prettyPrint: config.LOG.PRETTY_PRINT,
  silent: config.LOG.CONSOLE_PRINT,
  humanReadableUnhandledException: true, // Set to `true` to print clean stacktrace.
  json: config.LOG.JSON,
  colorize: config.LOG.COLORIZE,
  timestamp: config.LOG.TIMESTAMP,
  level: config.LOG.LEVEL,
  maxsize: config.LOG.MAXSIZE,
  localTime: true,
});

config.logger = winston;

config.auth = {
  SECRET: "B*#han&560!)usI"
};

config.azureDetails = {
  azureTenantId: "b27e4987-a6db-4535-ba90-75df3e9b49a1",
  azureClientId: "bce0ceed-5125-46fe-b8c2-655e51d8191a",
  clientSecret: "SFf8Q~0q2YZydSbsV7n-D~IRGRnCr0bF8mLBEczS",
};

config.setting = {
  backendendUrl: "https://72646cb3d829.ngrok-free.app"
};

module.exports = config;