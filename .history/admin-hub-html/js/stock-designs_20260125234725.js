/**
 * Stock Designs Page - DecoNetwork style
 * Categories tree, search, advanced search, designs table
 */

const STOCK_DESIGNS_STORAGE_KEY = 'adminHub.stockDesigns';

const DEFAULT_STOCK_CATEGORIES = [
    { id: 1, name: 'Business', expanded: false, children: [] },
    { id: 2, name: 'Celebrations', expanded: false, children: [] },
    { id: 3, name: 'Documents & Fonts', expanded: false, children: [] },
    { id: 4, name: 'Elements', expanded: false, children: [] },
    { id: 5, name: 'Fantasy', expanded: false, children: [] },
    { id: 6, name: 'Food', expanded: false, children: [] },
    { id: 7, name: 'School', expanded: false, children: [] },
    { id: 8, name: 'Sports', expanded: false, children: [] }
];

const DEFAULT_STOCK_DESIGNS = [
    { id: 1, name: 'Corporate Logo Pack', category: 'Business', imageType: 'Vector', collection: 'Premium', price: 12.00, dtg: true, emb: true, scr: false, htv: true, dtf: true },
    { id: 2, name: 'Birthday Party Set', category: 'Celebrations', imageType: 'Raster', collection: 'Standard', price: 8.50, dtg: true, emb: false, scr: true, htv: true, dtf: true },
    { id: 3, name: 'Varsity Letters', category: 'School', imageType: 'Vector', collection: 'Premium', price: 15.00, dtg: true, emb: true, scr: true, htv: true, dtf: true },
    { id: 4, name: 'Team Mascots', category: 'Sports', imageType: 'Vector', collection: 'Premium', price: 18.00, dtg: true, emb: true, scr: true, htv: true, dtf: true },
    { id: 5, name: 'Flourishes & Swirls', category: 'Elements', imageType: 'Vector', collection: 'Standard', price: 6.00, dtg: true, emb: true, scr: true, htv: true, dtf: true }
];

let stockDesignsState = deepCloneSD(DEFAULT_STOCK_DESIGNS);
let stockCategoriesState = deepCloneSD(DEFAULT_STOCK_CATEGORIES);
let stockDesignSearch = { name: '', imageType: 'all', collection: 'all', process: 'all' };
let selectedCategory = null;
let editingStockDesignId = null;

