(() => {
  "use strict";

  // Only this display vocabulary crosses the public data boundary. Feed-supplied
  // labels, descriptions, sales, account records and arbitrary checks are ignored.
  const checks = [
    ["storefront", "Storefront", "Homepage response and page title"],
    ["ebook_catalog", "Ebook catalog", "Catalog response and page title"],
    ["front_office", "AI Front Office", "Offer page response and title"],
    ["platform", "TTI platform", "Platform page response and title"],
    ["live_tool", "TrenchAI Academy", "Research tools page response and title"],
    ["system", "Call workflow", "Recent automation run, not a live test call"],
    ["skills", "Skills checks", "Specified files and evidence only"],
  ];
  const stateText = { ok: "Passed", problem: "Problem", unknown: "Unknown", not_checked: "Not checked" };
  const byId = id => document.getElementById(id);
  const list = byId("checks");
  const refresh = byId("refresh");
  const liveFeed = "https://aaronreddix1987-sketch.github.io/board/status.json";
  const isPreview = !["aaronreddix1987-sketch.github.io", "127.0.0.1", "localhost"].includes(location.hostname);
  const timeFormat = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles", dateStyle: "medium", timeStyle: "short",
  });
  let busy = false;
  let report = null;

  function renderRows(states = new Map()) {
    list.replaceChildren(...checks.map(([id, label, description]) => {
      const row = document.createElement("li");
      row.className = "check";
      const copy = document.createElement("div");
      const title = document.createElement("strong");
      title.textContent = label;
      const hint = document.createElement("small");
      hint.textContent = description;
      copy.append(title, hint);
      const badge = document.createElement("span");
      const state = states.get(id) ?? "not_checked";
      badge.className = `badge ${state}`;
      badge.textContent = stateText[state];
      row.append(copy, badge);
      return row;
    }));
  }

  function setNotice(label, message, detail, theme = "unknown") {
    byId("notice").textContent = message;
    byId("feed-badge").textContent = label;
    byId("feed-badge").className = `badge ${theme}`;
    byId("last").textContent = detail;
  }

  function readReport(raw) {
    if (raw?.health?.version !== 1 || !Array.isArray(raw.health.checks)) return null;
    if (typeof raw.updated_utc !== "string" || !raw.updated_utc.endsWith("Z")) return null;
    const checkedAt = Date.parse(raw.updated_utc);
    if (!Number.isFinite(checkedAt) || checkedAt > Date.now() + 5 * 60 * 1000) return null;
    const known = new Set(checks.map(([id]) => id));
    const states = new Map();
    for (const row of raw.health.checks) {
      if (!known.has(row?.id)) continue;
      if (states.has(row.id) || !Object.hasOwn(stateText, row.status)) return null;
      states.set(row.id, row.status);
    }
    if (states.size !== checks.length) return null;
    return { checkedAt, states };
  }

  function draw() {
    if (!report) {
      setNotice("Not available", "No current verified report.", "The endpoint may still be using the older format or may not be reachable. Refresh to try again.");
      renderRows();
      return;
    }

    const stamp = `${timeFormat.format(report.checkedAt)} Pacific`;
    if (Date.now() - report.checkedAt > 3 * 60 * 60 * 1000) {
      setNotice("Stale", "The latest report is more than three hours old.", `Last ${report.snapshot ? "preview snapshot" : "report"}: ${stamp}. Earlier passes are not displayed as current.`);
      renderRows();
      return;
    }

    const values = [...report.states.values()];
    const needsLook = values.includes("problem");
    const uncertain = values.some(x => x === "unknown" || x === "not_checked");
    setNotice(
      report.snapshot ? "Preview snapshot" : needsLook ? "Needs attention" : uncertain ? "Partial" : "Current",
      needsLook ? "At least one check reports a problem." : uncertain ? "A recent report is available; some checks are unverified." : "The latest report passed all listed checks.",
      report.snapshot ? `Verified snapshot: ${stamp}. The production feed is unverified here.` : `Last report: ${stamp}. Checks target an hourly cadence.`,
      needsLook ? "problem" : uncertain ? "unknown" : "ok",
    );
    renderRows(report.states);
  }

  async function update() {
    if (busy) return;
    busy = true;
    refresh.disabled = true;
    async function fetchReport(url) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), isPreview ? 3500 : 7500);
      try {
        const response = await fetch(url, { cache: "no-store", signal: controller.signal });
        return response.ok ? readReport(await response.json()) : null;
      } catch {
        return null;
      } finally {
        clearTimeout(timeout);
      }
    }
    try {
      report = isPreview ? await fetchReport(liveFeed) : null;
      if (!report) {
        report = await fetchReport(new URL("./status.json", document.baseURI));
        if (report && isPreview) report.snapshot = true;
      }
    } finally {
      busy = false;
      refresh.disabled = false;
      draw();
    }
  }

  refresh.addEventListener("click", update);
  renderRows();
  update();
  setInterval(update, 60_000);
})();
