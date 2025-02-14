const stateHandlers = require("./states");


async function stateHandler(bot, ctx, state) {
  const match = stateHandlers.find(({ range }) => state >= range[0] && state <= range[1]);
  const handler = match ? match.handler : null;

  if (handler) {
    await handler(bot, ctx, state);
  }
};

module.exports = stateHandler;