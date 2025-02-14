function generateDualLiqPoolButton(bot, arrayElement, nameCallback, page) {
  const IK = [];
  arrayElement.map((e, i) => {
    if (i % 2 === 0) {
      IK.push([bot.inlineButton(`${e}`, { callback: `${nameCallback}_${e}` })]);
    } else {
      IK[Math.floor(i / 2)].push(bot.inlineButton(`${e}`, { callback: `${nameCallback}_${e}` }));
    }
  });

  if (page === 1) {
    IK.push([bot.inlineButton(`Page ${2}`, { callback: `${nameCallback}_Page_${2}` })]);
  }
  else if (page === 4) {
    IK.push([bot.inlineButton(`Page ${3}`, { callback: `${nameCallback}_Page_${3}` })]);
  }
  else {
    IK.push([bot.inlineButton(`Page ${page - 1}`, { callback: `${nameCallback}_Page_${page - 1}` }), bot.inlineButton(`Page ${page + 1}`, { callback: `${nameCallback}_Page_${page + 1}` })]);
  }

  return bot.inlineKeyboard(IK);
};

module.exports = generateDualLiqPoolButton;