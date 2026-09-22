const CFG = window.NK_CONFIG || {};
const API_URL = CFG.API_BASE_URL || 'http://localhost:5001/api';
const SOCIALS = CFG.SOCIALS || {};
const BRAND = CFG.BRAND || {};

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

const SOCIAL_META = [
  { key: 'instagram', icon: 'fa-instagram', label: 'Instagram' },
  { key: 'behance',   icon: 'fa-behance',   label: 'Behance' },
  { key: 'pinterest', icon: 'fa-pinterest', label: 'Pinterest' },
  { key: 'tiktok',    icon: 'fa-tiktok',    label: 'TikTok' }
];

function renderSocials() {
  const wrap = $('#contact-socials');
  if (!wrap) return;
  wrap.innerHTML = SOCIAL_META.map(s => `
    <a href="${SOCIALS[s.key] || '#'}" target="_blank" rel="noopener" aria-label="${s.label}">
      <i class="fa-brands ${s.icon}"></i>
    </a>
  `).join('');
}

function fillContactInfo() {
  const email = $('[data-contact="email"]');
  const phone = $('[data-contact="phone"]');
  const location = $('[data-contact="location"]');
  if (email) email.textContent = BRAND.email || email.textContent;
  if (phone) phone.textContent = BRAND.phone || phone.textContent;
  if (location) location.textContent = BRAND.location || location.textContent;
}

const TILE_BG = {
  portrait: 'linear-gradient(135deg, #2a1f14 0%, #c9a24b 140%)',
  wedding:  'linear-gradient(135deg, #1e1a26 0%, #8a6c3a 140%)',
  fashion:  'linear-gradient(135deg, #0f0f0f 0%, #c9a24b 160%)',
  family:   'linear-gradient(135deg, #201c19 0%, #b08a4a 140%)',
  event:    'linear-gradient(135deg, #1a1410 0%, #d4b06a 140%)'
};

function createTile(item) {
  const bg = TILE_BG[item.image] || TILE_BG.portrait;
  return '<article class="gallery-tile" data-category="' + item.category + '">' +
    '<div class="gallery-tile-bg" style="background: ' + bg + ';"></div>' +
    '<div class="tile-content">' +
      '<p class="tile-category">' + item.category + '</p>' +
      '<h3 class="tile-title">' + item.title + '</h3>' +
      '<p class="tile-location">' + item.location + ' · ' + item.year + '</p>' +
    '</div>' +
  '</article>';
}

async function loadGallery(category) {
  category = category || 'All';
  const grid = $('#gallery');
  if (!grid) return;
  try {
    const url = (category && category !== 'All')
      ? API_URL + '/gallery?category=' + encodeURIComponent(category)
      : API_URL + '/gallery';
    const res = await fetch(url);
    const items = await res.json();
    if (!items.length) {
      grid.innerHTML = '<p style="color:var(--grey);grid-column:1/-1;text-align:center;padding:40px 0;">No work in this category yet.</p>';
      return;
    }
    grid.innerHTML = items.map(createTile).join('');
  } catch (e) {
    grid.innerHTML = '<p style="color:var(--grey);grid-column:1/-1;text-align:center;padding:40px 0;">Could not load portfolio.</p>';
    console.error(e);
  }
}

function bindFilters() {
  $$('.filter').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.filter').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      loadGallery(btn.dataset.cat);
    });
  });
}

function createServiceCard(s) {
  return '<article class="service-card">' +
    '<div class="service-icon"><i class="fa-solid ' + s.icon + '"></i></div>' +
    '<h3 class="service-name">' + s.name + '</h3>' +
    '<p class="service-tagline">' + s.tagline + '</p>' +
    '<div class="service-meta">' +
      '<span class="service-duration">' + s.duration + '</span>' +
      '<span class="service-price">$' + s.price + '<span> from</span></span>' +
    '</div>' +
    '<ul class="service-features">' +
      s.features.map(f => '<li><i class="fa-solid fa-check"></i>' + f + '</li>').join('') +
    '</ul>' +
    '<a href="#bookingForm" class="service-btn" data-service="' + s.name + '">' +
      'Book this <i class="fa-solid fa-arrow-right"></i>' +
    '</a>' +
  '</article>';
}

