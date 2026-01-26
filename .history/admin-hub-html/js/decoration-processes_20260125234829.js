/**
 * Decoration Processes Page - DecoNetwork style
 * Process cards for DTG, EMB, SCR, HTV, DTF with summary + edit links
 */

const DECORATION_PROCESSES_STORAGE_KEY = 'adminHub.decorationProcesses';

const DEFAULT_PROCESSES = [
    {
        id: 'dtg',
        name: 'DTG (Direct to Garment)',
        shortName: 'DTG',
        enabled: true,
        pricingMethod: 'Single price',
        productionFile: 'PNG, 300 DPI',
        availability: 'All products',
        artworkFee: '£0.00',
        colorPalette: 'Full Color',
        designTypes: 'Raster, Vector',
        productionDPI: '300',
        icon: 'fa-tshirt'
    },
    {
        id: 'sub',
        name: 'Sublimation',
        shortName: 'SUB',
        enabled: false,
        pricingMethod: 'Single price',
        productionFile: 'PNG, 300 DPI',
        availability: 'Polyester products',
        artworkFee: '£0.00',
        colorPalette: 'Full Color',
        designTypes: 'Raster',
        productionDPI: '300',
        icon: 'fa-magic'
    },
    {
        id: 'emb',
        name: 'Embroidery',
        shortName: 'EMB',
        enabled: true,
        pricingMethod: 'Pricing table',
        productionFile: 'DST, PES',
        availability: 'All fabric products',
        artworkFee: '£20.00',
        colorPalette: 'Thread Colors (15)',
        designTypes: 'Vector',
        productionDPI: 'N/A',
        stitchCount: '0-30000',
        icon: 'fa-cut'
    },
    {
        id: 'scr',
        name: 'Screen Printing',
        shortName: 'SCR',
        enabled: true,
        pricingMethod: 'Pricing table',
        productionFile: 'Vector (AI, EPS)',
        availability: 'Apparel only',
        artworkFee: '£40.00',
        colorPalette: 'Spot Colors (max 6)',
        designTypes: 'Vector',
        productionDPI: 'N/A',
        icon: 'fa-print'
    },
    {
        id: 'htv',
        name: 'Heat Transfer Vinyl',
        shortName: 'HTV',
        enabled: true,
        pricingMethod: 'Single price',
        productionFile: 'Vector (AI, EPS)',
        availability: 'All products',
        artworkFee: '£0.00',
        colorPalette: 'Vinyl Colors',
        designTypes: 'Vector',
        productionDPI: 'N/A',
        icon: 'fa-fire'
    },
    {
        id: 'dtf',
        name: 'DTF (Direct to Film)',
        shortName: 'DTF',
        enabled: true,
        pricingMethod: 'Single price',
        productionFile: 'PNG, 300 DPI',
        availability: 'All fabric products',
        artworkFee: '£0.00',
        colorPalette: 'Full Color',
        designTypes: 'Raster, Vector',
        productionDPI: '300',
        icon: 'fa-layer-group'
    }
];

let processesState = deepCloneDP(DEFAULT_PROCESSES);
let editingProcessId = null;

function initDecorationProcessesListPage() {
    loadProcessesState();

    const container = document.getElementById('page-decoration-processes-list');
    if (!container) return;

    container.innerHTML = `
        <div class="page-header">
            <div class="breadcrumb">
                <a href="#" class="link-blue" onclick="navigateTo('decoration-pricing');return false;">Decoration</a> / Processes List
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
                <h1 class="page-title">Decoration Processes</h1>
                <button class="btn btn-primary" id="addProcessBtn"><i class="fas fa-plus"></i> Add Process</button>
            </div>
        </div>

        <div class="settings-page">
            <div class="settings-body">
                <div class="processes-grid" id="processesGrid"></div>
            </div>
        </div>

        <div id="processModal" class="modal-overlay" aria-hidden="true"></div>
    `;

    container.querySelector('#addProcessBtn').addEventListener('click', () => {
        showToast('Add new process functionality coming soon!', 'info');
    });

    renderProcessCards();
}