function initStockDesignsListPage() {
    loadStockDesignsState();

    const container = document.getElementById('page-stock-designs-list');
    if (!container) return;

    container.innerHTML = `
        <div class="page-header">
            <div class="breadcrumb">
                <a href="#" class="link-blue" onclick="navigateTo('products');return false;">Products</a> / Stock Designs
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
                <h1 class="page-title">Stock Designs</h1>
                <div style="display:flex; gap:8px;">
                    <button class="btn btn-secondary" id="importDesignsBtn"><i class="fas fa-file-import"></i> Import Files</button>
                    <button class="btn btn-primary" id="newStockDesignBtn"><i class="fas fa-plus"></i> New Design</button>
                </div>
            </div>
        </div>

        <div class="settings-page">
            <div class="settings-body">
                <div class="stock-designs-layout">
                    <!-- Categories Sidebar -->
                    <div class="sd-sidebar">
                        <div class="section-title">Categories</div>
                        <div class="sd-category-tree" id="sdCategoryTree"></div>
                        <button class="btn btn-sm btn-secondary" style="margin-top:12px;" id="addCategoryBtn"><i class="fas fa-plus"></i> Add Category</button>
                    </div>

                    <!-- Main Content -->
                    <div class="sd-main">
                        <div class="sd-search-tabs">
                            <button class="sd-tab active" data-tab="search">Search</button>
                            <button class="sd-tab" data-tab="advanced">Advanced Search</button>
                        </div>

                        <div class="sd-search-panel" id="sdSearchPanel">
                            <input type="text" class="input" id="sdSearchName" placeholder="Search by name..." style="max-width:300px;" />
                            <button class="btn btn-primary" id="sdSearchBtn"><i class="fas fa-search"></i> Search</button>
                        </div>

                        <div class="sd-advanced-panel hidden" id="sdAdvancedPanel">
                            <div style="display:flex; flex-wrap:wrap; gap:16px; align-items:flex-end;">
                                <div class="form-group">
                                    <label>Name</label>
                                    <input type="text" class="input" id="sdAdvName" placeholder="Design name" />
                                </div>
                                <div class="form-group">
                                    <label>Image Type</label>
                                    <select class="input" id="sdAdvImageType">
                                        <option value="all">All Types</option>
                                        <option value="Vector">Vector</option>
                                        <option value="Raster">Raster</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Design Collection</label>
                                    <select class="input" id="sdAdvCollection">
                                        <option value="all">All Collections</option>
                                        <option value="Standard">Standard</option>
                                        <option value="Premium">Premium</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label style="display:flex; align-items:center; gap:6px;"><input type="checkbox" id="sdAdvExcludeElements" /> Exclude Design Elements</label>
                                </div>
                                <div class="form-group">
                                    <label>Printing Process</label>
                                    <select class="input" id="sdAdvProcess">
                                        <option value="all">All Processes</option>
                                        <option value="dtg">DTG</option>
                                        <option value="emb">EMB</option>
                                        <option value="scr">SCR</option>
                                        <option value="htv">HTV</option>
                                        <option value="dtf">DTF</option>
                                    </select>
                                </div>
                                <button class="btn btn-primary" id="sdAdvSearchBtn"><i class="fas fa-search"></i> Search</button>
                            </div>
                        </div>

                        <div class="card">
                            <div class="card-body" style="padding:0;">
                                <div class="table-wrap">
                                    <table class="table stock-designs-table">
                                        <thead>
                                            <tr>
                                                <th style="width:60px;">Image</th>
                                                <th style="width:200px;">Name</th>
                                                <th>Category</th>
                                                <th>Image Type</th>
                                                <th>Collection</th>
                                                <th>Price</th>
                                                <th class="process-cell">DTG</th>
                                                <th class="process-cell">EMB</th>
                                                <th class="process-cell">SCR</th>
                                                <th class="process-cell">HTV</th>
                                                <th class="process-cell">DTF</th>
                                                <th style="width:100px;">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody id="stockDesignsTbody"></tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div id="stockDesignModal" class="modal-overlay" aria-hidden="true"></div>
        <div id="importDesignModal" class="modal-overlay" aria-hidden="true"></div>
    `;

    // Tabs
    container.querySelectorAll('.sd-tab').forEach(t => {
        t.addEventListener('click', () => {
            container.querySelectorAll('.sd-tab').forEach(tt => tt.classList.remove('active'));
            t.classList.add('active');
            const tab = t.getAttribute('data-tab');
            document.getElementById('sdSearchPanel').classList.toggle('hidden', tab !== 'search');
            document.getElementById('sdAdvancedPanel').classList.toggle('hidden', tab !== 'advanced');
        });
    });

    container.querySelector('#newStockDesignBtn').addEventListener('click', () => openStockDesignEditor(null));
    container.querySelector('#importDesignsBtn').addEventListener('click', openImportModal);
    container.querySelector('#addCategoryBtn').addEventListener('click', addStockCategory);
    container.querySelector('#sdSearchBtn').addEventListener('click', performStockSearch);
    container.querySelector('#sdAdvSearchBtn').addEventListener('click', performAdvancedStockSearch);
    container.querySelector('#sdSearchName').addEventListener('keypress', e => { if (e.key === 'Enter') performStockSearch(); });

    renderStockCategories();
    renderStockDesignsTable();
}

function renderStockCategories() {
    const tree = document.getElementById('sdCategoryTree');
    if (!tree) return;

    tree.innerHTML = stockCategoriesState.map(c => `
        <div class="sd-category-item ${selectedCategory === c.id ? 'selected' : ''}" data-id="${c.id}">
            <i class="fas fa-folder"></i>
            <span class="link-blue">${escapeHtmlSD(c.name)}</span>
        </div>
    `).join('');

    tree.querySelectorAll('.sd-category-item').forEach(item => {
        item.addEventListener('click', () => {
            const id = Number(item.getAttribute('data-id'));
            selectedCategory = selectedCategory === id ? null : id;
            renderStockCategories();
            renderStockDesignsTable();
        });
    });
}

