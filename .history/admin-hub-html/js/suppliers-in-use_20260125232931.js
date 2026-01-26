/**
 * Products Settings - Suppliers In Use
 */

const SUPPLIERS_STORAGE_KEY = 'adminHub.suppliersInUse';

const DEFAULT_SUPPLIERS = [
    { id: 'ralawise', name: 'Ralawise', description: 'Primary catalogue feed (current).', status: 'connected' },
    { id: 'bc', name: 'B&C Collection', description: 'Optional supplier (placeholder).', status: 'available' },
    { id: 'gildan', name: 'Gildan', description: 'Optional supplier (placeholder).', status: 'available' },
    { id: 'awdis', name: 'AWDis / JustHoods', description: 'Optional supplier (placeholder).', status: 'available' }
];

let suppliersInUseState = {
    selected: new Set(['ralawise']),
    filter: ''
};

function loadSuppliersInUse() {
    try {
        const raw = localStorage.getItem(SUPPLIERS_STORAGE_KEY);
        if (!raw) return;
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
            suppliersInUseState.selected = new Set(parsed);
        }
    } catch {
        // ignore
    }
}

function saveSuppliersInUse() {
    const ids = Array.from(suppliersInUseState.selected);
    localStorage.setItem(SUPPLIERS_STORAGE_KEY, JSON.stringify(ids));
}

function initSuppliersInUsePage() {
    loadSuppliersInUse();

    const container = document.getElementById('page-suppliers-in-use');
    if (!container) return;

    container.innerHTML = `
        <div class="page-header">
            <div class="breadcrumb">
                <a href="#">Dashboard</a> / Products / Suppliers In Use
            </div>
            <h1 class="page-title">Suppliers In Use</h1>
        </div>

        <div class="settings-page">
            <div class="settings-header">
                <div>
                    <h2 style="margin:0;">Choose active suppliers</h2>
                    <div class="settings-note">Select which supplier catalogues are enabled for product search/import.</div>
                </div>
                <div class="settings-row">
                    <input class="input" id="suppliersFilter" placeholder="Filter suppliers..." style="min-width:260px;" />
                    <button class="btn btn-primary" id="saveSuppliersBtn"><i class="fas fa-save"></i> Save</button>
                    <button class="btn btn-secondary" id="resetSuppliersBtn">Cancel</button>
                </div>
            </div>

            <div class="settings-body">
                <div class="card">
                    <div class="card-header">
                        <h3>Suppliers</h3>
                        <div class="settings-note">Currently available: ${DEFAULT_SUPPLIERS.length}</div>
                    </div>
                    <div class="card-body" id="suppliersList"></div>
                </div>
            </div>
        </div>
    `;

    const filterInput = container.querySelector('#suppliersFilter');
    const saveBtn = container.querySelector('#saveSuppliersBtn');
    const resetBtn = container.querySelector('#resetSuppliersBtn');

    filterInput.value = suppliersInUseState.filter;

    filterInput.addEventListener('input', () => {
        suppliersInUseState.filter = filterInput.value || '';
        renderSuppliersInUseList();
    });

    saveBtn.addEventListener('click', () => {
        // Safety: prevent disabling all suppliers
        if (suppliersInUseState.selected.size === 0) {
            showToast('Select at least one supplier.', 'error');
            return;
        }
        saveSuppliersInUse();
        showToast('Suppliers updated.', 'success');
    });

    resetBtn.addEventListener('click', () => {
        loadSuppliersInUse();
        renderSuppliersInUseList();
        showToast('Changes discarded.', 'info');
    });

    renderSuppliersInUseList();
}

function renderSuppliersInUseList() {
    const list = document.getElementById('suppliersList');
    if (!list) return;

    const term = (suppliersInUseState.filter || '').trim().toLowerCase();
    const items = DEFAULT_SUPPLIERS.filter(s => {
        if (!term) return true;
        return (
            s.name.toLowerCase().includes(term) ||
            s.id.toLowerCase().includes(term) ||
            (s.description || '').toLowerCase().includes(term)
        );
    });

    list.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:10px;">
            ${items.map(s => renderSupplierRow(s)).join('')}
        </div>
        <div class="settings-note" style="margin-top:14px;">
            Enabled: <strong>${suppliersInUseState.selected.size}</strong>
        </div>
    `;

    list.querySelectorAll('input[type="checkbox"][data-supplier]').forEach(cb => {
        cb.addEventListener('change', () => {
            const id = cb.getAttribute('data-supplier');
            if (!id) return;
            if (cb.checked) suppliersInUseState.selected.add(id);
            else suppliersInUseState.selected.delete(id);

            // Keep at least one supplier selected
            if (suppliersInUseState.selected.size === 0) {
                suppliersInUseState.selected.add(id);
                cb.checked = true;
                showToast('At least one supplier must remain enabled.', 'error');
            }

            // Enforce Ralawise default still selectable but not forced
        });
    });
}

function renderSupplierRow(supplier) {
    const checked = suppliersInUseState.selected.has(supplier.id);
    const statusPill = supplier.status === 'connected'
        ? `<span style="background:#ecfdf5;color:#059669;border:1px solid #a7f3d0;padding:2px 10px;border-radius:999px;font-size:12px;font-weight:600;">Connected</span>`
        : `<span style="background:#f8fafc;color:#475569;border:1px solid var(--border);padding:2px 10px;border-radius:999px;font-size:12px;font-weight:600;">Available</span>`;

    return `
        <label class="card" style="padding:12px 14px; display:flex; gap:12px; align-items:flex-start; cursor:pointer;">
            <div style="padding-top:2px;">
                <input type="checkbox" data-supplier="${escapeHtml(supplier.id)}" ${checked ? 'checked' : ''} />
            </div>
            <div style="flex:1;">
                <div style="display:flex; justify-content:space-between; gap:12px; align-items:center;">
                    <div style="display:flex; align-items:center; gap:10px;">
                        <strong>${escapeHtml(supplier.name)}</strong>
                        <span class="settings-note">(${escapeHtml(supplier.id)})</span>
                    </div>
                    ${statusPill}
                </div>
                <div class="settings-note" style="margin-top:4px;">${escapeHtml(supplier.description || '')}</div>
            </div>
        </label>
    `;
}

function escapeHtml(value) {
    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}
