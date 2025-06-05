import { Schema, model } from "mongoose";

const CrossfiUserReplenishmentSchema = new Schema({
  id: {
    type: Number,
    required: true
  },
  
  hash: {
    type: String,
    required: true,
    uniq: true
  },

  coin: {
    type: String,
    required: true
  },

  amount: {
    type: Number,
    required: true
  }
})

const CrossfiUserReplenishment = model('replenishment-crossfi', CrossfiUserReplenishmentSchema)

export default CrossfiUserReplenishment;