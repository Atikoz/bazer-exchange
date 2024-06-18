import mongoose, { Document, Schema, Model } from 'mongoose';

// Інтерфейс для документа моделі HashSendAdminComission
interface IHashSendAdminComission extends Document {
  id: string;
  hash: string;
  status: string;
  amount: number;
  coin: string;
}

// Схема для моделі HashSendAdminComission
const HashSendAdminComissionSchema: Schema<IHashSendAdminComission> = new Schema({
  id: { type: String, required: true },
  hash: { type: String, required: true },
  status: { type: String, required: true },
  amount: { type: Number, required: true },
  coin: { type: String, required: true }
});

// Модель HashSendAdminComission
const HashSendAdminComissionModel: Model<IHashSendAdminComission> = mongoose.model<IHashSendAdminComission>('Hash-SendAdmin-Comission', HashSendAdminComissionSchema);

export default HashSendAdminComissionModel;
