/* ============================================================
   NK BLAQ STUDIO — ADMIN ROUTES (simple, bulletproof)
   ============================================================ */

const { getAllBookings } = require('./bookings');

function requireAdmin(req, res, next) {
  const password = req.headers['x-admin-password'];
  const expected = process.env.ADMIN_PASSWORD || 'nkblaq2025';

  if (!password || password !== expected) {
    return res.status(401).json({ error: 'Unauthorized. Wrong password.' });
  }
  next();
}

function registerAdminRoutes(app) {
  /* -------- Verify password -------- */
  app.post('/api/admin/login', (req, res) => {
    try {
      const { password } = req.body || {};
      const expected = process.env.ADMIN_PASSWORD || 'nkblaq2025';

      if (password === expected) {
        return res.json({ success: true, message: 'Welcome, boss.' });
      }
      res.status(401).json({ success: false, error: 'Wrong password.' });
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({ error: 'Server error during login.' });
    }
  });

  /* -------- Get all bookings -----inal--- */
  app.get('/api/admin/bookings', requireAdmin, (req, res) => {
    try {
      const all = getAllBookings();
      console.log(`✅ Admin fetched bookings. Total: ${all.length}`);

      const sorted = [...all].sort((a, b) =>
        new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      );
      res.json(sorted);
    } catch (err) {
      console.error('❌ Error fetching bookings:', err);
      res.status(500).json({ error: 'Server error while fetching bookings.' });
    }
  });

  /* -------- Update booking status -------- */
  app.patch('/api/admin/bookings/:id', requireAdmin, (req, res) => {
    try {
      const all = getAllBookings();
      const booking = all.find(b => b.id === req.params.id);
      if (!booking) return res.status(404).json({ error: 'Booking not found.' });

      const { status } = req.body || {};
      if (['new', 'confirmed', 'cancelled'].includes(status)) {
        booking.status = status;
      }
      res.json(booking);
    } catch (err) {
      console.error('❌ Error updating booking:', err);
      res.status(500).json({ error: 'Server error while updating booking.' });
    }
  });

  /* -------- Delete booking -------- */
  app.delete('/api/admin/bookings/:id', requireAdmin, (req, res) => {
    try {
      const all = getAllBookings();
      const idx = all.findIndex(b => b.id === req.params.id);
      if (idx === -1) return res.status(404).json({ error: 'Booking not found.' });

      all.splice(idx, 1);
      res.json({ success: true });
    } catch (err) {
      console.error('❌ Error deleting booking:', err);
      res.status(500).json({ error: 'Server error while deleting booking.' });
    }
  });
}

module.exports = { registerAdminRoutes };