function renderStockDesignsTable() {
    const tbody = document.getElementById('stockDesignsTbody');
    if (!tbody) return;

    let filtered = [...stockDesignsState];

    // Filter by category
    if (selectedCategory) {
        const cat = stockCategoriesState.find(c => c.id === selectedCategory);
        if (cat) {
            filtered = filtered.filter(d => d.category === cat.name);
        }
    }

    // Filter by search
    if (stockDesignSearch.name) {
        const q = stockDesignSearch.name.toLowerCase();
        filtered = filtered.filter(d => d.name.toLowerCase().includes(q));
    }
    if (stockDesignSearch.imageType !== 'all') {
        filtered = filtered.filter(d => d.imageType === stockDesignSearch.imageType);
    }
    if (stockDesignSearch.collection !== 'all') {
        filtered = filtered.filter(d => d.collection === stockDesignSearch.collection);
    }
    if (stockDesignSearch.process !== 'all') {
        filtered = filtered.filter(d => d[stockDesignSearch.process]);
    }

    const check = '<i class="fas fa-check" style="color:#38a169;"></i>';

    tbody.innerHTML = filtered.length === 0 ? `<tr><td colspan="12" style="text-align:center; color:#888;">No designs found</td></tr>` : filtered.map(d => `
        <tr data-id="${d.id}">
            <td><div class="sd-image-placeholder"><i class="fas fa-image"></i></div></td>
            <td><strong class="link-blue" data-action="edit">${escapeHtmlSD(d.name)}</strong></td>
            <td>${escapeHtmlSD(d.category)}</td>
            <td>${escapeHtmlSD(d.imageType)}</td>
            <td>${escapeHtmlSD(d.collection)}</td>
            <td>£${d.price.toFixed(2)}</td>
            <td class="process-cell">${d.dtg ? check : ''}</td>
            <td class="process-cell">${d.emb ? check : ''}</td>
            <td class="process-cell">${d.scr ? check : ''}</td>
            <td class="process-cell">${d.htv ? check : ''}</td>
            <td class="process-cell">${d.dtf ? check : ''}</td>
            <td>
                <button class="btn btn-secondary-sm link-blue" data-action="manage">Manage</button>
            </td>
        </tr>
    `).join('');

    tbody.querySelectorAll('tr[data-id]').forEach(tr => {
        const id = Number(tr.getAttribute('data-id'));
        tr.querySelector('[data-action="edit"]')?.addEventListener('click', () => openStockDesignEditor(id));
        tr.querySelector('[data-action="manage"]')?.addEventListener('click', () => openStockDesignEditor(id));
    });
}

function performStockSearch() {
    const name = document.getElementById('sdSearchName')?.value?.trim() || '';
    stockDesignSearch = { name, imageType: 'all', collection: 'all', process: 'all' };
    renderStockDesignsTable();
}

function performAdvancedStockSearch() {
    const name = document.getElementById('sdAdvName')?.value?.trim() || '';
    const imageType = document.getElementById('sdAdvImageType')?.value || 'all';
    const collection = document.getElementById('sdAdvCollection')?.value || 'all';
    const process = document.getElementById('sdAdvProcess')?.value || 'all';
    stockDesignSearch = { name, imageType, collection, process };
    renderStockDesignsTable();
}

function addStockCategory() {
    const name = prompt('Enter new category name:');
    if (!name?.trim()) return;
    stockCategoriesState.push({ id: Date.now(), name: name.trim(), expanded: false, children: [] });
    saveStockDesignsState();
    renderStockCategories();
    showToast('Category added.', 'success');
}

