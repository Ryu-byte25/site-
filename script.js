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

// -----------------------------------------------------------------------------
// Customer checkout
// Plan prices remain authoritative on the SiteVoxa backend. The website sends
// only the selected plan, market and billing cycle.
// -----------------------------------------------------------------------------
const CHECKOUT_PLANS = ['starter', 'professional', 'business'];
let pendingCheckout = null;

const checkoutStyle = document.createElement('style');
checkoutStyle.textContent = `
  .checkout-modal[hidden]{display:none!important}.checkout-modal{position:fixed;inset:0;z-index:9999;display:grid;place-items:center;padding:20px;background:rgba(3,20,15,.72);backdrop-filter:blur(10px)}
  .checkout-dialog{position:relative;width:min(520px,100%);max-height:calc(100vh - 40px);overflow:auto;background:#fff;border:1px solid rgba(9,37,29,.12);border-radius:28px;padding:30px;box-shadow:0 30px 90px rgba(0,0,0,.28)}
  .checkout-close{position:absolute;top:18px;right:18px;width:38px;height:38px;border:0;border-radius:50%;background:#eef3f0;color:#09251d;font-size:22px;cursor:pointer}.checkout-kicker{font-size:11px;font-weight:800;letter-spacing:.16em;color:#0c6b4f}.checkout-dialog h3{margin:8px 42px 8px 0;font:800 28px/1.15 Manrope,sans-serif;color:#09251d}.checkout-summary{margin:0 0 22px;color:#66766f;font-size:14px}.checkout-tabs{display:flex;padding:4px;background:#eef3f0;border-radius:14px;margin-bottom:20px}.checkout-tabs button{flex:1;border:0;border-radius:10px;padding:10px;background:transparent;font:700 13px DM Sans,sans-serif;color:#5b6d66;cursor:pointer}.checkout-tabs button.active{background:#fff;color:#09251d;box-shadow:0 3px 12px rgba(9,37,29,.08)}
  .checkout-form{display:grid;gap:13px}.checkout-form[hidden]{display:none}.checkout-form label{display:grid;gap:6px;font-size:12px;font-weight:700;color:#213a32}.checkout-form input{width:100%;box-sizing:border-box;border:1px solid #d6e0dc;border-radius:12px;padding:13px 14px;font:500 14px DM Sans,sans-serif;outline:none}.checkout-form input:focus{border-color:#0c6b4f;box-shadow:0 0 0 3px rgba(12,107,79,.1)}.checkout-submit{margin-top:5px;border:0;border-radius:999px;padding:14px 18px;background:#0b684d;color:#fff;font:800 14px DM Sans,sans-serif;cursor:pointer}.checkout-submit:disabled{opacity:.55;cursor:wait}.checkout-status{min-height:20px;margin:2px 0 0;font-size:12px;color:#687871}.checkout-status.error{color:#a13232}.checkout-security{margin:17px 0 0;padding-top:16px;border-top:1px solid #e5ece9;font-size:11px;line-height:1.5;color:#71817a}.plan-cta.checkout-ready{cursor:pointer}
  @media(max-width:560px){.checkout-dialog{padding:24px 18px;border-radius:22px}.checkout-dialog h3{font-size:24px}}
`;
document.head.appendChild(checkoutStyle);

const checkoutModal = document.createElement('div');
checkoutModal.className = 'checkout-modal';
checkoutModal.hidden = true;
checkoutModal.innerHTML = `
  <div class="checkout-dialog" role="dialog" aria-modal="true" aria-labelledby="checkout-title">
    <button class="checkout-close" type="button" aria-label="Close checkout">×</button>
    <span class="checkout-kicker">SECURE CHECKOUT</span>
    <h3 id="checkout-title">Continue with SiteVoxa</h3>
    <p class="checkout-summary" id="checkout-summary"></p>
    <div class="checkout-tabs" role="tablist">
      <button type="button" class="active" data-checkout-tab="login">I have an account</button>
      <button type="button" data-checkout-tab="register">Create account</button>
    </div>
    <form class="checkout-form" id="checkout-login">
      <label>Email<input name="email" type="email" autocomplete="email" required></label>
      <label>Password<input name="password" type="password" autocomplete="current-password" required></label>
      <button class="checkout-submit" type="submit">Continue to secure payment →</button>
      <p class="checkout-status" role="status"></p>
    </form>
    <form class="checkout-form" id="checkout-register" hidden>
      <label>Company name<input name="companyName" autocomplete="organization" required></label>
      <label>First name<input name="firstName" autocomplete="given-name" required></label>
      <label>Last name<input name="lastName" autocomplete="family-name" required></label>
      <label>Work email<input name="email" type="email" autocomplete="email" required></label>
      <label>Password<input name="password" type="password" autocomplete="new-password" minlength="8" required placeholder="At least 8 characters"></label>
      <button class="checkout-submit" type="submit">Create account & continue →</button>
      <p class="checkout-status" role="status"></p>
    </form>
    <p class="checkout-security">Your selected amount is resolved by the SiteVoxa backend. Payment is completed on Paystack and the subscription is activated only after server-side verification.</p>
  </div>`;
document.body.appendChild(checkoutModal);

