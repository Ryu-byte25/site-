(() => {
  const API_BASE_URL = 'https://sitevoxa.onrender.com';
  const NIGERIA_PRICES = {
    monthly: ['₦40,000', '₦80,000', '₦150,000'],
    annual: ['₦400,000', '₦800,000', '₦1,500,000'],
  };

  // Load checkout session hardening without requiring another index.html edit.
  const hardening = document.createElement('script');
  hardening.src = 'checkout-fixes.js';
  hardening.defer = true;
  document.head.appendChild(hardening);

  function applyNigeriaPricing() {
    if (document.documentElement.dataset.pricingMarket !== 'nigeria') return;
    const annualActive = document.querySelector('[data-billing="annual"]')?.classList.contains('active');
    const cycle = annualActive ? 'annual' : 'monthly';
    const values = NIGERIA_PRICES[cycle];
    const nodes = [...document.querySelectorAll('[data-monthly][data-annual]')];
    nodes.forEach((node, index) => {
      if (values[index] && node.textContent !== values[index]) node.textContent = values[index];
    });

    // Keep the checkout summary consistent with the server-authoritative Nigerian price.
    const summary = document.querySelector('#checkout-summary');
    if (summary && summary.textContent) {
      const planNames = ['Starter', 'Professional', 'Business'];
      const index = planNames.findIndex(name => summary.textContent.startsWith(name));
      if (index >= 0) {
        summary.textContent = `${planNames[index]} · ${values[index]} ${cycle === 'annual' ? 'per year' : 'per month'} · Nigeria`;
      }
    }
  }

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
      applyNigeriaPricing();

      if (market === 'nigeria') {
        document.querySelectorAll('[data-billing], .plan-cta').forEach(element => {
          element.addEventListener('click', () => setTimeout(applyNigeriaPricing, 0));
        });
        const observer = new MutationObserver(() => applyNigeriaPricing());
        const pricing = document.querySelector('#pricing');
        if (pricing) observer.observe(pricing, { subtree: true, childList: true, characterData: true });
        const checkout = document.querySelector('.checkout-modal');
        if (checkout) observer.observe(checkout, { subtree: true, childList: true, characterData: true });
      }
    } catch (error) {
      console.warn('SiteVoxa pricing market lookup unavailable; checkout will still enforce server-side pricing.', error);
      document.querySelector('.market-switcher-wrap')?.remove();
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', syncPricingMarket, { once: true });
  else syncPricingMarket();
})();