function renderProcessCards() {
    const grid = document.getElementById('processesGrid');
    if (!grid) return;

    grid.innerHTML = processesState.map(p => `
        <div class="process-card ${p.enabled ? '' : 'disabled'}" data-id="${p.id}">
            <div class="process-card-header">
                <div class="process-icon"><i class="fas ${p.icon}"></i></div>
                <div class="process-title">
                    <h3>${escapeHtmlDP(p.name)}</h3>
                    <span class="process-status ${p.enabled ? 'enabled' : 'disabled'}">${p.enabled ? 'Enabled' : 'Disabled'}</span>
                </div>
                <div class="process-toggle">
                    <label class="switch">
                        <input type="checkbox" ${p.enabled ? 'checked' : ''} data-action="toggle" />
                        <span class="slider"></span>
                    </label>
                </div>
            </div>
            <div class="process-card-body">
                <div class="process-summary">
                    <div class="summary-row">
                        <span class="summary-label">Name:</span>
                        <span class="summary-value link-blue" data-field="name">${escapeHtmlDP(p.shortName)}</span>
                    </div>
                    <div class="summary-row">
                        <span class="summary-label">Current Pricing Method:</span>
                        <span class="summary-value link-blue" data-field="pricingMethod">${escapeHtmlDP(p.pricingMethod)}</span>
                    </div>
                    <div class="summary-row">
                        <span class="summary-label">Production File:</span>
                        <span class="summary-value link-blue" data-field="productionFile">${escapeHtmlDP(p.productionFile)}</span>
                    </div>
                    <div class="summary-row">
                        <span class="summary-label">Availability:</span>
                        <span class="summary-value link-blue" data-field="availability">${escapeHtmlDP(p.availability)}</span>
                    </div>
                    <div class="summary-row">
                        <span class="summary-label">Artwork Fee:</span>
                        <span class="summary-value link-blue" data-field="artworkFee">${escapeHtmlDP(p.artworkFee)}</span>
                    </div>
                    <div class="summary-row">
                        <span class="summary-label">Color Palette:</span>
                        <span class="summary-value link-blue" data-field="colorPalette">${escapeHtmlDP(p.colorPalette)}</span>
                    </div>
                    <div class="summary-row">
                        <span class="summary-label">Design Types:</span>
                        <span class="summary-value link-blue" data-field="designTypes">${escapeHtmlDP(p.designTypes)}</span>
                    </div>
                    <div class="summary-row">
                        <span class="summary-label">Production DPI:</span>
                        <span class="summary-value link-blue" data-field="productionDPI">${escapeHtmlDP(p.productionDPI)}</span>
                    </div>
                    ${p.stitchCount ? `
                    <div class="summary-row">
                        <span class="summary-label">Stitch Count:</span>
                        <span class="summary-value link-blue" data-field="stitchCount">${escapeHtmlDP(p.stitchCount)}</span>
                    </div>
                    ` : ''}
                </div>
            </div>
            <div class="process-card-footer">
                <button class="btn btn-secondary-sm link-blue" data-action="edit"><i class="fas fa-edit"></i> Edit Process</button>
                <button class="btn btn-secondary-sm" data-action="pricing"><i class="fas fa-pound-sign"></i> Edit Pricing</button>
            </div>
        </div>
    `).join('');

    grid.querySelectorAll('.process-card').forEach(card => {
        const id = card.getAttribute('data-id');

        card.querySelector('[data-action="toggle"]')?.addEventListener('change', e => {
            const proc = processesState.find(p => p.id === id);
            if (proc) {
                proc.enabled = e.target.checked;
                saveProcessesState();
                renderProcessCards();
                showToast(`${proc.shortName} ${proc.enabled ? 'enabled' : 'disabled'}.`, 'success');
            }
        });

        card.querySelector('[data-action="edit"]')?.addEventListener('click', () => openProcessEditor(id));
        card.querySelector('[data-action="pricing"]')?.addEventListener('click', () => {
            navigateTo('decoration-pricing');
        });

        // Make summary values clickable
        card.querySelectorAll('.summary-value[data-field]').forEach(val => {
            val.addEventListener('click', () => openProcessEditor(id, val.getAttribute('data-field')));
        });
    });
}

