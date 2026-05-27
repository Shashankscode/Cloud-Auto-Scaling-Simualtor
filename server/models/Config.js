const mongoose = require('mongoose');

const ConfigSchema = new mongoose.Schema({
  HighThreshold: {
    type: Number,
    required: true,
    default: 100
  },
  LowThreshold: {
    type: Number,
    required: true,
    default: 20
  },
  MaxServers: {
    type: Number,
    required: true,
    default: 5
  },
  MinServers: {
    type: Number,
    required: true,
    default: 1
  },
  Cooldown: {
    type: Number,
    required: true,
    default: 30
  }
});

module.exports = mongoose.model('Config', ConfigSchema);
