const sendMessage = require("./tgFunction");


async function sendLogs(text) {
  try {
    console.log(text);
    sendMessage('@p2plogss', `${text}`, { parseMode: 'html' });
  } catch (error) {
    console.error(error)
  }
};

module.exports = sendLogs;