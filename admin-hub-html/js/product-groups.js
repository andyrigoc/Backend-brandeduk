/**
 * Product Groups Page - DecoNetwork style
 */

const PRODUCT_GROUPS_STORAGE_KEY = 'adminHub.productGroups';

const DEFAULT_PRODUCT_GROUPS = [
    { id: 1, name: 'Apparel', type: 'System', dtg: true, emb: true, scr: true, htv: true, dtf: true },
    { id: 2, name: 'Footwear', type: 'System', dtg: true, emb: true, scr: true, htv: true, dtf: true },
    { id: 3, name: 'Transfer Sheet', type: 'System', dtg: true, emb: true, scr: true, htv: true, dtf: true },
    { id: 4, name: 'Customer Supplied', type: 'System', dtg: true, emb: true, scr: true, htv: true, dtf: true },
    { id: 5, name: 'Free Form', type: 'System', dtg: true, emb: true, scr: true, htv: true, dtf: true },
    { id: 6, name: 'Sporting Goods', type: 'System', dtg: true, emb: true, scr: true, htv: true, dtf: true },
    { id: 7, name: 'Consumables/Office', type: 'System', dtg: true, emb: true, scr: true, htv: true, dtf: true },
    { id: 8, name: 'Toys', type: 'System', dtg: true, emb: true, scr: true, htv: true, dtf: true },
    { id: 9, name: 'Signs and Banners', type: 'System', dtg: true, emb: true, scr: true, htv: true, dtf: true },
    { id: 10, name: 'Promo Products', type: 'System', dtg: true, emb: true, scr: true, htv: true, dtf: true },
    { id: 11, name: 'Accessories', type: 'System', dtg: true, emb: true, scr: true, htv: true, dtf: true },
    { id: 12, name: 'Promotional Products', type: 'System', dtg: true, emb: true, scr: true, htv: true, dtf: true },
    { id: 13, name: 'Awards', type: 'System', dtg: true, emb: true, scr: true, htv: true, dtf: true },
    { id: 14, name: 'Blankets', type: 'System', dtg: true, emb: true, scr: true, htv: true, dtf: true },
    { id: 15, name: 'Robes/towels', type: 'System', dtg: true, emb: true, scr: true, htv: true, dtf: true },
    { id: 16, name: 'Caps & Hats', type: 'System', dtg: true, emb: true, scr: true, htv: true, dtf: true },
    { id: 17, name: 'Aprons', type: 'System', dtg: true, emb: true, scr: true, htv: true, dtf: true },
    { id: 18, name: 'Bags', type: 'System', dtg: true, emb: true, scr: true, htv: true, dtf: true },
    { id: 19, name: 'Mouse mats', type: 'System', dtg: true, emb: true, scr: true, htv: true, dtf: true },
    { id: 20, name: 'Mugs', type: 'System', dtg: true, emb: true, scr: true, htv: true, dtf: true }
];

let productGroupsState = deepClone(DEFAULT_PRODUCT_GROUPS);
let productGroupsSaved = deepClone(DEFAULT_PRODUCT_GROUPS);
let editingGroupId = null;

