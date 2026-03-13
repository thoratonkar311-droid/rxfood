/* ═══════════════════════════════════════════
   RxFood — App Logic (app.js)
   Fetches drug data from /api/drugs endpoint
   ═══════════════════════════════════════════ */

let DRUGS = {};
let drugNames = [];

// ── Boot ───────────────────────────────────────────────────
async function boot() {
  try {
    showLoading();
    const res = await fetch('/api/drugs');
    const { drugs } = await res.json();

    // Convert list to lookup map
    const detailPromises = drugs.slice(0, 5).map(d =>
      fetch(`/api/drugs/${d.name}`).then(r => r.json())
    );

    // Load all drugs fully
    const allRes = await fetch('/api/drugs');
    const allData = await allRes.json();

    // Fetch full details for all drugs in parallel (batched)
    const names = allData.drugs.map(d => d.name);
    const fullDrugs = await Promise.all(
      names.map(name => fetch(`/api/drugs/${name}`).then(r => r.json()))
    );

    fullDrugs.forEach(drug => {
      DRUGS[drug.name] = drug;
    });
    drugNames = Object.keys(DRUGS);

    hideLoading();
    initUI();
  } catch (err) {
    console.error('Boot failed:', err);
    // Fallback: try to load embedded JSON if API fails
    try {
      const el = document.getElementById('drugs-data');
      if (el) {
        DRUGS = JSON.parse(el.textContent);
        drugNames = Object.keys(DRUGS);
        hideLoading();
        initUI();
      } else {
        showError();
      }
    } catch (e) {
      showError();
    }
  }
}

function showLoading() {
  document.getElementById('results').innerHTML = `
    <div class="empty-state">
      <div class="empty-icon" style="animation:pulse 1.5s ease infinite">⚗️</div>
      <div class="empty-title">Loading database…</div>
      <div class="empty-desc">Fetching drug interaction data</div>
    </div>`;
}
function hideLoading() {
  document.getElementById('results').innerHTML = '';
}
function showError() {
  document.getElementById('results').innerHTML = `
    <div class="empty-state">
      <div class="empty-icon">⚠️</div>
      <div class="empty-title">Could not load database</div>
      <div class="empty-desc">Make sure the server is running: <code>npm start</code></div>
    </div>`;
}

// ── Init UI ────────────────────────────────────────────────
function initUI() {
  buildQuickPills();
  bindSearch();
}

function buildQuickPills() {
  const el = document.getElementById('quickPills');
  if (!el) return;
  drugNames.forEach(name => {
    const s = document.createElement('span');
    s.className = 'pill';
    s.textContent = name;
    s.onclick = () => loadDrug(name);
    el.appendChild(s);
  });
}

// ── Search ─────────────────────────────────────────────────
function bindSearch() {
  const input = document.getElementById('searchInput');
  const sugg = document.getElementById('suggestions');
  if (!input) return;

  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    if (!q) { sugg.classList.remove('show'); return; }
    const matches = drugNames.filter(n => n.toLowerCase().includes(q));
    if (!matches.length) { sugg.classList.remove('show'); return; }
    sugg.innerHTML = matches.slice(0, 8).map(name => {
      const d = DRUGS[name];
      return `<div class="suggestion-item" onclick="loadDrug('${name}')">
        <span>${d.icon}</span>
        <span class="suggestion-drug">${name}</span>
        <span class="suggestion-class">${d.class}</span>
      </div>`;
    }).join('');
    sugg.classList.add('show');
  });

  document.addEventListener('click', e => {
    if (!e.target.closest('.search-box')) sugg.classList.remove('show');
  });

  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') searchDrug();
  });
}

function searchDrug() {
  const q = document.getElementById('searchInput').value.trim();
  if (!q) return;
  const match =
    drugNames.find(n => n.toLowerCase() === q.toLowerCase()) ||
    drugNames.find(n => n.toLowerCase().includes(q.toLowerCase()));
  match ? loadDrug(match) : showNotFound(q);
  document.getElementById('suggestions').classList.remove('show');
}

