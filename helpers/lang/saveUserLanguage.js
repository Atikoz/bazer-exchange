const UserModel = require("../../model/modelUser");

const saveUserLanguage = async (userId, lang) => {
  try {    
    await UserModel.updateOne(
      { id: userId },
      { $set: { lang: lang } }
    )
  } catch (error) {
    console.error(error.message);
  }
}

module.exports = saveUserLanguage;