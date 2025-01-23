const UserModel = require("../model/user/modelUser")

async function setState(id, status) {
  try {
    await UserModel.findOneAndUpdate(
      { id: id },
      { status: status }
    )
  } catch (error) {
    console.error(`error change state: ${error.message}`)
  }
};

module.exports = setState