require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { gallery, services } = require('./gallery');
const { addBooking, getAllBookings } = require('./bookings');
const { registerAdminRoutes } = require('./admin');
const { sendClientConfirmation, sendAdminAlert } = require('./mailer');

const app = express();
const PORT = process.env.PORT || 5001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3001';

/* ---------- Middleware ---------- */
app.use(cors({
  origin: true ,
  credentials: false
}));
app.use(express.json());

/* ---------- Admin routes ---------- */
registerAdminRoutes(app);

/* ---------- Root ---------- */
app.get('/', (req, res) => {
  res.json({
    name: 'NK Blaq Studio API',
    status: 'live',
    endpoints: {
      gallery:     'GET  /api/gallery',
      services:    'GET  /api/services',
      book:        'POST /api/bookings',
      bookings:    'GET  /api/bookings',
      markPaid:    'PATCH /api/bookings/:id/paid',
      paymentInfo: 'GET  /api/payment-info',
      admin:       'GET  /api/admin/bookings'
    }
  });
});

/* ---------- Gallery ---------- */
app.get('/api/gallery', (req, res) => {
  const { category } = req.query;
  if (category && category !== 'All') {
    return res.json(gallery.filter(g => g.category === category));
  }
  res.json(gallery);
});

app.get('/api/gallery/:id', (req, res) => {
  const item = gallery.find(g => g.id === parseInt(req.params.id));
  if (!item) return res.status(404).json({ error: 'Image not found' });
  res.json(item);
});

/* ---------- Services ---------- */
app.get('/api/services', (req, res) => res.json(services));

/* ---------- Payment Info (MoMo details) ---------- */
app.get('/api/payment-info', (req, res) => {
  res.json({
    momoName: process.env.MOMO_NAME || 'NK Blaq Studio',
    momoNumber: process.env.MOMO_NUMBER || '055 339 1790',
    momoProvider: process.env.MOMO_PROVIDER || 'MTN MoMo',
    depositPercent: parseInt(process.env.DEPOSIT_PERCENT || '50', 10)
  });
});

/* ---------- Bookings ---------- */
app.post('/api/bookings', async (req, res) => {
  const { name, email, phone, service, date, location, message } = req.body;

  if (!name || !email || !service || !date) {
    return res.status(400).json({
      error: 'Please fill in name, email, service and date.'
    });
  }

  const booking = {
    id: 'BK-' + Date.now().toString(36).toUpperCase(),
    name,
    email,
    phone: phone || '',
    service,
    date,
    location: location || '',
    message: message || '',
    payment: { method: 'momo', status: 'unpaid' },
    status: 'new',
    createdAt: new Date().toISOString()
  };

  addBooking(booking);
  console.log(`📸 New booking ${booking.id} | ${service} | ${date}`);

  // Send emails in the background — don't block the response
  Promise.allSettled([
    sendClientConfirmation(booking),
    sendAdminAlert(booking)
  ]).then(results => {
    results.forEach((r, i) => {
      if (r.status === 'rejected') {
        console.error(
          `📧 Email ${i === 0 ? 'client' : 'admin'} failed:`,
          r.reason.message
        );
      }
    });
  });

  res.status(201).json({
    success: true,
    message: `Thank you, ${name}! A confirmation has been sent to your email.`,
    booking
  });
});

app.get('/api/bookings', (req, res) => res.json(getAllBookings()));

/* ---------- Client marks as paid ---------- */
app.patch('/api/bookings/:id/paid', (req, res) => {
  const booking = getAllBookings().find(b => b.id === req.params.id);
  if (!booking) return res.status(404).json({ error: 'Booking not found.' });

  booking.payment = booking.payment || {};
  booking.payment.status = 'client_marked_paid';
  booking.payment.paidAt = new Date().toISOString();
  booking.payment.method = 'momo';

  console.log(`💰 ${booking.id} marked as PAID by client`);

  res.json({
    success: true,
    message: 'Thank you! We will verify your payment within a few hours.'
  });
});

/* ---------- Start ---------- */
app.listen(PORT, () => {
  console.log(`🖤 NK Blaq Studio API running at http://localhost:${PORT}`);
  console.log(`🌐 Accepting requests from ${FRONTEND_URL}`);
});