async function loadServices() {
  const grid = $('#services-list');
  if (!grid) return;
  try {
    const res = await fetch(API_URL + '/services');
    const services = await res.json();
    grid.innerHTML = services.map(createServiceCard).join('');
    bindServiceButtons();
  } catch (e) {
    grid.innerHTML = '<p style="color:var(--grey);grid-column:1/-1;text-align:center;padding:40px 0;">Could not load services.</p>';
    console.error(e);
  }
}

function bindServiceButtons() {
  $$('.service-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const name = btn.dataset.service;
      const select = $('#service');
      if (select) {
        const opt = [...select.options].find(o => o.value === name);
        if (opt) select.value = name;
      }
    });
  });
}

let currentBooking = null;
let paymentInfo = null;

async function loadPaymentInfo() {
  try {
    const res = await fetch(API_URL + '/payment-info');
    paymentInfo = await res.json();
  } catch (e) {
    console.error('Could not load payment info', e);
  }
}

function bindBookingForm() {
  const form = $('#bookingForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const btn = $('#submitBtn');
    const original = btn.innerHTML;

    const payload = {
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      phone: form.phone.value.trim(),
      service: form.service.value,
      date: form.date.value,
      location: form.location.value.trim(),
      message: form.message.value.trim()
    };

    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending...';

    try {
      const res = await fetch(API_URL + '/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong');

      currentBooking = data.booking;

      const services = await fetch(API_URL + '/services').then(r => r.json());
      const svc = services.find(s => s.name === currentBooking.service);
      const depositPercent = (paymentInfo && paymentInfo.depositPercent) ? paymentInfo.depositPercent : 50;
      const deposit = svc ? Math.round(svc.price * depositPercent / 100) : '';

      form.hidden = true;
      const paymentScreen = $('#paymentScreen');
      const paidThanks = $('#paidThanks');
      if (paymentScreen) paymentScreen.hidden = false;
      if (paidThanks) paidThanks.hidden = true;

      if ($('#paymentMessage')) $('#paymentMessage').textContent = data.message;
      if ($('#paymentRef')) $('#paymentRef').textContent = currentBooking.id;
      if ($('#depositAmount')) {
        $('#depositAmount').textContent = deposit ? ('$' + deposit) : ('(' + depositPercent + '% of session)');
      }
      if ($('#momoNumber')) $('#momoNumber').textContent = (paymentInfo && paymentInfo.momoNumber) || '—';
      if ($('#momoName')) $('#momoName').textContent = (paymentInfo && paymentInfo.momoName) || '—';
      if ($('#momoProvider')) $('#momoProvider').textContent = (paymentInfo && paymentInfo.momoProvider) || '—';

      if (paymentScreen) {
        paymentScreen.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } catch (err) {
      alert('Booking failed: ' + err.message);
      btn.disabled = false;
      btn.innerHTML = original;
    }
  });

  const paidBtn = $('#iHavePaidBtn');
  if (paidBtn) {
    paidBtn.addEventListener('click', async () => {
      if (!currentBooking) return;
      const original = paidBtn.innerHTML;
      paidBtn.disabled = true;
      paidBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Confirming...';

      try {
        await fetch(API_URL + '/bookings/' + currentBooking.id + '/paid', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' }
        });

        const paymentScreen = $('#paymentScreen');
        const paidThanks = $('#paidThanks');
        if (paymentScreen) paymentScreen.hidden = true;
        if (paidThanks) paidThanks.hidden = false;
        if (paidThanks) paidThanks.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } catch (e) {
        alert('Could not confirm payment. Please try again.');
        paidBtn.disabled = false;
        paidBtn.innerHTML = original;
      }
    });
  }

  const skipBtn = $('#skipPaymentBtn');
  if (skipBtn) {
    skipBtn.addEventListener('click', () => {
      const paymentScreen = $('#paymentScreen');
      const paidThanks = $('#paidThanks');
      if (paymentScreen) paymentScreen.hidden = true;
      if (paidThanks) paidThanks.hidden = false;
    });
  }

  const resetBtn = $('#resetFormBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      form.reset();
      form.hidden = false;
      const paymentScreen = $('#paymentScreen');
      const paidThanks = $('#paidThanks');
      if (paymentScreen) paymentScreen.hidden = true;
      if (paidThanks) paidThanks.hidden = true;
      currentBooking = null;
      form.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  renderSocials();
  fillContactInfo();
  bindFilters();
  loadGallery();
  loadServices();
  loadPaymentInfo();
  bindBookingForm();
});