// ── Load drug ──────────────────────────────────────────────
function loadDrug(name) {
  document.getElementById('searchInput').value = name;
  document.getElementById('suggestions').classList.remove('show');
  const drug = DRUGS[name];
  if (!drug) { showNotFound(name); return; }

  const high = drug.interactions.filter(i => i.severity === 'high').length;
  const med  = drug.interactions.filter(i => i.severity === 'medium').length;
  const low  = drug.interactions.filter(i => i.severity === 'low').length;

  document.getElementById('results').innerHTML = `
    <div class="results-header">
      <div class="results-title">Results for <span>${name}</span></div>
      <div class="results-count">${drug.interactions.length} interactions found</div>
    </div>
    <div class="drug-card">
      <div class="drug-card-top">
        <div class="drug-icon">${drug.icon}</div>
        <div class="drug-info">
          <div class="drug-name">${name}</div>
          <div class="drug-generic">${drug.generic}</div>
          <span class="drug-class-tag">${drug.class}</span>
        </div>
        <div class="drug-meta">
          <div class="meta-item"><span class="meta-key">Mechanism</span><span class="meta-val" style="max-width:260px;white-space:normal;font-size:.82rem">${drug.mechanism}</span></div>
          <div class="meta-item"><span class="meta-key">Half-life</span><span class="meta-val">${drug.halfLife}</span></div>
          <div class="meta-item"><span class="meta-key">Metabolism</span><span class="meta-val">${drug.metabolism}</span></div>
        </div>
      </div>
      <div class="severity-bar">
        <strong style="font-family:'DM Mono',monospace;font-size:.8rem;color:var(--muted)">INTERACTION SEVERITY:</strong>
        ${high ? `<div class="sev-badge"><div class="sev-dot high"></div><span class="sev-count">${high}</span><span class="sev-label">High Risk</span></div>` : ''}
        ${med  ? `<div class="sev-badge"><div class="sev-dot medium"></div><span class="sev-count">${med}</span><span class="sev-label">Medium Risk</span></div>` : ''}
        ${low  ? `<div class="sev-badge"><div class="sev-dot low"></div><span class="sev-count">${low}</span><span class="sev-label">Low Risk</span></div>` : ''}
        <div style="margin-left:auto;font-size:.8rem;color:var(--muted)">Click any card for full details →</div>
      </div>
    </div>
    <div class="interactions-grid">
      ${drug.interactions.map((ix, i) => `
        <div class="ic ${ix.severity}" style="animation-delay:${i * 0.07}s" onclick="openModal('${name}',${i})">
          <div class="ic-header">
            <div class="ic-emoji">${ix.emoji}</div>
            <div>
              <div class="ic-food-name">${ix.food}</div>
              <div class="ic-compound">${ix.compound}</div>
            </div>
            <div class="ic-sev ${ix.severity}">${ix.severity}</div>
          </div>
          <div class="ic-mech">${ix.mechanism.substring(0, 140)}…</div>
          <div class="ic-footer">
            <div class="ic-timing">⏱ ${ix.timing.substring(0, 55)}</div>
            <button class="ic-btn">View Details →</button>
          </div>
        </div>`).join('')}
    </div>`;

  document.getElementById('results').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function showNotFound(q) {
  document.getElementById('results').innerHTML = `
    <div class="empty-state">
      <div class="empty-icon">🔬</div>
      <div class="empty-title">No results for "${q}"</div>
      <div class="empty-desc">Try one of the quick-search pills above or check spelling.</div>
    </div>`;
}

// ── Modal ──────────────────────────────────────────────────
function openModal(drugName, index) {
  const drug = DRUGS[drugName];
  const ix = drug.interactions[index];
  const riskClass = ix.severity === 'high' ? 'danger' : ix.severity === 'medium' ? 'warning' : 'safe';

  const pathwayHTML = ix.pathway.map((step, i) => {
    const isDanger = /crisis|death|fatal|arrest|failure|damage|bleed|toxic/i.test(step);
    return `${i > 0 ? '<div class="parr">→</div>' : ''}
      <div class="pstep ${isDanger ? 'danger' : ''}">
        <div class="snum">Step ${i + 1}</div>
        <div class="stxt">${step}</div>
      </div>`;
  }).join('');

  document.getElementById('modalContent').innerHTML = `
    <div class="modal-header">
      <div>
        <div class="modal-sub">${drugName} + ${ix.food}</div>
        <div class="modal-title">${ix.emoji} ${ix.food} Interaction</div>
      </div>
      <div class="modal-close" onclick="closeModal()">✕</div>
    </div>
    <div class="modal-body">
      <div class="warn-box" style="margin-bottom:1.5rem">
        <div class="warn-icon">⚠️</div>
        <div><strong style="color:var(--warning)">Effect:</strong> ${ix.effect}</div>
      </div>
      <div class="msec">
        <div class="msec-title">Molecular Structures</div>
        <div class="mol-box">
          <div class="mol-wrap">
            <div class="mol-item">${molSVG(drugName,'#00d4ff')}<div class="mol-label">${drugName}</div></div>
            <div style="font-size:2rem;opacity:.4">⚡</div>
            <div class="mol-item">${molSVG(ix.food, ix.severity==='high'?'#ef4444':ix.severity==='medium'?'#f59e0b':'#10b981')}<div class="mol-label">${ix.food}</div></div>
          </div>
        </div>
      </div>
      <div class="msec">
        <div class="msec-title">Active Compound</div>
        <p style="font-family:'DM Mono',monospace;font-size:.9rem;color:var(--accent)">${ix.compound}</p>
      </div>
      <div class="msec">
        <div class="msec-title">Chemical Mechanism</div>
        <p>${ix.mechanism}</p>
      </div>
      <div class="msec">
        <div class="msec-title">Interaction Pathway</div>
        <div class="pathway">${pathwayHTML}</div>
      </div>
      <div class="msec">
        <div class="msec-title">Risk Assessment</div>
        <div class="risk-grid">
          <div class="risk-item"><div class="risk-label">RISK LEVEL</div><div class="risk-val ${riskClass}">${ix.riskLevel}</div></div>
          <div class="risk-item"><div class="risk-label">TIMING WINDOW</div><div class="risk-val" style="font-size:.85rem;font-weight:400;color:var(--dim)">${ix.window}</div></div>
          <div class="risk-item" style="grid-column:1/3"><div class="risk-label">QUANTITY EFFECT</div><div class="risk-val" style="font-size:.85rem;font-weight:400;color:var(--dim)">${ix.quantityEffect}</div></div>
        </div>
      </div>
      <div class="msec">
        <div class="msec-title">Timing Recommendation</div>
        <p>${ix.timing}</p>
      </div>
      <div class="msec">
        <div class="msec-title">Safe Alternatives</div>
        <div class="alts">${ix.alternatives.map(a => `<div class="alt-tag">✓ ${a}</div>`).join('')}</div>
      </div>
      <div style="margin-top:1.5rem;padding:1rem;background:rgba(239,68,68,.05);border:1px solid rgba(239,68,68,.15);border-radius:12px;font-size:.82rem;color:var(--muted);line-height:1.6">
        ⚕️ <strong style="color:var(--dim)">Always consult your pharmacist or physician</strong> before changing your diet while on medication.
      </div>
    </div>`;
  document.getElementById('modalOverlay').classList.add('show');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('show');
  document.body.style.overflow = '';
}

document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('modalOverlay')?.addEventListener('click', e => {
    if (e.target === e.currentTarget) closeModal();
  });
});

