import { model, Schema } from "mongoose";

const TransactionStatusSchema = new Schema({
  id: {
    type: String,
    required: true
  },
  hash: {
    type: String,
    required: true,
    uniq: true
  },
  status: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  processed: {
    type: Boolean,
    required: true
  },
});

const TransactionStatus = model('TransactionStatus', TransactionStatusSchema);

export default TransactionStatus;