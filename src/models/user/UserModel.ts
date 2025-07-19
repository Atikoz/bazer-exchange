import { model, Schema } from "mongoose";

const UserModel = new Schema({
  id: { type: String, required: true, unique: true },
  bazerId: { type: String, required: true, unique: true },
  status: { type: Number, default: 0 },
  mail: { type: String, default: null, sparse: true },
  lang: { type: String, default: 'eng' },
  accessToken: { type: String, default: null, sparse: true },
  refreshToken: { type: String, default: null, sparse: true },
  lastActivity: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true }
},
  {
    timestamps: true
  });

const User = model('Users', UserModel);

export default User;