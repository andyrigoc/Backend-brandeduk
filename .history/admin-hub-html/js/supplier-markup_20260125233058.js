/**
 * Products Settings - Supplier Product Markup
 * Supports Fixed Markup and Tiered Markup (customizable, persisted to localStorage).
 */

const SUPPLIER_MARKUP_STORAGE_KEY = 'adminHub.supplierMarkupConfig';

const DEFAULT_MARKUP_CONFIG = {
    mode: 'tiered',
    fixedPercent: 80,
    tiers: [
        { from: 0.01, to: 1.99, percent: 200 },
        { from: 2.00, to: 2.99, percent: 80 },
        { from: 3.00, to: 4.99, percent: 150 },
        { from: 5.00, to: 9.99, percent: 138 },
        { from: 10.00, to: 14.99, percent: 132 },
        { from: 15.00, to: 24.99, percent: 90 },
        { from: 25.00, to: 29.99, percent: 105.5 },
        { from: 30.00, to: 34.99, percent: 110.3 },
        { from: 35.00, to: 39.99, percent: 90.8 },
        { from: 40.00, to: 44.99, percent: 85.7 },
        { from: 45.00, to: null, percent: 60.8 }
    ]
};

let supplierMarkupState = cloneConfig(DEFAULT_MARKUP_CONFIG);
let supplierMarkupSaved = cloneConfig(DEFAULT_MARKUP_CONFIG);

