const mongoose = require('mongoose');

const EventLogSchema = new mongoose.Schema({
  timestamp: { 
    type: Date, 
    default: Date.now // This is critical, or the frontend crashes trying to format an empty date!
  },
  rpm: Number,
  action: String,
  activeServersCount: Number,
  idleServersCount: Number
});

module.exports = mongoose.model('EventLog', EventLogSchema);