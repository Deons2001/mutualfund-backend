require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');

const authRoutes = require('./routes/auth');
const portfolioRoutes = require('./routes/portfolio');
const fundRoutes = require('./routes/funds');
const startNavUpdater = require('./jobs/navUpdater'); // adjust path if needed

const app = express();
app.use(helmet());
app.use(express.json());
app.use(morgan('dev'));

const limiter = rateLimit({ windowMs: 60 * 1000, max: 120 });
app.use(limiter);

app.use('/api/auth', authRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/funds', fundRoutes);

app.use((err, req, res, next) => {
  console.error(err && err.stack ? err.stack : err);
  res.status(err.status || 500).json({ success: false, message: err.message || 'Server error' });
});

const PORT = process.env.PORT || 5000;

// DB connection and server start
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('MongoDB connected');
    startNavUpdater(); // start cron job after DB is ready
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  })
  .catch(err => console.error('DB connect failed', err.message));
