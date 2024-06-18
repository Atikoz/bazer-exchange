import sendMessage from "./sendMessage";

async function sendLogs(text: string): Promise<void> {
  try {
    console.log(text);
    sendMessage('@p2plogss', `${text}`);
  } catch (error) {
    console.error(error);
  }
}

export default sendLogs;
