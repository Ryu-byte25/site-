(() => {
  // Customers never choose their pricing region manually. The backend-driven
  // pricing-market.js remains the source of truth for what is displayed.
  const hideMarketSwitcher = () => {
    document.querySelectorAll('.market-switcher-wrap,[data-market]').forEach(el => { el.style.display = 'none'; });
  };
  hideMarketSwitcher();
  new MutationObserver(hideMarketSwitcher).observe(document.documentElement, { childList: true, subtree: true });

  // Preserve the authenticated checkout session across the Paystack redirect.
  // We observe successful auth responses without changing the existing checkout flow.
  const originalFetch = window.fetch.bind(window);
  window.fetch = async (...args) => {
    const response = await originalFetch(...args);
    try {
      const url = String(args[0] || '');
      if (url.includes('/api/auth/login') && response.ok) {
        const clone = response.clone();
        const body = await clone.json();
        const token = body?.data?.token;
        if (token) sessionStorage.setItem('sitevoxa-checkout-token', token);
      }
    } catch { /* checkout continues normally */ }
    return response;
  };
})();
