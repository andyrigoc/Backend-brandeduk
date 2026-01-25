/**
 * BrandedUK Admin Hub - Products Page Script
 */

// Mock Data
const mockCategories = [
    { id: 'all', name: 'All', count: 8109, isGroup: false },
    { id: 't-shirts', name: 'T-Shirts', count: 0, isGroup: false },
    { id: 'best-sellers', name: 'Best Sellers', count: 74, isGroup: true },
    { id: 'unisex-t-shirts', name: 'Unisex T-Shirts', count: 54, isGroup: false },
    { id: 'womens', name: "Women's", count: 51, isGroup: false },
    { id: 'sweatshirts', name: 'Sweatshirts', count: 63, isGroup: false },
    { id: 'polos', name: "Polo's", count: 69, isGroup: false },
    { id: 'jackets', name: 'Jackets', count: 49, isGroup: false },
    { id: 'youth', name: 'Youth', count: 25, isGroup: false },
    { id: 'headwear', name: 'Headwear', count: 49, isGroup: false },
    { id: 'accessories', name: 'Accessories', count: 1, isGroup: false },
    { id: 'drinkware', name: 'Drinkware', count: 14, isGroup: false },
];

const mockProducts = [
    { code: 'PC450', name: 'Fan Favorite Tee', image: 'https://via.placeholder.com/50x50/e53e3e/ffffff?text=T', supplier: 'SanMar', group: 'Apparel', blank: 4.86, dtf: 13.66, dp: null, emb: null, scr: 11.11 },
    { code: '5000', name: 'Heavy Cotton 100% Cotton T Shirt', image: 'https://via.placeholder.com/50x50/38a169/ffffff?text=T', supplier: 'SanMar', group: 'Apparel', blank: 4.29, dtf: 13.09, dp: null, emb: null, scr: 10.54 },
    { code: 'DM130', name: 'Perfect Tri ® Tee', image: 'https://via.placeholder.com/50x50/3182ce/ffffff?text=T', supplier: 'SanMar', group: 'Apparel', blank: 8.24, dtf: 17.04, dp: null, emb: null, scr: 14.49 },
    { code: 'NL6210', name: 'Apparel ® Unisex CVC Tee', image: 'https://via.placeholder.com/50x50/805ad5/ffffff?text=T', supplier: 'SanMar', group: 'Apparel', blank: 6.15, dtf: 14.95, dp: null, emb: null, scr: 12.40 },
    { code: 'DT6000', name: 'Very Important Tee ®', image: 'https://via.placeholder.com/50x50/d69e2e/ffffff?text=T', supplier: 'SanMar', group: 'Apparel', blank: 6.44, dtf: 13.64, dp: null, emb: null, scr: 12.69 },
    { code: 'NL3601', name: 'Apparel ® Cotton Long Sleeve Tee', image: 'https://via.placeholder.com/50x50/00838f/ffffff?text=T', supplier: 'SanMar', group: 'Apparel', blank: 10.95, dtf: 19.75, dp: null, emb: null, scr: 17.20 },
    { code: 'BC3001', name: 'Unisex Jersey Short Sleeve Tee', image: 'https://via.placeholder.com/50x50/1a365d/ffffff?text=T', supplier: 'SanMar', group: 'Apparel', blank: 7.20, dtf: 16.00, dp: null, emb: null, scr: 13.45 },
    { code: 'PC450LS', name: 'Long Sleeve Fan Favorite', image: 'https://via.placeholder.com/50x50/ed8936/ffffff?text=T', supplier: 'SanMar', group: 'Apparel', blank: 7.97, dtf: 16.77, dp: null, emb: null, scr: 14.22 },
];

let selectedProducts = [];
let currentCategory = 'all';

/**
 * Initialize Products Page
 */
