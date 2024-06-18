import mongoose, { Document, Schema, Model } from 'mongoose';

interface IUserModel extends Document {
  id: String,
  status: Number,
  mail: String,
  lang: String
}

const UserModelSchema: Schema<IUserModel> = new Schema({
  id: { type: String, required: true },
  status: { type: Number, required: true },
  mail: { type: String, required: true },
  lang: { type: String, required: true }
});

const UserModel: Model<IUserModel> = mongoose.model<IUserModel>('Users', UserModelSchema);

export default UserModel;