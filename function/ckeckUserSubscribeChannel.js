const { getChatMember } = require("../helpers/tgFunction");

const chackUserSubscribeChannel = async (userId) => {
  const channels = [
    '@p2plogss',
    '@linkproject7765',
    '@EXPLORER11_bot1',
    '@bazer_projects_info',
    '@decimalrewardchart',
    '@minterbazer',
    '@Minter_Chat_Rewardss'
  ];

  let result = {
    status: true,
    data: []
  };

  for (const channel of channels) {
    try {
      const member = await getChatMember(channel, userId);

      if (!(member.status === 'member' || member.status === 'administrator' || member.status === 'creator')) {
        result.status = false;
        result.data.push(channel);
      }
    } catch (error) {
      result.status = false;
      result.data.push(channel);
    }
  }

  return result;
};

module.exports = chackUserSubscribeChannel;
