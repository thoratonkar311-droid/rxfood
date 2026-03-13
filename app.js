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

    if (!res.ok) {
      throw new Error("API request failed");
    }

    const data = await res.json();

    // Load all drugs from API
    DRUGS = data;

    // Get all drug names
    drugNames = Object.keys(DRUGS);

    hideLoading();
    initUI();

  } catch (err) {
    console.error("Boot failed:", err);
    showError();
  }
}

    drugNames = Object.keys(DRUGS);

    hideLoading();
    initUI();

  } catch (err) {
    console.error("Boot failed:", err);
    showError();
  }
}
    drugNames = Object.keys(DRUGS);

    hideLoading();
    initUI();

  } catch (err) {
    console.error('Boot failed:', err);
    showError();
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
      <div class="empty-desc">API connection failed</div>
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

    if (!q) {
      sugg.classList.remove('show');
      return;
    }

    const matches = drugNames.filter(n =>
      n.toLowerCase().includes(q)
    );

    if (!matches.length) {
      sugg.classList.remove('show');
      return;
    }

    sugg.innerHTML = matches.slice(0, 8).map(name => {
      const d = DRUGS[name];
      return `
        <div class="suggestion-item" onclick="loadDrug('${name}')">
          <span>${d.icon}</span>
          <span class="suggestion-drug">${name}</span>
          <span class="suggestion-class">${d.class}</span>
        </div>`;
    }).join('');

    sugg.classList.add('show');
  });

  document.addEventListener('click', e => {
    if (!e.target.closest('.search-box')) {
      sugg.classList.remove('show');
    }
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

// ── Load Drug ──────────────────────────────────────────────
function loadDrug(name) {
  document.getElementById('searchInput').value = name;

  const drug = DRUGS[name];

  if (!drug) {
    showNotFound(name);
    return;
  }

  const interactionsHTML = drug.interactions.map(ix => `
    <div class="interaction-card ${ix.severity}">
      <h3>${ix.emoji} ${ix.food}</h3>
      <p><strong>Compound:</strong> ${ix.compound}</p>
      <p><strong>Mechanism:</strong> ${ix.mechanism}</p>
      <p><strong>Risk:</strong> ${ix.severity}</p>
    </div>
  `).join('');

  document.getElementById('results').innerHTML = `
    <div class="drug-result">
      <h2>${drug.icon} ${name}</h2>
      <p>${drug.generic}</p>
      <p><strong>Class:</strong> ${drug.class}</p>
      <p><strong>Half-life:</strong> ${drug.halfLife}</p>
      <div class="interactions-grid">
        ${interactionsHTML}
      </div>
    </div>
  `;
}

function showNotFound(q) {
  document.getElementById('results').innerHTML = `
    <div class="empty-state">
      <div class="empty-icon">🔬</div>
      <div class="empty-title">No results for "${q}"</div>
      <div class="empty-desc">Try another drug name.</div>
    </div>`;
}

// ── Boot App ───────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', boot);