function initProductGroupsPage() {
    loadProductGroupsState();

    const container = document.getElementById('page-product-groups');
    if (!container) return;

    container.innerHTML = `
        <div class="page-header">
            <div class="breadcrumb">
                <a href="#" class="link-blue" onclick="navigateTo('products');return false;">Products</a> / Product Groups
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
                <h1 class="page-title">Product Groups</h1>
                <button class="btn btn-primary" id="newProductGroupBtn"><i class="fas fa-plus"></i> New Product Group</button>
            </div>
        </div>

        <div class="settings-page">
            <div class="settings-body">
                <div class="two-col-layout">
                    <div class="left-col">
                        <div class="section-title">Product Groups</div>
                        <div class="settings-note">Product groups allow you to define a default configuration that will be inherited by the products assigned to the group. Some settings only apply to new custom products added into the group.</div>
                        <div class="settings-note" style="margin-top:10px;"><strong>Note:</strong> You can override the default configuration when editing an individual product.</div>
                    </div>
                    <div class="right-col">
                        <div class="card">
                            <div class="card-body" style="padding:0;">
                                <div class="table-wrap">
                                    <table class="table product-groups-table">
                                        <thead>
                                            <tr>
                                                <th style="width:240px;">Name</th>
                                                <th style="width:90px;">Type</th>
                                                <th class="process-cell">DTG</th>
                                                <th class="process-cell">EMB</th>
                                                <th class="process-cell">SCR</th>
                                                <th class="process-cell">HTV</th>
                                                <th class="process-cell">DTF</th>
                                                <th class="actions" style="width:160px;">&nbsp;</th>
                                            </tr>
                                        </thead>
                                        <tbody id="productGroupsTbody"></tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        <div style="margin-top:14px;">
                            <button class="btn btn-info" id="freeFormProductGroupBtn">Free Form Product Group</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div id="productGroupModal" class="modal-overlay" aria-hidden="true"></div>
    `;

    container.querySelector('#newProductGroupBtn').addEventListener('click', () => openProductGroupEditor(null));
    container.querySelector('#freeFormProductGroupBtn').addEventListener('click', () => {
        showToast('Free Form Product Group functionality coming soon!', 'info');
    });

    renderProductGroupsTable();
}

function renderProductGroupsTable() {
    const tbody = document.getElementById('productGroupsTbody');
    if (!tbody) return;

    tbody.innerHTML = productGroupsState.map((g, idx) => {
        const check = '<i class="fas fa-check" style="color:#38a169;"></i>';
        return `
            <tr data-id="${g.id}">
                <td><strong>${escapeHtml(g.name)}</strong></td>
                <td><span class="type-badge">${escapeHtml(g.type)}</span></td>
                <td class="process-cell">${g.dtg ? check : ''}</td>
                <td class="process-cell">${g.emb ? check : ''}</td>
                <td class="process-cell">${g.scr ? check : ''}</td>
                <td class="process-cell">${g.htv ? check : ''}</td>
                <td class="process-cell">${g.dtf ? check : ''}</td>
                <td class="actions">
                    <button class="btn btn-sm" data-action="up" title="Move up"><i class="fas fa-arrow-up"></i></button>
                    <button class="btn btn-sm" data-action="down" title="Move down"><i class="fas fa-arrow-down"></i></button>
                    <button class="btn btn-secondary-sm link-blue" data-action="edit">Edit</button>
                    <button class="btn btn-secondary-sm" data-action="delete" ${g.type === 'System' ? 'disabled title="Cannot delete system groups"' : ''}>Delete</button>
                </td>
            </tr>
        `;
    }).join('');

    tbody.querySelectorAll('tr[data-id]').forEach(tr => {
        const id = Number(tr.getAttribute('data-id'));
        const idx = productGroupsState.findIndex(g => g.id === id);

        tr.querySelector('[data-action="edit"]').addEventListener('click', () => openProductGroupEditor(id));
        tr.querySelector('[data-action="delete"]').addEventListener('click', () => {
            const g = productGroupsState.find(x => x.id === id);
            if (g?.type === 'System') return;
            if (!confirm(`Delete "${g?.name}"?`)) return;
            productGroupsState = productGroupsState.filter(x => x.id !== id);
            saveProductGroupsState();
            renderProductGroupsTable();
            showToast('Group deleted.', 'success');
        });
        tr.querySelector('[data-action="up"]').addEventListener('click', () => {
            if (idx <= 0) return;
            [productGroupsState[idx - 1], productGroupsState[idx]] = [productGroupsState[idx], productGroupsState[idx - 1]];
            renderProductGroupsTable();
        });
        tr.querySelector('[data-action="down"]').addEventListener('click', () => {
            if (idx >= productGroupsState.length - 1) return;
            [productGroupsState[idx + 1], productGroupsState[idx]] = [productGroupsState[idx], productGroupsState[idx + 1]];
            renderProductGroupsTable();
        });
    });
}