function initProductsPage() {
    const pageContainer = document.getElementById('page-products');
    
    // Load CSS
    if (!document.querySelector('link[href="css/products.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'css/products.css';
        document.head.appendChild(link);
    }
    
    pageContainer.innerHTML = `
        <div class="page-header">
            <div class="breadcrumb">
                <a href="#">Dashboard</a> / Products
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <h1 class="page-title">Products</h1>
                <div class="toolbar-right">
                    <div class="dropdown">
                        <button class="btn btn-secondary" onclick="toggleDropdown(this)">
                            <i class="fas fa-upload"></i> Import
                            <i class="fas fa-chevron-down"></i>
                        </button>
                        <div class="dropdown-menu">
                            <a href="#" class="dropdown-item">Import Products</a>
                            <a href="#" class="dropdown-item">Import Inventory Levels</a>
                        </div>
                    </div>
                    <button class="btn btn-primary">
                        <i class="fas fa-plus"></i> Add Product
                    </button>
                </div>
            </div>
        </div>
        
        <div class="products-layout">
            <!-- Categories Sidebar -->
            <div class="categories-panel">
                <div class="categories-header">
                    <span class="categories-title">Categories</span>
                    <div class="categories-actions">
                        <button>Add</button>
                        <button>Delete</button>
                        <button>Edit</button>
                    </div>
                </div>
                <div class="category-list" id="categoryList"></div>
            </div>
            
            <!-- Products Panel -->
            <div class="products-panel">
                <div class="search-tabs">
                    <button class="search-tab active">search</button>
                    <button class="search-tab">advanced search</button>
                </div>
                
                <div class="products-search">
                    <div class="search-input-wrapper">
                        <i class="fas fa-search"></i>
                        <input type="text" placeholder="search product codes, colors, description, name etc." id="productSearch">
                    </div>
                </div>
                
                <div class="bulk-actions-bar" id="bulkActionsBar">
                    <div class="bulk-info">
                        <strong id="selectedCount">0</strong> products on this page selected.
                        <a href="#" onclick="selectAllProducts(event)">Select all ${mockProducts.length} products</a>
                    </div>
                    <div class="bulk-buttons">
                        <div class="dropdown">
                            <button class="btn btn-secondary" onclick="toggleDropdown(this)">
                                Bulk Action <i class="fas fa-chevron-down"></i>
                            </button>
                            <div class="dropdown-menu">
                                <a href="#" class="dropdown-item" onclick="applyBulkAction('active')">Set Active Status</a>
                                <a href="#" class="dropdown-item" onclick="applyBulkAction('inactive')">Set Inactive Status</a>
                                <div class="dropdown-divider"></div>
                                <a href="#" class="dropdown-item danger" onclick="applyBulkAction('delete')">Delete Products</a>
                                <a href="#" class="dropdown-item" onclick="applyBulkAction('undelete')">Undelete Products</a>
                                <div class="dropdown-divider"></div>
                                <a href="#" class="dropdown-item" onclick="applyBulkAction('export')">Export Products</a>
                                <a href="#" class="dropdown-item" onclick="applyBulkAction('availability')">Set Availability</a>
                                <a href="#" class="dropdown-item" onclick="applyBulkAction('categories')">Modify Categories</a>
                                <a href="#" class="dropdown-item" onclick="applyBulkAction('group')">Assign Product Group</a>
                            </div>
                        </div>
                        <button class="btn btn-primary" onclick="applyBulkAction('apply')">Apply Action</button>
                    </div>
                </div>
                
                <div class="products-table-wrapper">
                    <table class="products-table">
                        <thead>
                            <tr>
                                <th style="width: 40px;">
                                    <div class="checkbox-wrapper">
                                        <input type="checkbox" id="selectAll" onchange="toggleSelectAll(this)">
                                    </div>
                                </th>
                                <th>Image</th>
                                <th>Code</th>
                                <th>Product Name</th>
                                <th>Supplier</th>
                                <th>Product Group</th>
                                <th style="text-align: right;">Blank</th>
                                <th style="text-align: right;">DTF</th>
                                <th style="text-align: right;">DP</th>
                                <th style="text-align: right;">EMB</th>
                                <th style="text-align: right;">SCR</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody id="productsTableBody"></tbody>
                    </table>
                </div>
                
                <div class="products-pagination">
                    <div class="pagination-info">
                        Showing 1-${mockProducts.length} of 8,109 products
                    </div>
                    <div class="pagination-controls">
                        <button class="pagination-btn" disabled><i class="fas fa-chevron-left"></i></button>
                        <button class="pagination-btn active">1</button>
                        <button class="pagination-btn">2</button>
                        <button class="pagination-btn">3</button>
                        <button class="pagination-btn">...</button>
                        <button class="pagination-btn">541</button>
                        <button class="pagination-btn"><i class="fas fa-chevron-right"></i></button>
                    </div>
                    <div class="per-page-select">
                        <span>Show:</span>
                        <select>
                            <option>15</option>
                            <option>25</option>
                            <option>50</option>
                            <option>100</option>
                        </select>
                        <span>per page</span>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    renderCategories();
    renderProducts();
    initProductSearch();
}

/**
 * Render Categories List
 */
function renderCategories() {
    const container = document.getElementById('categoryList');
    if (!container) return;
    
    container.innerHTML = mockCategories.map(cat => `
        <div class="category-item ${cat.id === currentCategory ? 'active' : ''} ${cat.isGroup ? 'is-group' : ''}"
             onclick="selectCategory('${cat.id}')">
            <span class="name">
                <span class="dot"></span>
                ${cat.name}
            </span>
            <span class="count">(${cat.count.toLocaleString()})</span>
        </div>
    `).join('');
}

/**
 * Select Category
 */
function selectCategory(categoryId) {
    currentCategory = categoryId;
    selectedProducts = [];
    renderCategories();
    renderProducts();
    updateBulkActionsBar();
}

/**
 * Render Products Table
 */
function renderProducts() {
    const tbody = document.getElementById('productsTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = mockProducts.map(product => `
        <tr class="${selectedProducts.includes(product.code) ? 'selected' : ''}" data-code="${product.code}">
            <td>
                <div class="checkbox-wrapper">
                    <input type="checkbox" 
                           ${selectedProducts.includes(product.code) ? 'checked' : ''}
                           onchange="toggleProductSelect('${product.code}', this.checked)">
                </div>
            </td>
            <td>
                <img src="${product.image}" alt="${product.name}" class="product-image">
            </td>
            <td>
                <a href="#" class="product-link" onclick="openProductDetail('${product.code}')">${product.code}</a>
            </td>
            <td>${product.name}</td>
            <td>${product.supplier}</td>
            <td>${product.group}</td>
            <td class="price-cell">${formatPrice(product.blank)}</td>
            <td class="price-cell">${formatPrice(product.dtf)}</td>
            <td class="price-cell">${formatPrice(product.dp)}</td>
            <td class="price-cell">${formatPrice(product.emb)}</td>
            <td class="price-cell">${formatPrice(product.scr)}</td>
            <td>
                <a href="#" class="manage-link" onclick="openProductDetail('${product.code}')">Manage</a>
            </td>
        </tr>
    `).join('');
}

/**
 * Format Price
 */
function formatPrice(value) {
    if (value === null || value === undefined) {
        return '<span class="price-na">N/A</span>';
    }
    return '£' + value.toFixed(2);
}

/**
 * Toggle Product Selection
 */
function toggleProductSelect(code, isSelected) {
    if (isSelected) {
        if (!selectedProducts.includes(code)) {
            selectedProducts.push(code);
        }
    } else {
        selectedProducts = selectedProducts.filter(c => c !== code);
    }
    
    updateBulkActionsBar();
    updateRowSelection(code, isSelected);
    updateSelectAllCheckbox();
}

/**
 * Toggle Select All
 */
function toggleSelectAll(checkbox) {
    if (checkbox.checked) {
        selectedProducts = mockProducts.map(p => p.code);
    } else {
        selectedProducts = [];
    }
    
    renderProducts();
    updateBulkActionsBar();
}

/**
 * Select All Products
 */
function selectAllProducts(e) {
    e.preventDefault();
    selectedProducts = mockProducts.map(p => p.code);
    document.getElementById('selectAll').checked = true;
    renderProducts();
    updateBulkActionsBar();
}

/**
 * Update Row Selection Visual
 */
function updateRowSelection(code, isSelected) {
    const row = document.querySelector(`tr[data-code="${code}"]`);
    if (row) {
        if (isSelected) {
            row.classList.add('selected');
        } else {
            row.classList.remove('selected');
        }
    }
}

/**
 * Update Select All Checkbox
 */
function updateSelectAllCheckbox() {
    const selectAll = document.getElementById('selectAll');
    if (selectAll) {
        selectAll.checked = selectedProducts.length === mockProducts.length;
        selectAll.indeterminate = selectedProducts.length > 0 && selectedProducts.length < mockProducts.length;
    }
}

/**
 * Update Bulk Actions Bar
 */
function updateBulkActionsBar() {
    const bar = document.getElementById('bulkActionsBar');
    const countEl = document.getElementById('selectedCount');
    
    if (bar && countEl) {
        if (selectedProducts.length > 0) {
            bar.classList.add('visible');
            countEl.textContent = selectedProducts.length;
        } else {
            bar.classList.remove('visible');
        }
    }
}

/**
 * Apply Bulk Action
 */
function applyBulkAction(action) {
    if (selectedProducts.length === 0) {
        alert('Please select at least one product');
        return;
    }
    
    const actions = {
        'active': 'set as Active',
        'inactive': 'set as Inactive',
        'delete': 'deleted',
        'undelete': 'restored',
        'export': 'exported',
        'availability': 'availability updated',
        'categories': 'categories modified',
        'group': 'assigned to group'
    };
    
    const actionText = actions[action] || action;
    alert(`${selectedProducts.length} products would be ${actionText}`);
    
    // Close dropdown
    document.querySelectorAll('.dropdown-menu.open').forEach(m => m.classList.remove('open'));
}

/**
 * Open Product Detail
 */
function openProductDetail(code) {
    event.preventDefault();
    alert(`Opening product detail for: ${code}\n\n(Product detail page would open here)`);
}

/**
 * Initialize Product Search
 */
function initProductSearch() {
    const searchInput = document.getElementById('productSearch');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const query = this.value.toLowerCase();
            const rows = document.querySelectorAll('#productsTableBody tr');
            
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(query) ? '' : 'none';
            });
        });
    }
}
