const config = require("../config");
const { sendMessage } = require("./tgFunction");


async function sendLogs(text) {
  try {
    if (config.APP_ENV === 'prod') {
      sendMessage('@p2plogss', `${text}`);
    }
    
    console.log(text);
  } catch (error) {
    console.error(error)
  }
};

module.exports = sendLogs;