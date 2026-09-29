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

const billingButtons = document.querySelectorAll('[data-billing]');
const priceNodes = document.querySelectorAll('[data-monthly][data-annual]');
const periodNodes = document.querySelectorAll('[data-period]');
billingButtons.forEach(button => button.addEventListener('click', () => {
  const annual = button.dataset.billing === 'annual';
  billingButtons.forEach(btn => btn.classList.toggle('active', btn === button));
  priceNodes.forEach(node => { node.textContent = annual ? node.dataset.annual : node.dataset.monthly; });
  periodNodes.forEach(node => { node.textContent = annual ? '/ year' : '/ month'; });
}));

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