function openProcessEditor(id, focusField = null) {
    const overlay = document.getElementById('processModal');
    if (!overlay) return;

    editingProcessId = id;
    const process = { ...processesState.find(p => p.id === id) };

    overlay.innerHTML = `
        <div class="modal-container" style="max-width:650px;">
            <div class="modal-header">
                <h2><i class="fas ${process.icon}"></i> Edit ${process.name}</h2>
                <button class="modal-close" data-action="close"><i class="fas fa-times"></i></button>
            </div>
            <div class="modal-body">
                <div class="form-row">
                    <div class="form-group">
                        <label>Short Name</label>
                        <input class="input" id="procName" value="${escapeHtmlDP(process.shortName)}" />
                    </div>
                    <div class="form-group">
                        <label>Full Name</label>
                        <input class="input" id="procFullName" value="${escapeHtmlDP(process.name)}" />
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Pricing Method</label>
                        <select class="input" id="procPricingMethod">
                            <option value="Single price" ${process.pricingMethod === 'Single price' ? 'selected' : ''}>Single price</option>
                            <option value="Pricing table" ${process.pricingMethod === 'Pricing table' ? 'selected' : ''}>Pricing table</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Production File</label>
                        <input class="input" id="procProductionFile" value="${escapeHtmlDP(process.productionFile)}" />
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Availability</label>
                        <input class="input" id="procAvailability" value="${escapeHtmlDP(process.availability)}" />
                    </div>
                    <div class="form-group">
                        <label>Artwork Fee</label>
                        <input class="input" id="procArtworkFee" value="${escapeHtmlDP(process.artworkFee)}" />
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Color Palette</label>
                        <input class="input" id="procColorPalette" value="${escapeHtmlDP(process.colorPalette)}" />
                    </div>
                    <div class="form-group">
                        <label>Design Types</label>
                        <input class="input" id="procDesignTypes" value="${escapeHtmlDP(process.designTypes)}" />
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Production DPI</label>
                        <input class="input" id="procProductionDPI" value="${escapeHtmlDP(process.productionDPI)}" />
                    </div>
                    ${process.stitchCount !== undefined ? `
                    <div class="form-group">
                        <label>Stitch Count Range</label>
                        <input class="input" id="procStitchCount" value="${escapeHtmlDP(process.stitchCount || '')}" />
                    </div>
                    ` : '<div class="form-group"></div>'}
                </div>
                <div class="form-group" style="margin-top:16px;">
                    <label class="checkbox-label">
                        <input type="checkbox" id="procEnabled" ${process.enabled ? 'checked' : ''} />
                        Enabled
                    </label>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" data-action="cancel">Cancel</button>
                <button class="btn btn-primary" data-action="save">Save Changes</button>
            </div>
        </div>
    `;

    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';

    // Focus specific field if requested
    if (focusField) {
        const fieldMap = {
            'name': 'procName',
            'pricingMethod': 'procPricingMethod',
            'productionFile': 'procProductionFile',
            'availability': 'procAvailability',
            'artworkFee': 'procArtworkFee',
            'colorPalette': 'procColorPalette',
            'designTypes': 'procDesignTypes',
            'productionDPI': 'procProductionDPI',
            'stitchCount': 'procStitchCount'
        };
        const el = overlay.querySelector(`#${fieldMap[focusField]}`);
        if (el) setTimeout(() => el.focus(), 100);
    }

    overlay.querySelector('[data-action="close"]').addEventListener('click', closeProcessModal);
    overlay.querySelector('[data-action="cancel"]').addEventListener('click', closeProcessModal);
    overlay.querySelector('[data-action="save"]').addEventListener('click', () => {
        process.shortName = overlay.querySelector('#procName').value.trim();
        process.name = overlay.querySelector('#procFullName').value.trim();
        process.pricingMethod = overlay.querySelector('#procPricingMethod').value;
        process.productionFile = overlay.querySelector('#procProductionFile').value.trim();
        process.availability = overlay.querySelector('#procAvailability').value.trim();
        process.artworkFee = overlay.querySelector('#procArtworkFee').value.trim();
        process.colorPalette = overlay.querySelector('#procColorPalette').value.trim();
        process.designTypes = overlay.querySelector('#procDesignTypes').value.trim();
        process.productionDPI = overlay.querySelector('#procProductionDPI').value.trim();
        process.enabled = overlay.querySelector('#procEnabled').checked;

        const stitchEl = overlay.querySelector('#procStitchCount');
        if (stitchEl) process.stitchCount = stitchEl.value.trim();

        const idx = processesState.findIndex(p => p.id === id);
        if (idx !== -1) processesState[idx] = process;

        saveProcessesState();
        closeProcessModal();
        renderProcessCards();
        showToast('Process updated.', 'success');
    });
}

function closeProcessModal() {
    const overlay = document.getElementById('processModal');
    if (!overlay) return;
    overlay.classList.remove('open');
    overlay.innerHTML = '';
    if (document.querySelectorAll('.modal-overlay.open').length === 0) {
        document.body.style.overflow = '';
    }
    editingProcessId = null;
}

function loadProcessesState() {
    processesState = deepCloneDP(DEFAULT_PROCESSES);

    try {
        const raw = localStorage.getItem(DECORATION_PROCESSES_STORAGE_KEY);
        if (!raw) return;
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
            processesState = parsed;
        }
    } catch {
        // ignore
    }
}

function saveProcessesState() {
    localStorage.setItem(DECORATION_PROCESSES_STORAGE_KEY, JSON.stringify(processesState));
}

function deepCloneDP(obj) { return JSON.parse(JSON.stringify(obj)); }
function escapeHtmlDP(value) {
    return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}
