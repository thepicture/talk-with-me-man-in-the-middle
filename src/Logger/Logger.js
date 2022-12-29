const colors = require("colors/safe");

class Logger {
  static log = (id, message) => {
    const colorDispatcher = id % 2 === 0 ? colors.green : colors.yellow;

    console.log(
      colorDispatcher(`[${id}] [${new Date().toISOString()}] ${message}`)
    );
  };
}

module.exports = {
  Logger,
};