function openProductGroupEditor(id) {
    const overlay = document.getElementById('productGroupModal');
    if (!overlay) return;

    editingGroupId = id;
    const isNew = id === null;
    const group = isNew ? { id: Date.now(), name: '', type: 'Custom', dtg: true, emb: true, scr: true, htv: true, dtf: true } : { ...productGroupsState.find(g => g.id === id) };

    overlay.innerHTML = `
        <div class="modal-container" style="max-width:500px;">
            <div class="modal-header">
                <h2><i class="fas fa-layer-group"></i> ${isNew ? 'New' : 'Edit'} Product Group</h2>
                <button class="modal-close" data-action="close"><i class="fas fa-times"></i></button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label>Name</label>
                    <input class="input" id="pgName" value="${escapeHtml(group.name)}" />
                </div>
                <div class="form-group" style="margin-top:16px;">
                    <label>Enabled Processes</label>
                    <div style="display:flex; gap:18px; margin-top:8px; flex-wrap:wrap;">
                        <label class="checkbox-label"><input type="checkbox" id="pgDtg" ${group.dtg ? 'checked' : ''} /> DTG</label>
                        <label class="checkbox-label"><input type="checkbox" id="pgEmb" ${group.emb ? 'checked' : ''} /> EMB</label>
                        <label class="checkbox-label"><input type="checkbox" id="pgScr" ${group.scr ? 'checked' : ''} /> SCR</label>
                        <label class="checkbox-label"><input type="checkbox" id="pgHtv" ${group.htv ? 'checked' : ''} /> HTV</label>
                        <label class="checkbox-label"><input type="checkbox" id="pgDtf" ${group.dtf ? 'checked' : ''} /> DTF</label>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" data-action="cancel">Cancel</button>
                <button class="btn btn-primary" data-action="save">Save</button>
            </div>
        </div>
    `;

    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';

    overlay.querySelector('[data-action="close"]').addEventListener('click', closeProductGroupModal);
    overlay.querySelector('[data-action="cancel"]').addEventListener('click', closeProductGroupModal);
    overlay.querySelector('[data-action="save"]').addEventListener('click', () => {
        const name = overlay.querySelector('#pgName').value.trim();
        if (!name) {
            showToast('Name is required.', 'error');
            return;
        }
        group.name = name;
        group.dtg = overlay.querySelector('#pgDtg').checked;
        group.emb = overlay.querySelector('#pgEmb').checked;
        group.scr = overlay.querySelector('#pgScr').checked;
        group.htv = overlay.querySelector('#pgHtv').checked;
        group.dtf = overlay.querySelector('#pgDtf').checked;

        if (isNew) {
            productGroupsState.push(group);
        } else {
            const idx = productGroupsState.findIndex(g => g.id === id);
            if (idx !== -1) productGroupsState[idx] = group;
        }
        saveProductGroupsState();
        closeProductGroupModal();
        renderProductGroupsTable();
        showToast('Product group saved.', 'success');
    });
}

function closeProductGroupModal() {
    const overlay = document.getElementById('productGroupModal');
    if (!overlay) return;
    overlay.classList.remove('open');
    overlay.innerHTML = '';
    if (document.querySelectorAll('.modal-overlay.open').length === 0) {
        document.body.style.overflow = '';
    }
    editingGroupId = null;
}

function loadProductGroupsState() {
    productGroupsState = deepClone(DEFAULT_PRODUCT_GROUPS);
    productGroupsSaved = deepClone(DEFAULT_PRODUCT_GROUPS);

    try {
        const raw = localStorage.getItem(PRODUCT_GROUPS_STORAGE_KEY);
        if (!raw) return;
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
            productGroupsState = parsed;
            productGroupsSaved = deepClone(parsed);
        }
    } catch {
        // ignore
    }
}

function saveProductGroupsState() {
    localStorage.setItem(PRODUCT_GROUPS_STORAGE_KEY, JSON.stringify(productGroupsState));
    productGroupsSaved = deepClone(productGroupsState);
}

function deepClone(obj) { return JSON.parse(JSON.stringify(obj)); }
function escapeHtml(value) {
    return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}
