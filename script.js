const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav-links');
if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('open', open);
  });
  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    nav.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  }));
}

const header = document.querySelector('.site-header');
const setHeader = () => header?.classList.toggle('scrolled', window.scrollY > 16);
setHeader();
window.addEventListener('scroll', setHeader, { passive: true });

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const revealItems = document.querySelectorAll('.reveal');
if (reduceMotion || !('IntersectionObserver' in window)) {
  revealItems.forEach(el => el.classList.add('in-view'));
} else {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });
  revealItems.forEach(el => observer.observe(el));
}

const heroVisual = document.querySelector('.hero-visual');
const appWindow = document.querySelector('.app-window');
if (heroVisual && appWindow && !reduceMotion && window.matchMedia('(pointer:fine)').matches) {
  heroVisual.addEventListener('mousemove', event => {
    const rect = heroVisual.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    appWindow.style.transform = `rotate(${-1.3 + x * 1.5}deg) perspective(1000px) rotateX(${y * -3}deg) rotateY(${x * 3}deg)`;
  });
  heroVisual.addEventListener('mouseleave', () => { appWindow.style.transform = 'rotate(-1.3deg)'; });
}

// -----------------------------------------------------------------------------
// Regional pricing
// Nigeria uses deliberate local-market pricing rather than live FX conversion.
// International visitors see USD. Visitors can always override the detection.
// -----------------------------------------------------------------------------
const PRICING = {
  international: {
    label: 'International',
    currency: 'USD',
    monthly: ['$399.99', '$799.99', '$1,499.99'],
    annual: ['$3,999', '$7,999', '$14,999'],
  },
  nigeria: {
    label: 'Nigeria',
    currency: 'NGN',
    monthly: ['₦399,000', '₦799,000', '₦1,499,000'],
    annual: ['₦3,990,000', '₦7,990,000', '₦14,990,000'],
  },
};

let activeBilling = 'monthly';
let activeMarket = 'international';

const billingButtons = document.querySelectorAll('[data-billing]');
const priceNodes = [...document.querySelectorAll('[data-monthly][data-annual]')];
const periodNodes = document.querySelectorAll('[data-period]');
const pricingHead = document.querySelector('.pricing-head');

function detectInitialMarket() {
  const saved = localStorage.getItem('sitevoxa-pricing-market');
  if (saved && PRICING[saved]) return saved;

  const locale = String(navigator.language || '').toLowerCase();
  let timeZone = '';
  try { timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch { /* no-op */ }

  return locale.endsWith('-ng') || timeZone === 'Africa/Lagos'
    ? 'nigeria'
    : 'international';
}

function renderPricing() {
  const market = PRICING[activeMarket];
  const values = market[activeBilling];

  priceNodes.forEach((node, index) => {
    if (values[index]) node.textContent = values[index];
  });

  periodNodes.forEach(node => {
    node.textContent = activeBilling === 'annual' ? '/ year' : '/ month';
  });

  document.querySelectorAll('[data-market]').forEach(button => {
    const active = button.dataset.market === activeMarket;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });

  const marketNote = document.querySelector('#pricing-market-note');
  if (marketNote) {
    marketNote.textContent = activeMarket === 'nigeria'
      ? 'Local pricing for customers billed in Nigeria (NGN).'
      : 'International pricing in USD.';
  }
}

if (pricingHead && priceNodes.length) {
  const marketSwitcher = document.createElement('div');
  marketSwitcher.className = 'market-switcher-wrap';
  marketSwitcher.innerHTML = `
    <div class="market-switcher" role="group" aria-label="Pricing region">
      <button type="button" data-market="nigeria" aria-pressed="false">Nigeria <span>₦</span></button>
      <button type="button" data-market="international" aria-pressed="false">International <span>$</span></button>
    </div>
    <p id="pricing-market-note" class="market-note"></p>
  `;

  const billingToggle = pricingHead.querySelector('.billing-toggle');
  if (billingToggle) pricingHead.insertBefore(marketSwitcher, billingToggle);
  else pricingHead.appendChild(marketSwitcher);

  const regionalStyle = document.createElement('style');
  regionalStyle.textContent = `
    .market-switcher-wrap{margin:24px 0 14px;display:flex;flex-direction:column;align-items:center;gap:8px}
    .market-switcher{display:inline-flex;padding:4px;border:1px solid rgba(9,37,29,.14);border-radius:999px;background:rgba(255,255,255,.72);box-shadow:0 8px 28px rgba(9,37,29,.06)}
    .market-switcher button{border:0;background:transparent;color:#52635d;padding:10px 16px;border-radius:999px;font:inherit;font-size:13px;font-weight:700;cursor:pointer;transition:background .2s ease,color .2s ease,transform .2s ease}
    .market-switcher button:hover{transform:translateY(-1px)}
    .market-switcher button.active{background:#09251d;color:#fff}
    .market-switcher button span{opacity:.72;margin-left:3px}
    .market-note{margin:0!important;font-size:12px!important;color:#708079!important}
    @media(max-width:560px){.market-switcher{width:100%;max-width:330px}.market-switcher button{flex:1;padding:10px 9px}}
  `;
  document.head.appendChild(regionalStyle);

  activeMarket = detectInitialMarket();
  document.querySelectorAll('[data-market]').forEach(button => {
    button.addEventListener('click', () => {
      activeMarket = button.dataset.market;
      localStorage.setItem('sitevoxa-pricing-market', activeMarket);
      renderPricing();
    });
  });
}

billingButtons.forEach(button => button.addEventListener('click', () => {
  activeBilling = button.dataset.billing === 'annual' ? 'annual' : 'monthly';
  billingButtons.forEach(btn => btn.classList.toggle('active', btn === button));
  renderPricing();
}));

renderPricing();

const API_BASE_URL = 'https://sitevoxa.onrender.com';
const form = document.querySelector('#demo-form');

if (form) {
  const submitButton = form.querySelector('button[type="submit"]');
  const formNote = form.querySelector('.form-note');
  const result = document.querySelector('#form-result');

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const data = new FormData(form);
    const payload = {
      name: String(data.get('name') || '').trim(),
      email: String(data.get('email') || '').trim(),
      company: String(data.get('company') || '').trim(),
      message: String(data.get('message') || '').trim(),
    };

    const originalLabel = submitButton?.innerHTML;
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Sending request…';
    }
    if (formNote) formNote.textContent = 'Sending your request securely to SiteVoxa…';
    if (result) result.hidden = true;

    try {
      const response = await fetch(`${API_BASE_URL}/api/leads/demo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      let body = {};
      try { body = await response.json(); } catch { body = {}; }
      if (!response.ok) throw new Error(body.message || 'Unable to submit your request right now.');

      form.reset();
      if (formNote) formNote.textContent = body.message || "Demo request received. We'll be in touch shortly.";
      if (result) {
        result.hidden = false;
        result.innerHTML = `<strong>Demo request received.</strong><p>Thanks — your details are now with the SiteVoxa team. We'll contact you using the work email you provided.</p>`;
        result.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'nearest' });
      }
    } catch (error) {
      if (formNote) formNote.textContent = error.message || 'Something went wrong. Please try again.';
      if (result) {
        result.hidden = false;
        result.innerHTML = `<strong>We couldn't send your request.</strong><p>${error.message || 'Please try again in a moment.'}</p>`;
      }
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.innerHTML = originalLabel || 'Request demo';
      }
    }
  });
}