// ── Molecule SVG ───────────────────────────────────────────
function molSVG(name, color) {
  const hash = [...name].reduce((a, c) => a + c.charCodeAt(0), 0);
  const rings = (hash % 3) + 1;
  const nodes = [], bonds = [];
  for (let ri = 0; ri < rings; ri++) {
    const ox = ri * 30, base = ri * 6;
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI * 2 * i) / 6 - Math.PI / 2;
      nodes.push({ x: 80 + ox + Math.cos(a) * 24, y: 80 + Math.sin(a) * 24 });
    }
    for (let i = 0; i < 6; i++) bonds.push({ a: base + i, b: base + (i + 1) % 6, d: i % 2 === 0 });
    if (ri > 0) bonds.push({ a: (ri - 1) * 6 + 1, b: ri * 6 + 5, d: false });
  }
  const b = bonds.map(({ a, b, d }) => {
    if (!nodes[a] || !nodes[b]) return '';
    if (Math.abs(nodes[a].x - nodes[b].x) > 55 || Math.abs(nodes[a].y - nodes[b].y) > 55) return '';
    return `<line x1="${nodes[a].x.toFixed(1)}" y1="${nodes[a].y.toFixed(1)}" x2="${nodes[b].x.toFixed(1)}" y2="${nodes[b].y.toFixed(1)}" stroke="${color}" stroke-width="${d ? 2.5 : 1.5}" opacity=".6"/>`;
  }).join('');
  const n = nodes.slice(0, 18).map((nd, i) =>
    `<circle cx="${nd.x.toFixed(1)}" cy="${nd.y.toFixed(1)}" r="5" fill="${i % 3 === 0 ? color : '#1e2d45'}" stroke="${color}" stroke-width="1.5" opacity=".85"/>`
  ).join('');
  const id = 'g' + name.replace(/\W/g, '');
  return `<svg width="160" height="160" viewBox="0 0 160 160">
    <defs><radialGradient id="${id}"><stop offset="0%" stop-color="${color}" stop-opacity=".2"/><stop offset="100%" stop-color="${color}" stop-opacity="0"/></radialGradient></defs>
    <circle cx="80" cy="80" r="70" fill="url(#${id})"/>${b}${n}</svg>`;
}

// ── Boot ───────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', boot);
