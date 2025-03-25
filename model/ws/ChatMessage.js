const { model, Schema } = require('mongoose');


const ChatMessageSchema = new Schema({
  socketId: {
    type: String,
    required: true,
  },
  senderId: {
    type: Number,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
})

const ChatMessage = model('ChatMessage', ChatMessageSchema)

module.exports = ChatMessage;