function openStockDesignEditor(id) {
    const overlay = document.getElementById('stockDesignModal');
    if (!overlay) return;

    editingStockDesignId = id;
    const isNew = id === null;
    const design = isNew ? { id: Date.now(), name: '', category: stockCategoriesState[0]?.name || 'General', imageType: 'Vector', collection: 'Standard', price: 0, dtg: true, emb: true, scr: true, htv: true, dtf: true } : { ...stockDesignsState.find(d => d.id === id) };

    overlay.innerHTML = `
        <div class="modal-container" style="max-width:600px;">
            <div class="modal-header">
                <h2><i class="fas fa-palette"></i> ${isNew ? 'New' : 'Edit'} Stock Design</h2>
                <button class="modal-close" data-action="close"><i class="fas fa-times"></i></button>
            </div>
            <div class="modal-body">
                <div class="form-row">
                    <div class="form-group">
                        <label>Name</label>
                        <input class="input" id="sdEditName" value="${escapeHtmlSD(design.name)}" />
                    </div>
                    <div class="form-group">
                        <label>Price (£)</label>
                        <input class="input" id="sdEditPrice" type="number" step="0.01" min="0" value="${design.price}" />
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Category</label>
                        <select class="input" id="sdEditCategory">
                            ${stockCategoriesState.map(c => `<option value="${escapeHtmlSD(c.name)}" ${design.category === c.name ? 'selected' : ''}>${escapeHtmlSD(c.name)}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Image Type</label>
                        <select class="input" id="sdEditImageType">
                            <option value="Vector" ${design.imageType === 'Vector' ? 'selected' : ''}>Vector</option>
                            <option value="Raster" ${design.imageType === 'Raster' ? 'selected' : ''}>Raster</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Collection</label>
                        <select class="input" id="sdEditCollection">
                            <option value="Standard" ${design.collection === 'Standard' ? 'selected' : ''}>Standard</option>
                            <option value="Premium" ${design.collection === 'Premium' ? 'selected' : ''}>Premium</option>
                        </select>
                    </div>
                </div>
                <div class="form-group" style="margin-top:16px;">
                    <label>Image File</label>
                    <input type="file" class="input" id="sdEditFile" accept="image/*" />
                </div>
                <div class="form-group" style="margin-top:16px;">
                    <label>Enabled Processes</label>
                    <div style="display:flex; gap:18px; margin-top:8px; flex-wrap:wrap;">
                        <label class="checkbox-label"><input type="checkbox" id="sdEditDtg" ${design.dtg ? 'checked' : ''} /> DTG</label>
                        <label class="checkbox-label"><input type="checkbox" id="sdEditEmb" ${design.emb ? 'checked' : ''} /> EMB</label>
                        <label class="checkbox-label"><input type="checkbox" id="sdEditScr" ${design.scr ? 'checked' : ''} /> SCR</label>
                        <label class="checkbox-label"><input type="checkbox" id="sdEditHtv" ${design.htv ? 'checked' : ''} /> HTV</label>
                        <label class="checkbox-label"><input type="checkbox" id="sdEditDtf" ${design.dtf ? 'checked' : ''} /> DTF</label>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-danger" data-action="delete" ${isNew ? 'style="display:none;"' : ''}>Delete</button>
                <button class="btn btn-secondary" data-action="cancel">Cancel</button>
                <button class="btn btn-primary" data-action="save">Save</button>
            </div>
        </div>
    `;

    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';

    overlay.querySelector('[data-action="close"]').addEventListener('click', closeStockDesignModal);
    overlay.querySelector('[data-action="cancel"]').addEventListener('click', closeStockDesignModal);
    overlay.querySelector('[data-action="delete"]').addEventListener('click', () => {
        if (!confirm(`Delete "${design.name}"?`)) return;
        stockDesignsState = stockDesignsState.filter(d => d.id !== id);
        saveStockDesignsState();
        closeStockDesignModal();
        renderStockDesignsTable();
        showToast('Design deleted.', 'success');
    });
    overlay.querySelector('[data-action="save"]').addEventListener('click', () => {
        const name = overlay.querySelector('#sdEditName').value.trim();
        if (!name) {
            showToast('Name is required.', 'error');
            return;
        }
        design.name = name;
        design.category = overlay.querySelector('#sdEditCategory').value;
        design.imageType = overlay.querySelector('#sdEditImageType').value;
        design.collection = overlay.querySelector('#sdEditCollection').value;
        design.price = parseFloat(overlay.querySelector('#sdEditPrice').value) || 0;
        design.dtg = overlay.querySelector('#sdEditDtg').checked;
        design.emb = overlay.querySelector('#sdEditEmb').checked;
        design.scr = overlay.querySelector('#sdEditScr').checked;
        design.htv = overlay.querySelector('#sdEditHtv').checked;
        design.dtf = overlay.querySelector('#sdEditDtf').checked;

        if (isNew) {
            stockDesignsState.push(design);
        } else {
            const idx = stockDesignsState.findIndex(d => d.id === id);
            if (idx !== -1) stockDesignsState[idx] = design;
        }
        saveStockDesignsState();
        closeStockDesignModal();
        renderStockDesignsTable();
        showToast('Design saved.', 'success');
    });
}

function closeStockDesignModal() {
    const overlay = document.getElementById('stockDesignModal');
    if (!overlay) return;
    overlay.classList.remove('open');
    overlay.innerHTML = '';
    if (document.querySelectorAll('.modal-overlay.open').length === 0) {
        document.body.style.overflow = '';
    }
    editingStockDesignId = null;
}

function openImportModal() {
    const overlay = document.getElementById('importDesignModal');
    if (!overlay) return;

    overlay.innerHTML = `
        <div class="modal-container" style="max-width:600px;">
            <div class="modal-header">
                <h2><i class="fas fa-file-import"></i> Import Designs</h2>
                <button class="modal-close" data-action="close"><i class="fas fa-times"></i></button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label>Import Method</label>
                    <select class="input" id="importMethod">
                        <option value="zip">ZIP Archive (multiple designs)</option>
                        <option value="csv">CSV Catalog</option>
                        <option value="folder">Folder Upload</option>
                        <option value="ai">Adobe Illustrator (.ai)</option>
                        <option value="eps">EPS Files</option>
                        <option value="svg">SVG Files</option>
                    </select>
                </div>
                <div class="form-group" style="margin-top:16px;">
                    <label>Customization Options</label>
                    <div style="display:flex; flex-direction:column; gap:8px; margin-top:8px;">
                        <label class="checkbox-label"><input type="checkbox" id="importAutoCategorize" checked /> Auto-categorize by filename</label>
                        <label class="checkbox-label"><input type="checkbox" id="importAutoProcess" checked /> Detect compatible processes</label>
                        <label class="checkbox-label"><input type="checkbox" id="importOverwrite" /> Overwrite existing designs</label>
                    </div>
                </div>
                <div class="form-group" style="margin-top:16px;">
                    <label>Upload Files</label>
                    <div class="import-drop-zone" id="importDropZone">
                        <i class="fas fa-cloud-upload-alt" style="font-size:48px; color:#7C3AED;"></i>
                        <p>Drag and drop files here or click to browse</p>
                        <input type="file" id="importFileInput" multiple hidden />
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" data-action="cancel">Cancel</button>
                <button class="btn btn-primary" data-action="import">Import</button>
            </div>
        </div>
    `;

    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';

    const dropZone = overlay.querySelector('#importDropZone');
    const fileInput = overlay.querySelector('#importFileInput');

    dropZone.addEventListener('click', () => fileInput.click());
    dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('dragover'); });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
    dropZone.addEventListener('drop', e => { e.preventDefault(); dropZone.classList.remove('dragover'); handleImportFiles(e.dataTransfer.files); });
    fileInput.addEventListener('change', e => handleImportFiles(e.target.files));

    overlay.querySelector('[data-action="close"]').addEventListener('click', closeImportModal);
    overlay.querySelector('[data-action="cancel"]').addEventListener('click', closeImportModal);
    overlay.querySelector('[data-action="import"]').addEventListener('click', () => {
        showToast('Import functionality coming soon!', 'info');
        closeImportModal();
    });
}

function handleImportFiles(files) {
    if (files.length > 0) {
        showToast(`Selected ${files.length} file(s) for import.`, 'info');
    }
}

function closeImportModal() {
    const overlay = document.getElementById('importDesignModal');
    if (!overlay) return;
    overlay.classList.remove('open');
    overlay.innerHTML = '';
    if (document.querySelectorAll('.modal-overlay.open').length === 0) {
        document.body.style.overflow = '';
    }
}

function loadStockDesignsState() {
    stockDesignsState = deepCloneSD(DEFAULT_STOCK_DESIGNS);
    stockCategoriesState = deepCloneSD(DEFAULT_STOCK_CATEGORIES);

    try {
        const raw = localStorage.getItem(STOCK_DESIGNS_STORAGE_KEY);
        if (!raw) return;
        const parsed = JSON.parse(raw);
        if (parsed.designs && Array.isArray(parsed.designs)) {
            stockDesignsState = parsed.designs;
        }
        if (parsed.categories && Array.isArray(parsed.categories)) {
            stockCategoriesState = parsed.categories;
        }
    } catch {
        // ignore
    }
}

function saveStockDesignsState() {
    localStorage.setItem(STOCK_DESIGNS_STORAGE_KEY, JSON.stringify({
        designs: stockDesignsState,
        categories: stockCategoriesState
    }));
}

function deepCloneSD(obj) { return JSON.parse(JSON.stringify(obj)); }
function escapeHtmlSD(value) {
    return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}