function initSupplierMarkupPage() {
    loadSupplierMarkupConfig();

    const container = document.getElementById('page-supplier-markup');
    if (!container) return;

    container.innerHTML = `
        <div class="page-header">
            <div class="breadcrumb">
                <a href="#">Dashboard</a> / Products / Supplier Product Markup
            </div>
            <h1 class="page-title">Supplier Product Markup</h1>
        </div>

        <div class="settings-page">
            <div class="settings-header">
                <div>
                    <h2 style="margin:0;">Markup configuration</h2>
                    <div class="settings-note">Used to calculate selling price from supplier cost price.</div>
                </div>
                <div class="settings-row">
                    <button class="btn btn-primary" id="saveMarkupBtn"><i class="fas fa-save"></i> Save</button>
                    <button class="btn btn-secondary" id="cancelMarkupBtn">Cancel</button>
                </div>
            </div>

            <div class="settings-body">
                <div class="card">
                    <div class="card-header">
                        <h3>Mode</h3>
                        <div class="settings-note">Choose Fixed or Tiered markup.</div>
                    </div>
                    <div class="card-body">
                        <div class="radio-row">
                            <label class="radio-item">
                                <input type="radio" name="markupMode" value="fixed" ${supplierMarkupState.mode === 'fixed' ? 'checked' : ''} />
                                <div>
                                    <div class="radio-title">Fixed Markup</div>
                                    <div class="settings-note">Apply a single percentage markup to all items.</div>
                                    <div style="margin-top:10px; display:flex; align-items:center; gap:10px;">
                                        <div class="input-group" title="Fixed markup percent">
                                            <span class="addon">%</span>
                                            <input class="input" id="fixedMarkupInput" type="number" step="0.1" min="0" value="${escapeHtml(supplierMarkupState.fixedPercent)}" ${supplierMarkupState.mode !== 'fixed' ? 'disabled' : ''} />
                                        </div>
                                        <span class="settings-note">Example: 80% markup</span>
                                    </div>
                                </div>
                            </label>

                            <label class="radio-item">
                                <input type="radio" name="markupMode" value="tiered" ${supplierMarkupState.mode === 'tiered' ? 'checked' : ''} />
                                <div style="flex:1;">
                                    <div class="radio-title">Tiered Markup</div>
                                    <div class="settings-note">Different markup per cost price range.</div>

                                    <div style="margin-top:12px;" class="table-wrap">
                                        <table class="table" id="tiersTable">
                                            <thead>
                                                <tr>
                                                    <th style="width: 210px;">Price From</th>
                                                    <th style="width: 210px;">Price To</th>
                                                    <th style="width: 220px;">Markup</th>
                                                    <th class="actions">&nbsp;</th>
                                                </tr>
                                            </thead>
                                            <tbody id="tiersTbody"></tbody>
                                        </table>
                                    </div>

                                    <div style="margin-top:10px;">
                                        <button class="btn btn-secondary" id="addTierBtn"><i class="fas fa-plus"></i> Add Markup Tier</button>
                                    </div>
                                </div>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    wireMarkupEvents(container);
    renderTiersTable();
}

function wireMarkupEvents(container) {
    container.querySelectorAll('input[name="markupMode"]').forEach(radio => {
        radio.addEventListener('change', () => {
            supplierMarkupState.mode = radio.value;
            refreshMarkupUI();
        });
    });

    const saveBtn = container.querySelector('#saveMarkupBtn');
    const cancelBtn = container.querySelector('#cancelMarkupBtn');

    saveBtn.addEventListener('click', () => {
        // Basic validation
        if (supplierMarkupState.mode === 'fixed') {
            const p = Number(supplierMarkupState.fixedPercent);
            if (!Number.isFinite(p) || p < 0) {
                showToast('Fixed markup must be a valid %.', 'error');
                return;
            }
        }

        if (supplierMarkupState.mode === 'tiered') {
            if (!Array.isArray(supplierMarkupState.tiers) || supplierMarkupState.tiers.length === 0) {
                showToast('Add at least one markup tier.', 'error');
                return;
            }
        }

        localStorage.setItem(SUPPLIER_MARKUP_STORAGE_KEY, JSON.stringify(supplierMarkupState));
        supplierMarkupSaved = cloneConfig(supplierMarkupState);
        showToast('Markup saved.', 'success');
    });

    cancelBtn.addEventListener('click', () => {
        supplierMarkupState = cloneConfig(supplierMarkupSaved);
        initSupplierMarkupPage();
        showToast('Changes discarded.', 'info');
    });

    const addTierBtn = container.querySelector('#addTierBtn');
    addTierBtn.addEventListener('click', () => {
        const last = supplierMarkupState.tiers[supplierMarkupState.tiers.length - 1];
        const from = last && Number.isFinite(Number(last.from)) ? Number(last.from) : 0;
        const newTier = { from: round2(from), to: null, percent: 0 };
        supplierMarkupState.tiers.push(newTier);
        renderTiersTable();
    });
}

function refreshMarkupUI() {
    const fixed = document.getElementById('fixedMarkupInput');
    if (fixed) {
        fixed.disabled = supplierMarkupState.mode !== 'fixed';
        fixed.value = supplierMarkupState.fixedPercent;
        fixed.addEventListener('input', () => {
            supplierMarkupState.fixedPercent = Number(fixed.value);
        });
    }

    const tieredDisabled = supplierMarkupState.mode !== 'tiered';
    const tiersTable = document.getElementById('tiersTable');
    const addTierBtn = document.getElementById('addTierBtn');
    if (tiersTable) {
        tiersTable.style.opacity = tieredDisabled ? '0.45' : '1';
        tiersTable.style.pointerEvents = tieredDisabled ? 'none' : 'auto';
    }
    if (addTierBtn) {
        addTierBtn.disabled = tieredDisabled;
        addTierBtn.style.opacity = tieredDisabled ? '0.55' : '1';
    }
}

function renderTiersTable() {
    const tbody = document.getElementById('tiersTbody');
    if (!tbody) return;

    tbody.innerHTML = supplierMarkupState.tiers
        .map((tier, idx) => renderTierRow(tier, idx))
        .join('');

    tbody.querySelectorAll('[data-tier-idx]').forEach(row => {
        const idx = Number(row.getAttribute('data-tier-idx'));

        const fromInput = row.querySelector('[data-field="from"]');
        const toInput = row.querySelector('[data-field="to"]');
        const percentInput = row.querySelector('[data-field="percent"]');
        const deleteBtn = row.querySelector('[data-action="delete"]');

        fromInput?.addEventListener('input', () => {
            supplierMarkupState.tiers[idx].from = parseMoney(fromInput.value);
        });
        toInput?.addEventListener('input', () => {
            supplierMarkupState.tiers[idx].to = toInput.value === '' ? null : parseMoney(toInput.value);
        });
        percentInput?.addEventListener('input', () => {
            supplierMarkupState.tiers[idx].percent = Number(percentInput.value);
        });
        deleteBtn?.addEventListener('click', () => {
            supplierMarkupState.tiers.splice(idx, 1);
            renderTiersTable();
        });
    });

    refreshMarkupUI();
}

function renderTierRow(tier, idx) {
    const toValue = tier.to === null || typeof tier.to === 'undefined' ? '' : String(tier.to);

    return `
        <tr data-tier-idx="${idx}">
            <td>
                <div class="input-group">
                    <span class="addon">£</span>
                    <input class="input" data-field="from" type="number" step="0.01" min="0" value="${escapeHtml(tier.from)}" />
                </div>
            </td>
            <td>
                <div class="input-group">
                    <span class="addon">£</span>
                    <input class="input" data-field="to" type="number" step="0.01" min="0" value="${escapeHtml(toValue)}" placeholder=">" />
                </div>
                <div class="settings-note" style="margin-top:4px;">${tier.to === null || typeof tier.to === 'undefined' ? '> ' + escapeHtml(tier.from) : ''}</div>
            </td>
            <td>
                <div class="input-group">
                    <span class="addon">%</span>
                    <input class="input" data-field="percent" type="number" step="0.1" min="0" value="${escapeHtml(tier.percent)}" />
                </div>
            </td>
            <td class="actions">
                <button class="btn btn-secondary" data-action="delete" title="Delete tier">Delete</button>
            </td>
        </tr>
    `;
}

function loadSupplierMarkupConfig() {
    supplierMarkupState = cloneConfig(DEFAULT_MARKUP_CONFIG);
    supplierMarkupSaved = cloneConfig(DEFAULT_MARKUP_CONFIG);

    try {
        const raw = localStorage.getItem(SUPPLIER_MARKUP_STORAGE_KEY);
        if (!raw) {
            refreshMarkupUI();
            return;
        }
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
            supplierMarkupState = normalizeMarkupConfig(parsed);
            supplierMarkupSaved = cloneConfig(supplierMarkupState);
        }
    } catch {
        // ignore
    }
}

function normalizeMarkupConfig(cfg) {
    const mode = cfg.mode === 'fixed' ? 'fixed' : 'tiered';
    const fixedPercent = Number(cfg.fixedPercent);

    const tiers = Array.isArray(cfg.tiers) ? cfg.tiers.map(t => ({
        from: parseMoney(t.from),
        to: t.to === null || typeof t.to === 'undefined' ? null : parseMoney(t.to),
        percent: Number(t.percent)
    })) : cloneConfig(DEFAULT_MARKUP_CONFIG).tiers;

    return {
        mode,
        fixedPercent: Number.isFinite(fixedPercent) ? fixedPercent : DEFAULT_MARKUP_CONFIG.fixedPercent,
        tiers
    };
}

function cloneConfig(obj) {
    return JSON.parse(JSON.stringify(obj));
}

function parseMoney(value) {
    const num = Number(String(value).replace(',', '.'));
    if (!Number.isFinite(num)) return 0;
    return round2(num);
}

function round2(n) {
    return Math.round(n * 100) / 100;
}

function escapeHtml(value) {
    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}
