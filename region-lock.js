// SiteVoxa pricing region lock.
// Visitors are assigned a market automatically; no manual market selector is shown.
(() => {
  const detectMarket = () => {
    const locale = String(navigator.language || '').toLowerCase();
    let timeZone = '';
    try { timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch {}
    return locale.endsWith('-ng') || timeZone === 'Africa/Lagos' ? 'nigeria' : 'international';
  };

  const lockMarket = () => {
    const market = detectMarket();
    const button = document.querySelector(`[data-market="${market}"]`);
    if (button) button.click();

    const switcher = document.querySelector('.market-switcher-wrap');
    if (switcher) switcher.remove();

    document.documentElement.dataset.pricingMarket = market;
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(lockMarket, 0));
  } else {
    setTimeout(lockMarket, 0);
  }
})();
