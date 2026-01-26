/**
 * Volume Discounts Page - DecoNetwork style
 */

const VOLUME_DISCOUNTS_STORAGE_KEY = 'adminHub.volumeDiscounts';

const DEFAULT_VOLUME_DISCOUNTS = {
    name: 'Add Discount',
    isDefault: true,
    applyToBaseOnly: true,
    discountApplyOver: 'line', // 'line' | 'order'
    levels: [
        { moreThan: 8, discount: 12.00 },
        { moreThan: 24, discount: 20.50 },
        { moreThan: 49, discount: 27.50 },
        { moreThan: 99, discount: 28.00 },
        { moreThan: 299, discount: 35.00 }
    ]
};

let volumeDiscountsState = deepClone(DEFAULT_VOLUME_DISCOUNTS);
let volumeDiscountsSaved = deepClone(DEFAULT_VOLUME_DISCOUNTS);

function initVolumeDiscountsPage() {
    loadVolumeDiscountsState();

    const container = document.getElementById('page-volume-discounts');
    if (!container) return;

    container.innerHTML = `
        <div class="page-header">
            <div class="breadcrumb">
                <a href="#" class="link-blue" onclick="navigateTo('products');return false;">Products</a> / Volume Discounts / Add Discount
            </div>
            <h1 class="page-title">Volume Discounts</h1>
        </div>

        <div class="settings-page">
            <div class="settings-header">
                <div>
                    <h2 style="margin:0;">Configure discount</h2>
                    <div class="settings-note">Configure your volume discount details</div>
                </div>
                <div class="settings-row">
                    <button class="btn btn-primary" id="saveVolumeBtn"><i class="fas fa-save"></i> Save</button>
                    <button class="btn btn-secondary" id="cancelVolumeBtn">Cancel</button>
                </div>
            </div>

            <div class="settings-body">
                <div class="two-col-layout">
                    <div class="left-col">
                        <div class="section-title">General</div>
                    </div>
                    <div class="right-col">
                        <div class="card">
                            <div class="card-body">
                                <div class="form-group">
                                    <label>Name</label>
                                    <input class="input" id="discountName" value="${escapeHtml(volumeDiscountsState.name)}" />
                                </div>

                                <div class="form-group" style="margin-top:14px;">
                                    <label class="checkbox-label">
                                        <input type="checkbox" id="isDefault" ${volumeDiscountsState.isDefault ? 'checked' : ''} />
                                        Is Default Discount Configuration
                                    </label>
                                </div>

                                <div class="form-group" style="margin-top:10px; margin-left:24px;">
                                    <label class="checkbox-label">
                                        <input type="checkbox" id="applyToBaseOnly" ${volumeDiscountsState.applyToBaseOnly ? 'checked' : ''} />
                                        Apply to base price only (don't include decorations)
                                    </label>
                                </div>

                                <div class="form-group" style="margin-top:18px;">
                                    <label>Discounts apply over <span class="help-icon" title="How quantity is calculated for discount tiers"><i class="fas fa-question-circle"></i></span></label>
                                    <div class="radio-row" style="margin-top:8px;">
                                        <label class="radio-item">
                                            <input type="radio" name="discountApplyOver" value="line" ${volumeDiscountsState.discountApplyOver === 'line' ? 'checked' : ''} />
                                            <span>Each line item</span>
                                        </label>
                                        <label class="radio-item">
                                            <input type="radio" name="discountApplyOver" value="order" ${volumeDiscountsState.discountApplyOver === 'order' ? 'checked' : ''} />
                                            <span>All order item</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="two-col-layout" style="margin-top:24px;">
                    <div class="left-col">
                        <div class="section-title">Discount levels</div>
                        <div class="settings-note">Discount levels can be set by the fulfillment center based on quantity of items per order line. Define number of items and % discount for the particular discount level.</div>
                    </div>
                    <div class="right-col">
                        <div class="card">
                            <div class="card-body">
                                <div class="table-wrap">
                                    <table class="table" id="discountLevelsTable">
                                        <thead>
                                            <tr>
                                                <th style="width:140px;">More Than</th>
                                                <th style="width:180px;">Discount</th>
                                                <th class="actions">&nbsp;</th>
                                            </tr>
                                        </thead>
                                        <tbody id="discountLevelsTbody"></tbody>
                                    </table>
                                </div>
                                <div style="margin-top:12px;">
                                    <button class="btn btn-secondary" id="addDiscountLevelBtn"><i class="fas fa-plus"></i> Add Discount Level</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    wireVolumeDiscountsEvents(container);
    renderDiscountLevels();
}

function wireVolumeDiscountsEvents(container) {
    const nameInput = container.querySelector('#discountName');
    const isDefaultCb = container.querySelector('#isDefault');
    const applyBaseCb = container.querySelector('#applyToBaseOnly');
    const applyOverRadios = container.querySelectorAll('input[name="discountApplyOver"]');

    nameInput.addEventListener('input', () => volumeDiscountsState.name = nameInput.value);
    isDefaultCb.addEventListener('change', () => volumeDiscountsState.isDefault = isDefaultCb.checked);
    applyBaseCb.addEventListener('change', () => volumeDiscountsState.applyToBaseOnly = applyBaseCb.checked);
    applyOverRadios.forEach(r => r.addEventListener('change', () => {
        volumeDiscountsState.discountApplyOver = r.value;
    }));

    container.querySelector('#saveVolumeBtn').addEventListener('click', () => {
        if (!volumeDiscountsState.name.trim()) {
            showToast('Name is required.', 'error');
            return;
        }
        localStorage.setItem(VOLUME_DISCOUNTS_STORAGE_KEY, JSON.stringify(volumeDiscountsState));
        volumeDiscountsSaved = deepClone(volumeDiscountsState);
        showToast('Volume discounts saved.', 'success');
    });

    container.querySelector('#cancelVolumeBtn').addEventListener('click', () => {
        volumeDiscountsState = deepClone(volumeDiscountsSaved);
        initVolumeDiscountsPage();
        showToast('Changes discarded.', 'info');
    });

    container.querySelector('#addDiscountLevelBtn').addEventListener('click', () => {
        const last = volumeDiscountsState.levels[volumeDiscountsState.levels.length - 1];
        const moreThan = last ? last.moreThan + 50 : 1;
        volumeDiscountsState.levels.push({ moreThan, discount: 0 });
        renderDiscountLevels();
    });
}

function renderDiscountLevels() {
    const tbody = document.getElementById('discountLevelsTbody');
    if (!tbody) return;

    tbody.innerHTML = volumeDiscountsState.levels.map((lvl, idx) => `
        <tr data-idx="${idx}">
            <td>
                <input class="input input-sm" type="number" min="0" step="1" data-field="moreThan" value="${lvl.moreThan}" style="width:100px;" />
            </td>
            <td>
                <div class="input-group">
                    <input class="input input-sm" type="number" min="0" step="0.01" data-field="discount" value="${lvl.discount}" style="width:100px;" />
                    <span class="addon">%</span>
                </div>
            </td>
            <td class="actions">
                <button class="btn btn-danger-sm" data-action="remove">Remove</button>
            </td>
        </tr>
    `).join('');

    tbody.querySelectorAll('tr[data-idx]').forEach(tr => {
        const idx = Number(tr.getAttribute('data-idx'));
        const lvl = volumeDiscountsState.levels[idx];

        tr.querySelector('[data-field="moreThan"]').addEventListener('input', e => {
            lvl.moreThan = Number(e.target.value);
        });
        tr.querySelector('[data-field="discount"]').addEventListener('input', e => {
            lvl.discount = Number(e.target.value);
        });
        tr.querySelector('[data-action="remove"]').addEventListener('click', () => {
            volumeDiscountsState.levels.splice(idx, 1);
            renderDiscountLevels();
        });
    });
}

function loadVolumeDiscountsState() {
    volumeDiscountsState = deepClone(DEFAULT_VOLUME_DISCOUNTS);
    volumeDiscountsSaved = deepClone(DEFAULT_VOLUME_DISCOUNTS);

    try {
        const raw = localStorage.getItem(VOLUME_DISCOUNTS_STORAGE_KEY);
        if (!raw) return;
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
            volumeDiscountsState = {
                ...DEFAULT_VOLUME_DISCOUNTS,
                ...parsed,
                levels: Array.isArray(parsed.levels) ? parsed.levels : DEFAULT_VOLUME_DISCOUNTS.levels
            };
            volumeDiscountsSaved = deepClone(volumeDiscountsState);
        }
    } catch {
        // ignore
    }
}

function deepClone(obj) { return JSON.parse(JSON.stringify(obj)); }
function escapeHtml(value) {
    return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}
