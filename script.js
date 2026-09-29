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

const form = document.querySelector('#demo-form');
if (form) {
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const message = `SiteVoxa demo request\n\nName: ${data.get('name')}\nWork email: ${data.get('email')}\nCompany: ${data.get('company')}\nWhat we'd like to manage better: ${data.get('message') || 'Not specified'}`;
    const requestText = document.querySelector('#request-text');
    const result = document.querySelector('#form-result');
    if (requestText) requestText.value = message;
    if (result) {
      result.hidden = false;
      result.scrollIntoView({behavior: reduceMotion ? 'auto' : 'smooth', block: 'nearest'});
    }
  });
}

const copyButton = document.querySelector('#copy-request');
if (copyButton) copyButton.addEventListener('click', async () => {
  const field = document.querySelector('#request-text');
  const status = document.querySelector('#copy-status');
  if (!field || !status) return;
  try { await navigator.clipboard.writeText(field.value); status.textContent = 'Copied'; }
  catch { field.focus(); field.select(); status.textContent = 'Select and copy the message above'; }
});