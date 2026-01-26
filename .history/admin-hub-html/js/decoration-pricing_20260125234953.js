/**
 * Decoration Pricing Page - DecoNetwork style
 * Pricing mode, per-process pricing, Price Table editors
 */

const DECORATION_PRICING_STORAGE_KEY = 'adminHub.decorationPricing';

const DEFAULT_PRICING = {
    pricingMode: 'advanced', // flat or advanced
    processes: {
        dtg: { type: 'single', singlePrice: 5.00, setupFee: 0, tableId: null },
        emb: { type: 'table', singlePrice: 0, setupFee: 20.00, tableId: 'emb-default' },
        scr: { type: 'table', singlePrice: 0, setupFee: 40.00, tableId: 'scr-default' },
        htv: { type: 'single', singlePrice: 5.00, setupFee: 0, tableId: null },
        dtf: { type: 'single', singlePrice: 5.00, setupFee: 0, tableId: null }
    }
};

const DEFAULT_PRICE_TABLES = {
    'emb-default': {
        id: 'emb-default',
        name: 'Default Embroidery Table',
        processType: 'emb',
        tableType: 'stitch', // stitch or area
        stitchRanges: ['0-6999', '7000-7999', '8000-9999', '10000-14999', '15000-19999', '20000-24999', '25000-30000'],
        qtyColumns: ['1-4', '5-9', '10-24', '25-49', '50-99', '100-249', '250-499', '500+'],
        data: [
            [8.50, 7.50, 6.50, 5.75, 5.25, 4.75, 4.25, 3.75],
            [9.00, 8.00, 7.00, 6.25, 5.75, 5.25, 4.75, 4.25],
            [9.50, 8.50, 7.50, 6.75, 6.25, 5.75, 5.25, 4.75],
            [10.50, 9.50, 8.50, 7.75, 7.25, 6.75, 6.25, 5.75],
            [12.00, 11.00, 10.00, 9.25, 8.75, 8.25, 7.75, 7.25],
            [14.00, 13.00, 12.00, 11.25, 10.75, 10.25, 9.75, 9.25],
            [16.00, 15.00, 14.00, 13.25, 12.75, 12.25, 11.75, 11.25]
        ]
    },
    'scr-default': {
        id: 'scr-default',
        name: 'Default Screen Print Table',
        processType: 'scr',
        tableType: 'area',
        areaRanges: ['0-25 cm²', '25-50 cm²', '50-100 cm²', '100-200 cm²', '200-400 cm²', '400+ cm²'],
        qtyColumns: ['1-4', '5-9', '10-24', '25-49', '50-99', '100-249', '250-499', '500+'],
        data: [
            [3.50, 3.00, 2.50, 2.25, 2.00, 1.75, 1.50, 1.25],
            [4.50, 4.00, 3.50, 3.25, 3.00, 2.75, 2.50, 2.25],
            [5.50, 5.00, 4.50, 4.25, 4.00, 3.75, 3.50, 3.25],
            [7.00, 6.50, 6.00, 5.75, 5.50, 5.25, 5.00, 4.75],
            [9.00, 8.50, 8.00, 7.75, 7.50, 7.25, 7.00, 6.75],
            [12.00, 11.50, 11.00, 10.75, 10.50, 10.25, 10.00, 9.75]
        ]
    }
};

let pricingState = JSON.parse(JSON.stringify(DEFAULT_PRICING));
let priceTablesState = JSON.parse(JSON.stringify(DEFAULT_PRICE_TABLES));
let editingTableId = null;

