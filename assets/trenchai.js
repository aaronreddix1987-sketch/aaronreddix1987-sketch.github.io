(() => {
  'use strict';
  const id = name => document.getElementById(name);
  const types = { deed: 'Tax deed', foreclosure: 'Foreclosure', lien: 'Tax lien', finance: 'Owner financing' };
  const statuses = ['To verify', 'In review', 'Reviewed', 'Passed'];
  const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
  const node = (tag, value = '', className = '') => {
    const el = document.createElement(tag);
    el.textContent = value;
    if (className) el.className = className;
    return el;
  };

  const filter = id('trench-filter');
  const sourceCards = [...document.querySelectorAll('[data-source]')];
  filter.addEventListener('click', event => {
    const selected = event.target.closest('[data-filter]');
    if (!selected) return;
    const type = selected.dataset.filter;
    filter.querySelectorAll('[data-filter]').forEach(button =>
      button.setAttribute('aria-pressed', String(button === selected))
    );
    let matches = 0;
    sourceCards.forEach(card => {
      card.hidden = type !== 'all' && card.dataset.source !== type;
      if (!card.hidden) matches++;
    });
    id('trench-source-status').textContent = `${matches} official ${matches === 1 ? 'reference' : 'references'}`;
  });
  filter.hidden = false;

  const calc = id('trench-calc');
  const calcType = id('deal-type');
  const calcInputs = id('trench-inputs');
  const calcResult = id('trench-calc-result');
  // A field is [name, visible label, minimum, maximum, step, required].
  const dollars = (name, label, required = false) => [name, label, 0, 1000000000, 0.01, required];
  const months = (name, label, required = true) => [name, label, 1, 600, 1, required];
  const rate = (label, required = true) => ['rate', label, 0, 100, 0.01, required];
  const auctionFields = [
    dollars('budget', 'All-in spending limit ($)', true),
    dollars('costs', 'Other costs and reserves ($)', true),
    ['fee', 'Bid-based fees (%)', 0, 100, 0.01, false],
    dollars('bid', 'Proposed bid ($, optional)'),
  ];
  const modes = {
    deed: {
      fields: auctionFields,
      title: 'Tax deed purchase cap',
      help: 'Check taxes, assessments, title and transfer charges. Include repairs, holding costs and a cushion in other costs. Enter 0 only for a confirmed zero cost.',
    },
    foreclosure: {
      fields: auctionFields,
      title: 'Foreclosure purchase cap',
      help: 'Check for senior liens, possession, title and repairs. Include all expected costs and a reserve outside the bid. Enter 0 only for a confirmed zero cost.',
    },
    lien: {
      fields: [
        dollars('principal', 'Lien principal eligible for interest ($)', true),
        rate('Assumed annual simple rate (%)'),
        months('term', 'Assumed redemption time (months)'),
        dollars('costs', 'Non-reimbursed costs ($, optional)'),
      ],
      title: 'Tax lien redemption scenario',
      help: 'Models one hypothetical full redemption using simple interest. Actual accrual, eligible principal, premiums, fees and redemption rules vary. Does not model non-redemption or foreclosure.',
    },
    finance: {
      fields: [
        dollars('price', 'Purchase price ($)', true),
        dollars('down', 'Down payment ($)', true),
        rate('Fixed annual interest rate (%)'),
        months('term', 'Amortization (months)'),
        months('balloon', 'Balloon month (optional)', false),
        dollars('costs', 'Closing costs paid upfront ($, optional)'),
      ],
      title: 'Owner-financed payment',
      help: 'Estimates monthly principal and interest on a fixed-rate note. A balloon is the balance after the scheduled payment that month. Taxes, insurance, other payments and legal compliance are not modeled.',
    },
  };
  const drafts = {};
  const renderInputs = () => {
    const mode = modes[calcType.value];
    const draft = drafts[calcType.value] || {};
    const fields = mode.fields.map(([name, label, min, max, step, required]) => {
      const field = node('div', '', 'field');
      const labelEl = node('label', label);
      const input = node('input');
      input.id = `scenario-${name}`;
      labelEl.htmlFor = input.id;
      Object.assign(input, { name, type: 'number', min: String(min), max: String(max), step: String(step), required });
      input.inputMode = step === 1 ? 'numeric' : 'decimal';
      input.value = draft[name] || '';
      field.append(labelEl, input);
      return field;
    });
    calcInputs.replaceChildren(...fields);
    id('trench-result-title').textContent = mode.title;
    id('trench-result-help').textContent = mode.help;
    calcResult.replaceChildren(node('p', 'Enter your assumptions to calculate an estimate.'));
  };
  const renderMetrics = (items, detail) => {
    const list = node('dl', '', 'trench-metrics');
    items.forEach(([label, number]) => {
      const metric = node('div');
      metric.append(node('dt', label), node('dd', currency.format(number)));
      list.append(metric);
    });
    calcResult.replaceChildren(list, node('p', detail, 'trench-result-detail'));
  };
  calcType.addEventListener('change', renderInputs);
  calcInputs.addEventListener('input', () => {
    drafts[calcType.value] = Object.fromEntries([...calcInputs.querySelectorAll('input')].map(field => [field.name, field.value]));
    calcResult.replaceChildren(node('p', 'Calculate again to reflect your latest inputs.'));
  });
  calc.addEventListener('submit', event => {
    event.preventDefault();
    const deal = calcType.value;
    const value = new FormData(calc);
    const get = key => Number(value.get(key));
    const costs = get('costs');
    const term = get('term');
    const problem = message => calcResult.replaceChildren(node('p', message));
    if (deal === 'deed' || deal === 'foreclosure') {
      const budgetCents = Math.round(get('budget') * 100);
      const costCents = Math.round(costs * 100);
      const feeBasis = 10000 + Math.round(get('fee') * 100);
      const maximum = Math.floor(Math.max(0, budgetCents - costCents) * 100 / feeBasis);
      const hasBid = value.get('bid') !== '';
      const proposedCents = Math.round((Math.round(get('bid') * 100) * feeBasis) / 10000) + costCents;
      const results = [['Maximum whole-dollar bid', maximum]];
      if (hasBid) results.push(['Estimated all-in cost at proposed bid', proposedCents / 100]);
      const message = budgetCents <= costCents ? 'Other costs meet or exceed the spending limit. There is no room for a positive bid.'
        : maximum === 0 ? 'The inputs leave less than $1 for a bid.'
        : hasBid && proposedCents > budgetCents
          ? 'The proposed bid is over your spending limit after costs and fees.'
          : 'Maximum bid is (spending limit minus other costs) divided by (1 plus the bid-based fee rate), rounded down. Verify the actual fee structure.';
      renderMetrics(results, message);
    } else if (deal === 'lien') {
      const principal = get('principal');
      if (principal <= 0) return problem('Enter a positive lien principal.');
      const interest = principal * get('rate') / 100 * term / 12;
      renderMetrics([['Gross redemption amount', principal + interest], ['Simple interest', interest], ['Interest less entered costs', interest - costs]], 'Illustration only: principal × annual rate × months ÷ 12. Costs reduce the scenario result; timing and payment are not guaranteed.');
    } else {
      const price = get('price');
      const down = get('down');
      const balloon = get('balloon');
      if (price <= 0 || down >= price) return problem('The purchase price must be positive and the down payment must be smaller than the price.');
      if (balloon >= term) return problem('Enter a balloon month before the end of amortization or leave it empty for no balloon.');
      const principal = price - down;
      const monthlyRate = get('rate') / 1200;
      const annuity = period => monthlyRate ? -Math.expm1(-period * Math.log1p(monthlyRate)) / monthlyRate : period;
      const payment = principal / annuity(term);
      const results = [['Amount financed', principal], ['Monthly principal & interest', payment], ['Cash at closing (entered costs)', down + costs]];
      if (balloon) results.push([`Balance after month ${balloon}`, payment * annuity(term - balloon)]);
      renderMetrics(results, balloon ? 'The balloon balance is in addition to that month’s scheduled payment. Verify actual note terms and applicable rules before signing.' : 'No balloon is modeled. The scheduled monthly payments amortize the loan by the end of the entered term.');
    }
  });
  renderInputs();
  id('trench-scenarios').hidden = false;

  const storageKey = 'tti.trenchai.watchlist.v1';
  const watchForm = id('trench-watch-form');
  const items = id('trench-watch-items');
  const feedback = id('trench-watch-feedback');
  const storageMessage = id('trench-storage');
  const exportButton = id('trench-export');
  const watch = key => watchForm.elements.namedItem(key);
  const plainDate = value => /^\d{4}-\d{2}-\d{2}$/.test(value);
  const validURL = value => {
    try {
      const parsed = new URL(value);
      return ['http:', 'https:'].includes(parsed.protocol) && !parsed.username && !parsed.password;
    } catch { return false; }
  };
  const validLead = lead => lead && Object.hasOwn(types, lead.type) && statuses.includes(lead.status)
    && ['name', 'id', 'note', 'url', 'date'].every(key => typeof lead[key] === 'string');
  let leads = [];
  let editing = '';
  let removing = '';
  let canStore = false;
  try {
    const probe = `${storageKey}.test`;
    localStorage.setItem(probe, '1');
    localStorage.removeItem(probe);
    const stored = JSON.parse(localStorage.getItem(storageKey) || '[]');
    if (Array.isArray(stored)) leads = stored.filter(validLead).slice(0, 100);
    canStore = true;
  } catch {
    storageMessage.textContent = 'Browser storage is unavailable. Leads stay on this page only until you reload or close it. Export CSV to keep them.';
    storageMessage.hidden = false;
  }
  const persist = () => {
    if (canStore) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(leads));
        return;
      } catch { canStore = false; }
    }
    storageMessage.textContent = 'Changes could not be saved to browser storage. Export CSV before reloading or closing this page.';
    storageMessage.hidden = false;
  };
  const displayDate = date => Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(`${date}T00:00:00Z`));
  const leaveEdit = () => {
    editing = '';
    watchForm.reset();
    watch('url').setCustomValidity('');
    watch('name').setCustomValidity('');
    id('trench-save').textContent = 'Save lead';
    id('trench-cancel').hidden = true;
    id('trench-watch-heading').textContent = 'Add a lead';
  };
  const action = (label, handler) => {
    const button = node('button', label);
    button.type = 'button';
    button.addEventListener('click', handler);
    return button;
  };
  const renderLeads = () => {
    exportButton.disabled = leads.length === 0;
    if (!leads.length) {
      items.replaceChildren(node('p', 'No leads saved yet. Add a parcel or deal to start your research list.', 'trench-muted'));
      return;
    }
    items.replaceChildren(...leads.map(lead => {
      const article = node('article', '', 'trench-item');
      const date = plainDate(lead.date) && Number.isFinite(Date.parse(lead.date)) ? ` · ${displayDate(lead.date)}` : '';
      article.append(node('h4', lead.name), node('p', `${types[lead.type]} · ${lead.status}${date} · Manual entry`, 'trench-meta'));
      if (validURL(lead.url)) {
        const link = node('a', 'Open saved reference (new tab)');
        Object.assign(link, { href: lead.url, target: '_blank', rel: 'noopener noreferrer' });
        article.append(link);
      }
      if (lead.note) article.append(node('p', lead.note, 'trench-note'));
      const buttons = node('div', '', 'trench-actions');
      if (removing === lead.id) {
        article.append(node('p', 'Remove this lead from the watchlist?'));
        buttons.append(action('Confirm removal', () => {
          leads = leads.filter(entry => entry.id !== lead.id);
          if (editing === lead.id) leaveEdit();
          removing = '';
          persist();
          renderLeads();
          feedback.textContent = 'Lead removed.';
          watch('name').focus();
        }), action('Keep lead', () => { removing = ''; renderLeads(); }));
      } else {
        buttons.append(action('Edit', () => {
          editing = lead.id;
          removing = '';
          ['name', 'type', 'date', 'status', 'url', 'note'].forEach(key => { watch(key).value = lead[key]; });
          watch('url').setCustomValidity('');
          watch('name').setCustomValidity('');
          id('trench-save').textContent = 'Update lead';
          id('trench-cancel').hidden = false;
          id('trench-watch-heading').textContent = 'Edit lead';
          renderLeads();
          watch('name').focus();
        }), action('Remove', () => {
          removing = lead.id;
          renderLeads();
          [...items.querySelectorAll('button')].find(button => button.textContent === 'Keep lead')?.focus();
        }));
      }
      article.append(buttons);
      return article;
    }));
  };
  ['name', 'url'].forEach(key => watch(key).addEventListener('input', () => watch(key).setCustomValidity('')));
  id('trench-cancel').addEventListener('click', () => { leaveEdit(); watch('name').focus(); });
  watchForm.addEventListener('submit', event => {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(watchForm));
    const lead = Object.fromEntries(Object.entries(values).map(([key, value]) => [key, value.trim()]));
    if (!lead.name || (lead.url && !validURL(lead.url))) {
      const key = lead.name ? 'url' : 'name';
      watch(key).setCustomValidity(key === 'url' ? 'Enter a public HTTP or HTTPS URL without login details.' : 'Enter a parcel ID, address or label.');
      watch(key).reportValidity();
      return;
    }
    if (!editing && leads.length >= 100) {
      feedback.textContent = 'The watchlist holds up to 100 leads. Export a copy and remove a lead before adding another.';
      return;
    }
    lead.id = editing || (globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`);
    leads = editing ? leads.map(entry => entry.id === editing ? lead : entry) : [lead, ...leads];
    const changed = Boolean(editing);
    removing = '';
    leaveEdit();
    persist();
    renderLeads();
    feedback.textContent = canStore ? (changed ? 'Lead updated.' : 'Lead saved.') : (changed ? 'Lead updated for this session only.' : 'Lead added for this session only.');
  });
  const quoteCSV = value => {
    // Prevent user-entered cells from being evaluated as spreadsheet formulas.
    const safe = /^[\s\u200B\uFEFF]*[=+@-]|^[\t\r\n]/u.test(value) ? `'${value}` : value;
    return `"${safe.replaceAll('"', '""')}"`;
  };
  exportButton.addEventListener('click', () => {
    const rows = [['Lead', 'Type', 'Deadline or next check', 'Research status', 'Reference URL', 'Notes']];
    leads.forEach(lead => rows.push([lead.name, types[lead.type], lead.date, lead.status, lead.url, lead.note]));
    const blob = new Blob(['\uFEFF', rows.map(row => row.map(quoteCSV).join(',')).join('\r\n'), '\r\n'], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = node('a');
    Object.assign(link, { href: url, download: 'trenchai-watchlist.csv' });
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    feedback.textContent = 'CSV download requested.';
  });
  renderLeads();
  id('trench-watch').hidden = false;
})();
