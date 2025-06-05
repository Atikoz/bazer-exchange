import { model, Schema } from "mongoose";

const UserModel = new Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },

  status: {
    type: Number,
    default: 0
  },

  mail: {
    type: String,
    default: null
  },

  lang: {
    type: String,
    default: 'eng'
  }
});

const User = model('Users', UserModel);

export default User;