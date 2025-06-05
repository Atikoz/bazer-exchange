import { model, Schema } from "mongoose";

const HashReplenishmentSchema = new Schema({
  id: {
    type: String,
    required: true,
    uniq: true
  },
  coin: {
    type: String,
    required: true
  },
});

const HashReplenishment = model('HashReplenishment', HashReplenishmentSchema)

export default HashReplenishment;