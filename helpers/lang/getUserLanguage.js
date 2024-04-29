const UserModel = require("../../model/modelUser");

const getUserLanguage = async (userId) => {
  try {
    const user = await UserModel.findOne({ id: userId });
    const selectLang = user.lang;

    return selectLang
  } catch (error) {
    console.error(error.message);
  }
}

module.exports = getUserLanguage;