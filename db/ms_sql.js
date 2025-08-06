const config = require("../config/config");
const sql = require("mssql");
const logger = config.logger;

let pool;

const sqlDb = {};

sqlDb.init = async () => {
  try {
    pool = await sql.connect(config.MSSQL); // config.MSSQL must be defined
    console.log("MSSQL Pool Initialized");
    return pool;
  } catch (err) {
    console.error("Error initializing MSSQL pool", err);
    throw err;
  }
};

sqlDb.doConnect = async (userId) => {
  try {
    const connection = await pool.connect();
    return connection;
  } catch (err) {
    logger.error(`${userId}: Getting Connection from Pool : Failed`, err);
    throw err;
  }
};

sqlDb.beginTransaction = async (userId, connection) => {
  try {
    const transaction = new sql.Transaction(connection);
    await transaction.begin();
    return transaction;
  } catch (err) {
    logger.error(`${userId}: Transaction Begins : Failed`, err);
    throw err;
  }
};

sqlDb.doCommit = async (userId, transaction) => {
  try {
    await transaction.commit();
  } catch (err) {
    logger.error(`${userId}: Executing Commit : Failed`, err);
    throw err;
  }
};

sqlDb.doRollback = async (userId, transaction) => {
  try {
    await transaction.rollback();
    logger.info(`${userId}: Executing Rollback : Success`);
  } catch (err) {
    logger.error(`${userId}: Executing Rollback : Failed`, err);
    throw err;
  }
};

sqlDb.doRelease = async (userId, connection) => {
  try {
    // No release needed — mssql handles connection pool cleanup
    return;
  } catch (err) {
    logger.warn(`${userId}: Release skipped`);
  }
};

sqlDb.terminateConnection = async () => {
  try {
    await pool.close();
    console.log("MSSQL Pool Terminated Successfully");
  } catch (err) {
    console.error("Failed to terminate MSSQL pool", err);
    throw err;
  }
};

sqlDb.executeSql = async (userId, conn, sqlText, bindParameters = []) => {
  try {
    const request = conn.request();
    // Replace each `?` with @param1, @param2, ... and bind values
    let paramIndex = 1;
    sqlText = sqlText.replace(/\?/g, () => `@param${paramIndex++}`);
    // Reset index for binding
    bindParameters.forEach((value, index) => {
      request.input(`param${index + 1}`, value);
    });
    logger.info(`${userId}: Executing SQL : ${sqlText}`);
    const result = await request.query(sqlText);
    return result.recordset;
  } catch (err) {
    logger.error(`${userId}: Failed to Execute SQL`, JSON.stringify(err));
    throw err;
  }
};

module.exports = sqlDb;