function checkoutLabel() {
  if (!pendingCheckout) return '';
  const market = PRICING[pendingCheckout.market];
  const index = CHECKOUT_PLANS.indexOf(pendingCheckout.planId);
  const amount = market?.[pendingCheckout.billingCycle]?.[index] || '';
  const name = pendingCheckout.planId.charAt(0).toUpperCase() + pendingCheckout.planId.slice(1);
  return `${name} · ${amount} ${pendingCheckout.billingCycle === 'annual' ? 'per year' : 'per month'} · ${market?.label || ''}`;
}

function openCheckout(planId) {
  pendingCheckout = { planId, market: activeMarket, billingCycle: activeBilling };
  document.querySelector('#checkout-summary').textContent = checkoutLabel();
  checkoutModal.hidden = false;
  document.body.style.overflow = 'hidden';
  setTimeout(() => checkoutModal.querySelector('input')?.focus(), 30);
}

function closeCheckout() {
  checkoutModal.hidden = true;
  document.body.style.overflow = '';
  checkoutModal.querySelectorAll('.checkout-status').forEach(node => { node.textContent = ''; node.classList.remove('error'); });
}

checkoutModal.querySelector('.checkout-close').addEventListener('click', closeCheckout);
checkoutModal.addEventListener('click', event => { if (event.target === checkoutModal) closeCheckout(); });
document.addEventListener('keydown', event => { if (event.key === 'Escape' && !checkoutModal.hidden) closeCheckout(); });

checkoutModal.querySelectorAll('[data-checkout-tab]').forEach(button => {
  button.addEventListener('click', () => {
    const tab = button.dataset.checkoutTab;
    checkoutModal.querySelectorAll('[data-checkout-tab]').forEach(btn => btn.classList.toggle('active', btn === button));
    document.querySelector('#checkout-login').hidden = tab !== 'login';
    document.querySelector('#checkout-register').hidden = tab !== 'register';
    checkoutModal.querySelector(`#checkout-${tab} input`)?.focus();
  });
});

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, options);
  let body = {};
  try { body = await response.json(); } catch { body = {}; }
  if (!response.ok) throw new Error(body.message || 'Unable to continue right now.');
  return body;
}

async function loginForCheckout(email, password) {
  const body = await apiRequest('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const token = body?.data?.token;
  if (!token) throw new Error('Login succeeded but no checkout token was returned.');
  return token;
}

async function beginPaystackCheckout(token) {
  if (!pendingCheckout) throw new Error('Please select a plan again.');
  const body = await apiRequest('/api/payments/checkout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(pendingCheckout),
  });
  const authorizationUrl = body?.checkout?.authorizationUrl;
  if (!authorizationUrl) throw new Error('Payment checkout could not be created.');
  window.location.assign(authorizationUrl);
}

const loginForm = document.querySelector('#checkout-login');
loginForm.addEventListener('submit', async event => {
  event.preventDefault();
  if (!loginForm.reportValidity()) return;
  const data = new FormData(loginForm);
  const status = loginForm.querySelector('.checkout-status');
  const button = loginForm.querySelector('.checkout-submit');
  status.classList.remove('error'); status.textContent = 'Signing in…'; button.disabled = true;
  try {
    const token = await loginForCheckout(String(data.get('email')).trim(), String(data.get('password')));
    status.textContent = 'Opening secure Paystack checkout…';
    await beginPaystackCheckout(token);
  } catch (error) {
    status.classList.add('error'); status.textContent = error.message; button.disabled = false;
  }
});

const registerForm = document.querySelector('#checkout-register');
registerForm.addEventListener('submit', async event => {
  event.preventDefault();
  if (!registerForm.reportValidity()) return;
  const data = new FormData(registerForm);
  const status = registerForm.querySelector('.checkout-status');
  const button = registerForm.querySelector('.checkout-submit');
  const email = String(data.get('email')).trim();
  const password = String(data.get('password'));
  status.classList.remove('error'); status.textContent = 'Creating your SiteVoxa workspace…'; button.disabled = true;
  try {
    await apiRequest('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        companyName: String(data.get('companyName')).trim(),
        firstName: String(data.get('firstName')).trim(),
        lastName: String(data.get('lastName')).trim(),
        email,
        companyEmail: email,
        password,
      }),
    });
    status.textContent = 'Account created. Opening secure payment…';
    const token = await loginForCheckout(email, password);
    await beginPaystackCheckout(token);
  } catch (error) {
    status.classList.add('error'); status.textContent = error.message; button.disabled = false;
  }
});

document.querySelectorAll('.pricing-card').forEach((card, index) => {
  const planId = CHECKOUT_PLANS[index];
  const cta = card.querySelector('.plan-cta');
  if (!cta || !planId) return;
  cta.textContent = `Choose ${planId.charAt(0).toUpperCase() + planId.slice(1)}`;
  cta.href = '#pricing';
  cta.classList.add('checkout-ready');
  cta.addEventListener('click', event => {
    event.preventDefault();
    openCheckout(planId);
  });
});

const paymentNote = document.querySelector('.payment-note');
if (paymentNote) paymentNote.textContent = 'Secure checkout powered by Paystack. SiteVoxa verifies successful payments on the backend before activating a subscription.';
