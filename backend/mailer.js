/* ============================================================
   NK BLAQ STUDIO — EMAIL SENDER
   Sends booking confirmation to client + alert to admin.
   Uses Nodemailer with Gmail App Password.
   ============================================================ */

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD
  }
});

/* ---------- Shared HTML wrapper ---------- */
function wrapHtml(bodyHtml) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { margin: 0; padding: 0; background: #0a0a0a; font-family: Georgia, serif; }
        .wrapper { max-width: 600px; margin: 0 auto; background: #121212; }
        .header {
          background: #0a0a0a;
          padding: 40px 32px;
          text-align: center;
          border-bottom: 1px solid #c9a24b;
        }
        .header .logo {
          display: inline-block;
          width: 60px; height: 60px;
          border-radius: 50%;
          border: 1px solid #c9a24b;
          color: #c9a24b;
          line-height: 58px;
          font-size: 18px;
          letter-spacing: 1px;
        }
        .header h1 {
          color: #f5f5f5;
          font-size: 22px;
          font-weight: 400;
          margin: 20px 0 4px;
          letter-spacing: 1px;
        }
        .header h1 em { color: #c9a24b; font-style: italic; }
        .header p {
          color: #6b6b6b;
          font-size: 11px;
          letter-spacing: 3px;
          text-transform: uppercase;
          margin: 0;
          font-family: Arial, sans-serif;
        }
        .content {
          padding: 40px 32px;
          color: #f5f5f5;
          font-family: Georgia, serif;
          line-height: 1.7;
        }
        .content h2 {
          color: #c9a24b;
          font-size: 24px;
          font-weight: 400;
          margin: 0 0 24px;
          font-style: italic;
        }
        .content p { color: #a8a8a8; font-size: 15px; margin: 0 0 16px; }
        .content strong { color: #f5f5f5; }

        .detail-box {
          background: #0a0a0a;
          border: 1px solid #c9a24b;
          padding: 24px;
          margin: 24px 0;
        }
        .detail-row {
          padding: 10px 0;
          border-bottom: 1px solid #1a1a1a;
          font-size: 14px;
        }
        .detail-row:last-child { border-bottom: none; }
        .detail-label {
          color: #6b6b6b;
          text-transform: uppercase;
          font-size: 11px;
          letter-spacing: 2px;
          font-family: Arial, sans-serif;
          display: block;
          margin-bottom: 4px;
        }
        .detail-value {
          color: #f5f5f5;
          font-family: Arial, sans-serif;
          font-size: 14px;
        }
        .detail-value.gold { color: #c9a24b; }

        .btn {
          display: inline-block;
          padding: 14px 28px;
          background: #c9a24b;
          color: #0a0a0a !important;
          text-decoration: none;
          font-size: 12px;
          letter-spacing: 3px;
          text-transform: uppercase;
          font-family: Arial, sans-serif;
          font-weight: bold;
        }
        .footer {
          background: #0a0a0a;
          padding: 32px;
          text-align: center;
          border-top: 1px solid #1a1a1a;
          color: #6b6b6b;
          font-size: 12px;
          font-family: Arial, sans-serif;
        }
        .footer a { color: #c9a24b; text-decoration: none; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="header">
          <div class="logo">NK</div>
          <h1>Blaq <em>Studio</em></h1>
          <p>Fine Art Photography</p>
        </div>
        <div class="content">
          ${bodyHtml}
        </div>
        <div class="footer">
          © 2025 NK Blaq Studio · Accra, Ghana<br>
          <a href="mailto:hello@nkblaqstudio.com">hello@nkblaqstudio.com</a>
        </div>
      </div>
    </body>
    </html>
  `;
}

/* ---------- Format date helper ---------- */
function formatDate(dateStr) {
  try {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'long', year: 'numeric'
    });
  } catch {
    return dateStr;
  }
}

/* ---------- Client confirmation email ---------- */
async function sendClientConfirmation(booking) {
  const bodyHtml = `
    <h2>Thank you, ${booking.name}.</h2>
    <p>
      Your session inquiry has been received. We're honoured you're
      considering NK Blaq Studio to tell your story.
    </p>
    <p>
      A member of our team will personally reply within
      <strong>24 hours</strong> to confirm availability and share next steps.
    </p>

    <div class="detail-box">
      <div class="detail-row">
        <span class="detail-label">Booking Ref</span>
        <span class="detail-value gold">${booking.id}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Session</span>
        <span class="detail-value">${booking.service}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Preferred Date</span>
        <span class="detail-value">${formatDate(booking.date)}</span>
      </div>
      ${booking.location ? `
      <div class="detail-row">
        <span class="detail-label">Location</span>
        <span class="detail-value">${booking.location}</span>
      </div>` : ''}
    </div>

    <p>
      If you need to reach us sooner, simply reply to this email or
      call <strong>+233 55 339 1790</strong>.
    </p>
    <p style="margin-top: 32px;">
      With warmth,<br>
      <em style="color: #c9a24b;">The NK Blaq Studio Team</em>
    </p>
  `;

  await transporter.sendMail({
    from: `"NK Blaq Studio" <${process.env.EMAIL_USER}>`,
    to: booking.email,
    subject: `Booking Received — ${booking.id} · NK Blaq Studio`,
    html: wrapHtml(bodyHtml)
  });

  console.log(`📧 Client email sent → ${booking.email}`);
}

/* ---------- Admin alert email ---------- */
async function sendAdminAlert(booking) {
  const bodyHtml = `
    <h2>New Booking Alert</h2>
    <p>A new session inquiry just came in. Here are the details:</p>

    <div class="detail-box">
      <div class="detail-row">
        <span class="detail-label">Booking Ref</span>
        <span class="detail-value gold">${booking.id}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Name</span>
        <span class="detail-value">${booking.name}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Email</span>
        <span class="detail-value">
          <a href="mailto:${booking.email}" style="color:#c9a24b;">${booking.email}</a>
        </span>
      </div>
      ${booking.phone ? `
      <div class="detail-row">
        <span class="detail-label">Phone</span>
        <span class="detail-value">
          <a href="tel:${booking.phone}" style="color:#c9a24b;">${booking.phone}</a>
        </span>
      </div>` : ''}
      <div class="detail-row">
        <span class="detail-label">Session</span>
        <span class="detail-value">${booking.service}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Date</span>
        <span class="detail-value">${formatDate(booking.date)}</span>
      </div>
      ${booking.location ? `
      <div class="detail-row">
        <span class="detail-label">Location</span>
        <span class="detail-value">${booking.location}</span>
      </div>` : ''}
    </div>

    ${booking.message ? `
      <p style="font-style: italic; padding: 16px; background: #0a0a0a; border-left: 3px solid #c9a24b;">
        "${booking.message}"
      </p>
    ` : ''}

    <p style="margin-top: 32px;">
      <a href="http://localhost:3001/admin.html" class="btn">
        Open Admin Dashboard
      </a>
    </p>
  `;

  await transporter.sendMail({
    from: `"NK Blaq Studio" <${process.env.EMAIL_USER}>`,
    to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
    subject: `📸 New Booking — ${booking.name} (${booking.service})`,
    html: wrapHtml(bodyHtml)
  });

  console.log(
    `📧 Admin email sent → ${process.env.ADMIN_EMAIL || process.env.EMAIL_USER}`
  );
}

module.exports = { sendClientConfirmation, sendAdminAlert };