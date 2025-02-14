const handlerPatterns = require("./handlers");


async function callbackHandler(bot, ctx) {
  const match = handlerPatterns.find(({ pattern }) => pattern.test(ctx.data));
  const handler = match ? match.handler : null;

  if (handler) {
    await handler(bot, ctx);
  }
};

module.exports = callbackHandler;