(() => {
  const API_BASE_URL = 'https://sitevoxa.onrender.com';

  async function syncPricingMarket() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/payments/market`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        cache: 'no-store',
      });

      if (!response.ok) throw new Error(`Market lookup failed: ${response.status}`);
      const body = await response.json();
      const market = body?.pricing?.market;
      if (market !== 'nigeria' && market !== 'international') return;

      // script.js owns activeMarket. Trigger its existing market control instead of
      // duplicating checkout state, so displayed pricing and checkout use one state.
      const marketButton = document.querySelector(`[data-market="${market}"]`);
      if (marketButton) marketButton.click();

      // Visitors must not manually switch pricing regions.
      document.querySelector('.market-switcher-wrap')?.remove();

      document.documentElement.dataset.pricingMarket = market;
      document.documentElement.dataset.pricingCountry = body?.pricing?.country || '';
    } catch (error) {
      console.warn('SiteVoxa pricing market lookup unavailable; checkout will still enforce server-side pricing.', error);
      // Do not expose a manual region override if lookup fails.
      document.querySelector('.market-switcher-wrap')?.remove();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', syncPricingMarket, { once: true });
  } else {
    syncPricingMarket();
  }
})();
