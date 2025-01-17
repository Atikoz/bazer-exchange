const { sendMessage } = require("./tgFunction");


async function sendLogs(text) {
  try {
    console.log(text);
    // sendMessage('@p2plogss', `${text}`);
  } catch (error) {
    console.error(error)
  }
};

module.exports = sendLogs;