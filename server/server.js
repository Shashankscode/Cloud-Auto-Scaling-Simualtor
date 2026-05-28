require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const EventLog = require('./models/EventLog');

const app = express();
app.use(cors());
app.use(express.json());

// --- MONGODB CONNECTION ---
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch((err) => console.error('MongoDB connection error:', err));

// --- ENGINE ALGORITHMIC CONFIGURATION ---
let config = {
  highThreshold: 100, // Scale up if moving average >= 100 RPM
  lowThreshold: 20,   // Scale down if moving average <= 20 RPM
  maxServers: 5,
  minServers: 1,
  cooldown: 3000      // 3-second cooldown between auto-scaling events
};

let trafficHistory = []; // The core Queue data structure
let activeServersQueue = [{ id: 'Server-1', status: 'active' }];
let idleServersQueue = [
  { id: 'Server-2', status: 'idle' },
  { id: 'Server-3', status: 'idle' },
  { id: 'Server-4', status: 'idle' },
  { id: 'Server-5', status: 'idle' }
];

let lastScaleTime = 0; 
let persistentActionState = 'System Ready';

// Algorithmic Moving Average Calculator
const calculateAverageRPM = () => {
  if (trafficHistory.length === 0) return 0;
  const sum = trafficHistory.reduce((a, b) => a + b, 0);
  return Math.round(sum / trafficHistory.length);
};

const logEvent = async (rpm, action) => {
  try {
    const log = new EventLog({
      rpm,
      action,
      activeServersCount: activeServersQueue.length,
      idleServersCount: idleServersQueue.length
    });
    await log.save();
  } catch (error) {
    console.error("Failed to write log to MongoDB", error);
  }
};

// --- CORE SIMULATION ROUTE ---
app.post('/api/traffic', async (req, res) => {
  const { currentRpm } = req.body;
  
  // Manage the Queue data structure (FIFO)
  trafficHistory.push(currentRpm);
  if (trafficHistory.length > 5) {
    trafficHistory.shift(); // Enforce strict sliding window size of 5
  }

  const avgRpm = calculateAverageRPM();
  const now = Date.now();

  // Evaluate auto-scaling thresholds if cooldown has expired
  if (now - lastScaleTime > config.cooldown) {
    
    if (avgRpm >= config.highThreshold && idleServersQueue.length > 0) {
      const serverToActivate = idleServersQueue.shift(); 
      serverToActivate.status = 'active';
      activeServersQueue.push(serverToActivate); 
      persistentActionState = 'Scale Up Triggered';
      lastScaleTime = now;
      await logEvent(avgRpm, persistentActionState);
    } 
    else if (avgRpm <= config.lowThreshold && activeServersQueue.length > config.minServers) {
      const serverToDeactivate = activeServersQueue.pop(); 
      serverToDeactivate.status = 'idle';
      idleServersQueue.push(serverToDeactivate); 
      persistentActionState = 'Scale Down Triggered';
      lastScaleTime = now;
      await logEvent(avgRpm, persistentActionState);
    } 
    else {
      persistentActionState = 'Normal Operation';
    }
  }

  // CRITICAL FIX: Sending the raw trafficHistory array back to the UI
  res.json({
    avgRpm,
    activeServers: activeServersQueue,
    idleServers: idleServersQueue,
    actionTaken: persistentActionState,
    config,
    trafficQueue: trafficHistory 
  });
});

app.get('/api/logs', async (req, res) => {
  try {
    const logs = await EventLog.find().sort({ timestamp: -1 }).limit(20);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

app.post('/api/config', (req, res) => {
  config = { ...config, ...req.body };
  res.json({ message: 'Configuration updated', config });
});

const path = require('path');

// 1. Serve static files from the React 'dist' folder
app.use(express.static(path.join(__dirname, '../client/dist')));

// 2. Any request that doesn't match an API route should serve index.html
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Strict Mathematical Engine running on port ${PORT}`));