function initDecorationPricingPage() {
    loadPricingState();

    const container = document.getElementById('page-decoration-pricing');
    if (!container) return;

    container.innerHTML = `
        <div class="page-header">
            <div class="breadcrumb">
                <a href="#" class="link-blue" onclick="navigateTo('decoration-processes-list');return false;">Decoration</a> / Pricing
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
                <h1 class="page-title">Decoration Pricing</h1>
                <button class="btn btn-primary" id="savePricingBtn"><i class="fas fa-save"></i> Save All Changes</button>
            </div>
        </div>

        <div class="settings-page">
            <div class="settings-body">
                <div class="two-col-layout">
                    <div class="left-col">
                        <div class="section-title">Pricing Mode</div>
                        <div class="settings-note">Choose how decoration pricing is calculated. Flat mode uses a single price, Advanced mode allows per-process configuration.</div>
                    </div>
                    <div class="right-col">
                        <div class="card">
                            <div class="card-body">
                                <div class="radio-group">
                                    <label class="radio-label">
                                        <input type="radio" name="pricingMode" value="flat" ${pricingState.pricingMode === 'flat' ? 'checked' : ''} />
                                        <strong>Flat Pricing</strong> - Single price per decoration
                                    </label>
                                    <label class="radio-label">
                                        <input type="radio" name="pricingMode" value="advanced" ${pricingState.pricingMode === 'advanced' ? 'checked' : ''} />
                                        <strong>Advanced Pricing</strong> - Configure pricing per process
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div id="advancedPricingSection" class="${pricingState.pricingMode === 'flat' ? 'hidden' : ''}">
                    <div class="section-divider"></div>

                    <div class="two-col-layout">
                        <div class="left-col">
                            <div class="section-title">Process Pricing</div>
                            <div class="settings-note">Configure pricing for each decoration process. Choose between single price or pricing table.</div>
                        </div>
                        <div class="right-col">
                            <div class="pricing-processes" id="pricingProcesses"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div id="priceTableModal" class="modal-overlay" aria-hidden="true"></div>
    `;

    // Pricing mode toggle
    container.querySelectorAll('input[name="pricingMode"]').forEach(radio => {
        radio.addEventListener('change', e => {
            pricingState.pricingMode = e.target.value;
            container.querySelector('#advancedPricingSection').classList.toggle('hidden', pricingState.pricingMode === 'flat');
        });
    });

    container.querySelector('#savePricingBtn').addEventListener('click', () => {
        savePricingState();
        showToast('Pricing settings saved.', 'success');
    });

    renderPricingProcesses();
}

