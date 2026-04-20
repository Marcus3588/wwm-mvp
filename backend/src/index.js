require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const logger = require('./config/logger');
const errorHandler = require('./middleware/errorHandler');
const { initFirebase } = require('./config/firebase');

const authRoutes = require('./routes/auth');
const packageRoutes = require('./routes/packages');
const bookingRoutes = require('./routes/bookings');
const vendorRoutes = require('./routes/vendors');
const adminRoutes = require('./routes/admin');
const paymentsRoutes = require('./routes/payments');
const configRoutes = require('./routes/config');
const ratingsRoutes = require('./routes/ratings');
const disputesRoutes = require('./routes/disputes');
const vendorMatchingRoutes = require('./routes/vendorMatching');

const app = express();

initFirebase();

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || '*', credentials: true }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));


const paymentsWebhook = require('./routes/payments-webhook');
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }), paymentsWebhook);

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/config', configRoutes);
app.use('/api/ratings', ratingsRoutes);
app.use('/api/disputes', disputesRoutes);
app.use('/api/vendor-matching', vendorMatchingRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use(errorHandler);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  logger.info(`WWM API running on port ${PORT}`);
});
