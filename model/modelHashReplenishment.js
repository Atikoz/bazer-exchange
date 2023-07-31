const mongoose = require('mongoose');

const HashReplenishment = mongoose.model('HashReplenishment', {
  id: String,
  coin: String,
});

module.exports = HashReplenishment;