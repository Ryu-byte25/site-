(() => {
  const API_BASE_URL = 'https://sitevoxa.onrender.com';

  // Load checkout session hardening without requiring another index.html edit.
  const hardening = document.createElement('script');
  hardening.src = 'checkout-fixes.js';
  hardening.defer = true;
  document.head.appendChild(hardening);

  async function syncPricingMarket() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/payments/market`, {
        method: 'GET', headers: { Accept: 'application/json' }, cache: 'no-store',
      });
      if (!response.ok) throw new Error(`Market lookup failed: ${response.status}`);
      const body = await response.json();
      const market = body?.pricing?.market;
      if (market !== 'nigeria' && market !== 'international') return;
      const marketButton = document.querySelector(`[data-market="${market}"]`);
      if (marketButton) marketButton.click();
      document.querySelector('.market-switcher-wrap')?.remove();
      document.documentElement.dataset.pricingMarket = market;
      document.documentElement.dataset.pricingCountry = body?.pricing?.country || '';
    } catch (error) {
      console.warn('SiteVoxa pricing market lookup unavailable; checkout will still enforce server-side pricing.', error);
      document.querySelector('.market-switcher-wrap')?.remove();
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', syncPricingMarket, { once: true });
  else syncPricingMarket();
})();