function renderPricingProcesses() {
    const container = document.getElementById('pricingProcesses');
    if (!container) return;

    const processes = [
        { id: 'dtg', name: 'DTG (Direct to Garment)', icon: 'fa-tshirt' },
        { id: 'emb', name: 'Embroidery', icon: 'fa-cut' },
        { id: 'scr', name: 'Screen Printing', icon: 'fa-print' },
        { id: 'htv', name: 'Heat Transfer Vinyl', icon: 'fa-fire' },
        { id: 'dtf', name: 'DTF (Direct to Film)', icon: 'fa-layer-group' }
    ];

    container.innerHTML = processes.map(proc => {
        const config = pricingState.processes[proc.id];
        const hasTable = config.type === 'table';
        const table = hasTable && config.tableId ? priceTablesState[config.tableId] : null;

        return `
            <div class="pricing-process-card" data-process="${proc.id}">
                <div class="pricing-process-header">
                    <div class="pricing-process-icon"><i class="fas ${proc.icon}"></i></div>
                    <div class="pricing-process-name">${proc.name}</div>
                </div>
                <div class="pricing-process-body">
                    <div class="pricing-type-selector">
                        <label class="radio-label">
                            <input type="radio" name="pricingType_${proc.id}" value="single" ${config.type === 'single' ? 'checked' : ''} />
                            Single price
                        </label>
                        <label class="radio-label">
                            <input type="radio" name="pricingType_${proc.id}" value="table" ${config.type === 'table' ? 'checked' : ''} />
                            Pricing table
                        </label>
                    </div>

                    <div class="pricing-single-section ${config.type === 'table' ? 'hidden' : ''}" data-section="single">
                        <div class="form-row">
                            <div class="form-group">
                                <label>Price (£)</label>
                                <input type="number" class="input" step="0.01" min="0" data-field="singlePrice" value="${config.singlePrice.toFixed(2)}" />
                            </div>
                        </div>
                    </div>

                    <div class="pricing-table-section ${config.type === 'single' ? 'hidden' : ''}" data-section="table">
                        <div class="form-row" style="align-items:flex-end;">
                            <div class="form-group">
                                <label>Pricing Table</label>
                                <select class="input" data-field="tableId">
                                    <option value="">-- Select Table --</option>
                                    ${Object.values(priceTablesState)
                                        .filter(t => t.processType === proc.id || !t.processType)
                                        .map(t => `<option value="${t.id}" ${config.tableId === t.id ? 'selected' : ''}>${t.name}</option>`)
                                        .join('')}
                                </select>
                            </div>
                            <button class="btn btn-secondary link-blue" data-action="editTable" ${!config.tableId ? 'disabled' : ''}>
                                <i class="fas fa-edit"></i> Edit Table
                            </button>
                            <button class="btn btn-secondary" data-action="newTable">
                                <i class="fas fa-plus"></i> Add Table
                            </button>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Setup Fee (£)</label>
                                <input type="number" class="input" step="0.01" min="0" data-field="setupFee" value="${config.setupFee.toFixed(2)}" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    // Wire events
    container.querySelectorAll('.pricing-process-card').forEach(card => {
        const procId = card.getAttribute('data-process');

        // Pricing type toggle
        card.querySelectorAll(`input[name="pricingType_${procId}"]`).forEach(radio => {
            radio.addEventListener('change', e => {
                pricingState.processes[procId].type = e.target.value;
                card.querySelector('[data-section="single"]').classList.toggle('hidden', e.target.value === 'table');
                card.querySelector('[data-section="table"]').classList.toggle('hidden', e.target.value === 'single');
            });
        });

        // Single price
        card.querySelector('[data-field="singlePrice"]')?.addEventListener('change', e => {
            pricingState.processes[procId].singlePrice = parseFloat(e.target.value) || 0;
        });

        // Setup fee
        card.querySelector('[data-field="setupFee"]')?.addEventListener('change', e => {
            pricingState.processes[procId].setupFee = parseFloat(e.target.value) || 0;
        });

        // Table selector
        card.querySelector('[data-field="tableId"]')?.addEventListener('change', e => {
            pricingState.processes[procId].tableId = e.target.value || null;
            card.querySelector('[data-action="editTable"]').disabled = !e.target.value;
        });

        // Edit table
        card.querySelector('[data-action="editTable"]')?.addEventListener('click', () => {
            const tableId = pricingState.processes[procId].tableId;
            if (tableId) openPriceTableEditor(tableId, procId);
        });

        // New table
        card.querySelector('[data-action="newTable"]')?.addEventListener('click', () => {
            createNewPriceTable(procId);
        });
    });
}

function createNewPriceTable(processId) {
    const tableId = `${processId}-${Date.now()}`;
    const isStitchBased = processId === 'emb';

    const newTable = {
        id: tableId,
        name: `New ${processId.toUpperCase()} Table`,
        processType: processId,
        tableType: isStitchBased ? 'stitch' : 'area',
        ...(isStitchBased ? {
            stitchRanges: ['0-6999', '7000-9999', '10000-14999', '15000+'],
            qtyColumns: ['1-4', '5-9', '10-24', '25-49', '50+'],
            data: [
                [8.00, 7.00, 6.00, 5.00, 4.00],
                [9.00, 8.00, 7.00, 6.00, 5.00],
                [10.00, 9.00, 8.00, 7.00, 6.00],
                [12.00, 11.00, 10.00, 9.00, 8.00]
            ]
        } : {
            areaRanges: ['0-25 cm²', '25-50 cm²', '50-100 cm²', '100+ cm²'],
            qtyColumns: ['1-4', '5-9', '10-24', '25-49', '50+'],
            data: [
                [3.00, 2.50, 2.00, 1.75, 1.50],
                [4.00, 3.50, 3.00, 2.75, 2.50],
                [5.00, 4.50, 4.00, 3.75, 3.50],
                [6.00, 5.50, 5.00, 4.75, 4.50]
            ]
        })
    };

    priceTablesState[tableId] = newTable;
    pricingState.processes[processId].tableId = tableId;
    savePricingState();
    renderPricingProcesses();
    openPriceTableEditor(tableId, processId);
}

function openPriceTableEditor(tableId, processId) {
    const overlay = document.getElementById('priceTableModal');
    if (!overlay) return;

    editingTableId = tableId;
    const table = JSON.parse(JSON.stringify(priceTablesState[tableId]));
    if (!table) return;

    const isStitch = table.tableType === 'stitch';
    const rows = isStitch ? table.stitchRanges : table.areaRanges;
    const cols = table.qtyColumns;

    overlay.innerHTML = `
        <div class="modal-container price-table-modal">
            <div class="modal-header">
                <h2><i class="fas fa-table"></i> Edit Price Table - ${table.name}</h2>
                <button class="modal-close" data-action="close"><i class="fas fa-times"></i></button>
            </div>
            <div class="modal-body">
                <div class="form-row" style="margin-bottom:16px;">
                    <div class="form-group">
                        <label>Table Name</label>
                        <input class="input" id="tableNameInput" value="${escapeHtmlPR(table.name)}" />
                    </div>
                </div>

                <div class="price-table-container">
                    <div class="price-table-header">
                        <div class="price-table-corner">${isStitch ? 'Stitch Count' : 'Size (cm²)'}</div>
                        <div class="price-table-qty-header">
                            ${cols.map((c, i) => `<div class="price-table-qty-cell"><input class="qty-input link-blue" data-col="${i}" value="${c}" /></div>`).join('')}
                            <div class="price-table-qty-cell add-col"><button class="btn btn-sm" data-action="addCol"><i class="fas fa-plus"></i></button></div>
                        </div>
                    </div>
                    <div class="price-table-body" id="priceTableBody">
                        ${rows.map((r, ri) => `
                            <div class="price-table-row" data-row="${ri}">
                                <div class="price-table-row-label">
                                    <input class="row-label-input link-blue" data-row="${ri}" value="${r}" />
                                    <button class="btn btn-sm btn-danger" data-action="removeRow" data-row="${ri}"><i class="fas fa-trash"></i></button>
                                </div>
                                <div class="price-table-row-cells">
                                    ${table.data[ri].map((v, ci) => `<div class="price-table-cell"><input type="number" step="0.01" class="price-input link-blue" data-row="${ri}" data-col="${ci}" value="${v.toFixed(2)}" /></div>`).join('')}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    <div class="price-table-footer">
                        <button class="btn btn-secondary" data-action="addRow"><i class="fas fa-plus"></i> Add ${isStitch ? 'Stitch Range' : 'Size Range'}</button>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-danger" data-action="delete">Delete Table</button>
                <button class="btn btn-secondary" data-action="cancel">Cancel</button>
                <button class="btn btn-primary" data-action="save">Save Table</button>
            </div>
        </div>
    `;

    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';

    // Wire events
    overlay.querySelector('[data-action="close"]').addEventListener('click', closePriceTableModal);
    overlay.querySelector('[data-action="cancel"]').addEventListener('click', closePriceTableModal);

    overlay.querySelector('[data-action="addRow"]').addEventListener('click', () => {
        const newRow = isStitch ? '0-0' : '0-0 cm²';
        if (isStitch) {
            table.stitchRanges.push(newRow);
        } else {
            table.areaRanges.push(newRow);
        }
        table.data.push(cols.map(() => 0));
        priceTablesState[tableId] = table;
        openPriceTableEditor(tableId, processId);
    });

    overlay.querySelector('[data-action="addCol"]')?.addEventListener('click', () => {
        table.qtyColumns.push('0+');
        table.data.forEach(row => row.push(0));
        priceTablesState[tableId] = table;
        openPriceTableEditor(tableId, processId);
    });

    overlay.querySelectorAll('[data-action="removeRow"]').forEach(btn => {
        btn.addEventListener('click', () => {
            const ri = parseInt(btn.getAttribute('data-row'));
            if (isStitch) {
                table.stitchRanges.splice(ri, 1);
            } else {
                table.areaRanges.splice(ri, 1);
            }
            table.data.splice(ri, 1);
            priceTablesState[tableId] = table;
            openPriceTableEditor(tableId, processId);
        });
    });

    overlay.querySelector('[data-action="delete"]').addEventListener('click', () => {
        if (!confirm(`Delete "${table.name}"?`)) return;
        delete priceTablesState[tableId];
        if (pricingState.processes[processId]?.tableId === tableId) {
            pricingState.processes[processId].tableId = null;
        }
        savePricingState();
        closePriceTableModal();
        renderPricingProcesses();
        showToast('Table deleted.', 'success');
    });

    overlay.querySelector('[data-action="save"]').addEventListener('click', () => {
        // Read all values
        table.name = overlay.querySelector('#tableNameInput').value.trim() || table.name;

        // Read column headers
        overlay.querySelectorAll('.qty-input').forEach(input => {
            const ci = parseInt(input.getAttribute('data-col'));
            table.qtyColumns[ci] = input.value;
        });

        // Read row labels
        overlay.querySelectorAll('.row-label-input').forEach(input => {
            const ri = parseInt(input.getAttribute('data-row'));
            if (isStitch) {
                table.stitchRanges[ri] = input.value;
            } else {
                table.areaRanges[ri] = input.value;
            }
        });

        // Read prices
        overlay.querySelectorAll('.price-input').forEach(input => {
            const ri = parseInt(input.getAttribute('data-row'));
            const ci = parseInt(input.getAttribute('data-col'));
            table.data[ri][ci] = parseFloat(input.value) || 0;
        });

        priceTablesState[tableId] = table;
        savePricingState();
        closePriceTableModal();
        renderPricingProcesses();
        showToast('Table saved.', 'success');
    });
}

function closePriceTableModal() {
    const overlay = document.getElementById('priceTableModal');
    if (!overlay) return;
    overlay.classList.remove('open');
    overlay.innerHTML = '';
    if (document.querySelectorAll('.modal-overlay.open').length === 0) {
        document.body.style.overflow = '';
    }
    editingTableId = null;
}

function loadPricingState() {
    pricingState = JSON.parse(JSON.stringify(DEFAULT_PRICING));
    priceTablesState = JSON.parse(JSON.stringify(DEFAULT_PRICE_TABLES));

    try {
        const raw = localStorage.getItem(DECORATION_PRICING_STORAGE_KEY);
        if (!raw) return;
        const parsed = JSON.parse(raw);
        if (parsed.pricing) {
            pricingState = { ...pricingState, ...parsed.pricing };
        }
        if (parsed.tables) {
            priceTablesState = { ...priceTablesState, ...parsed.tables };
        }
    } catch {
        // ignore
    }
}

function savePricingState() {
    localStorage.setItem(DECORATION_PRICING_STORAGE_KEY, JSON.stringify({
        pricing: pricingState,
        tables: priceTablesState
    }));
}

function escapeHtmlPR(value) {
    return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}
