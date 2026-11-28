// Carry only public campaign labels. Preserve Stripe's existing checkout reference.
(() => {
  'use strict';
  const link = document.querySelector('a[data-tti-tracker-campaign]');
  if (!link) return;

  const query = new URLSearchParams(window.location.search);
  const source = query.get('utm_source');
  const medium = query.get('utm_medium');
  const campaign = 'first_sale_tracker';
  if (query.get('utm_campaign') !== campaign) return;
  const social = ['facebook', 'instagram', 'linkedin'].includes(source) &&
    ['organic_social', 'bio', 'dm'].includes(medium);
  if (!social && !(source === 'tti-bio' && medium === 'bio')) return;

  const target = new URL(link.href);
  const tracker = target.origin === window.location.origin &&
    target.pathname === '/ebooks.html' && target.hash === '#lead-leak-calculator';
  const checkout = target.origin === 'https://buy.stripe.com' &&
    target.searchParams.get('client_reference_id') === 'tti_ebooks_first_sale';
  if (!tracker && !checkout) return;

  target.searchParams.set('utm_source', source);
  target.searchParams.set('utm_medium', medium);
  target.searchParams.set('utm_campaign', campaign);
  link.href = target.href;
})();
