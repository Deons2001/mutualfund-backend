const mongoose = require('mongoose');
const startNavUpdater = require('../jobs/navUpdater'); // import the cron job

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');
    startNavUpdater(); // ✅ start cron job here
  } catch (err) {
    console.error('DB connect failed', err.message);
    throw err;
  }
}

module.exports = connectDB;
