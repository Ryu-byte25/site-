const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav-links');
toggle.addEventListener('click', () => {
  const open = toggle.getAttribute('aria-expanded') !== 'true';
  toggle.setAttribute('aria-expanded', String(open));
  nav.classList.toggle('open', open);
});
nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  nav.classList.remove('open');
  toggle.setAttribute('aria-expanded', 'false');
}));
const form = document.querySelector('#demo-form');
form.addEventListener('submit', event => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  const data = new FormData(form);
  const message = `SiteVoxa demo request\n\nName: ${data.get('name')}\nWork email: ${data.get('email')}\nCompany: ${data.get('company')}\nWhat we'd like to manage better: ${data.get('message') || 'Not specified'}`;
  document.querySelector('#request-text').value = message;
  const result = document.querySelector('#form-result');
  result.hidden = false;
  result.scrollIntoView({behavior: 'smooth', block: 'nearest'});
});
document.querySelector('#copy-request').addEventListener('click', async () => {
  const field = document.querySelector('#request-text');
  const status = document.querySelector('#copy-status');
  try { await navigator.clipboard.writeText(field.value); status.textContent = 'Copied'; }
  catch { field.focus(); field.select(); status.textContent = 'Select and copy the message above'; }
});
