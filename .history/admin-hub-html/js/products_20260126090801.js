/**
 * BrandedUK Admin Hub - Products Page Script
 * Connects to real API: /api/products (Ralawise supplier data)
 */

// API Configuration
const API_BASE_URL = 'http://localhost:3004'; // Your backend server

// State
let products = [];
let categories = [];
let selectedProducts = [];
let currentCategory = 'all';
let currentPage = 1;
let totalProducts = 0;
let perPage = 15;
let isLoading = false;
let searchQuery = '';

/**
 * Initialize Products Page
 */
async function initProductsPage() {
    const pageContainer = document.getElementById('page-products');
    
    pageContainer.innerHTML = getProductsPageHTML();
    
    // Load real data from API
    await Promise.all([
        loadCategories(),
        loadProducts()
    ]);
    
    initProductSearch();
}

/**
 * Get Products Page HTML Template
 */
function getProductsPageHTML() {
    return `
        <div class="page-header">
            <div class="breadcrumb">
                <a href="#">Dashboard</a> / Products
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
                <h1 class="page-title">Products <span id="productCountBadge" class="product-count-badge"></span></h1>
                <div class="toolbar-right">
                    <button class="btn btn-secondary" onclick="refreshProducts()">
                        <i class="fas fa-sync-alt"></i> Refresh
                    </button>
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
                    <span class="categories-title">Product Types</span>
                    <div class="categories-actions">
                        <button onclick="loadCategories()" title="Refresh"><i class="fas fa-sync-alt"></i></button>
                    </div>
                </div>
                <div class="category-list" id="categoryList">
                    <div class="loading-small"><i class="fas fa-spinner fa-spin"></i> Loading...</div>
                </div>
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
                        <button class="search-clear-btn" onclick="clearSearch()" title="Clear" style="display:none;" id="searchClearBtn">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <button class="btn btn-primary search-submit-btn" onclick="searchProducts()">Search</button>
                </div>
                
                <div class="bulk-actions-bar" id="bulkActionsBar">
                    <div class="bulk-info">
                        <strong id="selectedCount">0</strong> products selected.
                        <a href="#" onclick="selectAllProducts(event)">Select all on page</a>
                        <a href="#" onclick="selectAllProductsGlobal(event)" id="selectAllGlobalLink" style="display:none;">Select all ${totalProducts.toLocaleString()} products</a>
                    </div>
                    <div class="bulk-buttons">
                        <button class="btn btn-success" onclick="moveSelectedToTop()" title="Move selected products to top of recommended list">
                            <i class="fas fa-arrow-up"></i> On Top of List
                        </button>
                        <div class="dropdown">
                            <button class="btn btn-secondary" onclick="toggleDropdown(this)">
                                <span id="bulkActionLabel">Choose Bulk Action</span> <i class="fas fa-chevron-down"></i>
                            </button>
                            <div class="dropdown-menu bulk-actions-menu">
                                <a href="#" class="dropdown-item" onclick="selectBulkAction('to-top', event)">
                                    <i class="fas fa-arrow-up"></i> Move to Top (Recommended)
                                </a>
                                <div class="dropdown-divider"></div>
                                <a href="#" class="dropdown-item" onclick="selectBulkAction('inactive', event)">
                                    <i class="fas fa-ban"></i> Set Inactive Status
                                </a>
                                <a href="#" class="dropdown-item" onclick="selectBulkAction('active', event)">
                                    <i class="fas fa-check-circle"></i> Set Active Status
                                </a>
                                <div class="dropdown-divider"></div>
                                <a href="#" class="dropdown-item" onclick="selectBulkAction('delete', event)">
                                    <i class="fas fa-trash"></i> Delete Products
                                </a>
                                <a href="#" class="dropdown-item" onclick="selectBulkAction('undelete', event)">
                                    <i class="fas fa-undo"></i> Undelete Products
                                </a>
                                <div class="dropdown-divider"></div>
                                <a href="#" class="dropdown-item" onclick="selectBulkAction('export-inventory', event)">
                                    <i class="fas fa-file-export"></i> Export Inventory Levels
                                </a>
                                <a href="#" class="dropdown-item" onclick="selectBulkAction('export', event)">
                                    <i class="fas fa-download"></i> Export Products
                                </a>
                                <div class="dropdown-divider"></div>
                                <a href="#" class="dropdown-item" onclick="selectBulkAction('availability', event)">
                                    <i class="fas fa-eye"></i> Set Availability
                                </a>
                                <a href="#" class="dropdown-item" onclick="selectBulkAction('categories', event)">
                                    <i class="fas fa-folder"></i> Modify Categories
                                </a>
                                <a href="#" class="dropdown-item" onclick="selectBulkAction('group', event)">
                                    <i class="fas fa-layer-group"></i> Assign Product Group
                                </a>
                            </div>
                        </div>
                        <button class="btn btn-primary" onclick="applySelectedBulkAction()">Apply Action</button>
                    </div>
                </div>
                
                <!-- Loading Indicator -->
                <div class="loading-overlay" id="loadingOverlay" style="display: none;">
                    <div class="loading-spinner">
                        <i class="fas fa-spinner fa-spin"></i>
                        <span>Loading products from Ralawise API...</span>
                    </div>
                </div>
                
                <!-- API Status -->
                <div class="api-status" id="apiStatus" style="display: none;"></div>
                
                <div class="products-table-wrapper">
                    <table class="products-table">
                        <thead>
                            <tr>
                                <th style="width: 40px;">
                                    <div class="checkbox-wrapper">
                                        <input type="checkbox" id="selectAll" onchange="toggleSelectAll(this)">
                                    </div>
                                </th>
                                <th style="width: 70px;" title="Move products up/down to set display order. Top 15 = Recommended">Order</th>
                                <th>Image</th>
                                <th>Code</th>
                                <th>Product Name</th>
                                <th>Brand</th>
                                <th>Type</th>
                                <th class="price-cell">Blank</th>
                                <th class="price-cell">DTG</th>
                                <th class="price-cell">EMB</th>
                                <th class="price-cell">SCR</th>
                                <th class="price-cell">HTV</th>
                                <th class="price-cell">DTF</th>
                                <th>Colors</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody id="productsTableBody">
                            <tr><td colspan="15" class="loading-cell"><i class="fas fa-spinner fa-spin"></i> Loading products...</td></tr>
                        </tbody>
                    </table>
                </div>
                
                <div class="products-pagination" id="paginationContainer"></div>
            </div>
        </div>
    `;
}

function getColorCss(colorName) {
    try {
        return window.COLOR_UTILS?.toCss ? window.COLOR_UTILS.toCss(colorName) : '#d1d5db';
    } catch {
        return '#d1d5db';
    }
}

function getProcessPrice(product, key) {
    // Future-proof: support different API shapes
    return (
        product?.prices?.[key] ??
        product?.pricing?.[key] ??
        product?.customisationPrices?.[key] ??
        product?.customizationPrices?.[key] ??
        null
    );
}

/**
 * Load Categories/Product Types from API
 */
async function loadCategories() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/products/types`);
        if (!response.ok) throw new Error('Failed to fetch categories');
        
        const data = await response.json();
        categories = data.productTypes || [];
        
        renderCategories();
    } catch (error) {
        console.error('Error loading categories:', error);
        document.getElementById('categoryList').innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Failed to load categories</p>
                <button class="btn btn-secondary" onclick="loadCategories()">Retry</button>
            </div>
        `;
    }
}

/**
 * Render Categories List
 */
function renderCategories() {
    const container = document.getElementById('categoryList');
    if (!container) return;
    
    // Calculate total from all categories
    const total = categories.reduce((sum, cat) => sum + (cat.count || 0), 0);
    
    // Add "All" option at top
    let html = `
        <div class="category-item ${currentCategory === 'all' ? 'active' : ''}"
             onclick="selectCategory('all')">
            <span class="name">
                <span class="dot"></span>
                All Products
            </span>
            <span class="count">(${total.toLocaleString()})</span>
        </div>
    `;
    
    // Add categories from API sorted by count
    const sortedCategories = [...categories].sort((a, b) => (b.count || 0) - (a.count || 0));
    
    html += sortedCategories.map(cat => `
        <div class="category-item ${currentCategory === cat.name ? 'active' : ''}"
             onclick="selectCategory('${cat.name.replace(/'/g, "\\'")}')">
            <span class="name">
                <span class="dot"></span>
                ${cat.name}
            </span>
            <span class="count">(${(cat.count || 0).toLocaleString()})</span>
        </div>
    `).join('');
    
    container.innerHTML = html;
}

/**
 * Load Products from API
 */
async function loadProducts() {
    if (isLoading) return;
    
    isLoading = true;
    showLoading(true);
    hideApiStatus();
    
    try {
        // Build API URL with filters
        let url = `${API_BASE_URL}/api/products?page=${currentPage}&limit=${perPage}`;
        
        if (currentCategory !== 'all') {
            url += `&productType=${encodeURIComponent(currentCategory)}`;
        }
        
        if (searchQuery) {
            url += `&q=${encodeURIComponent(searchQuery)}`;
        }
        
        console.log('Fetching products from:', url);
        showApiStatus(`Fetching: ${url}`, 'info');
        
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        products = data.items || [];
        totalProducts = data.total || 0;
        
        console.log(`Loaded ${products.length} products, total: ${totalProducts}`);
        showApiStatus(`✓ Loaded ${products.length} products (${totalProducts.toLocaleString()} total)`, 'success');
        
        // Update count badge
        const badge = document.getElementById('productCountBadge');
        if (badge) {
            badge.textContent = `${totalProducts.toLocaleString()} products`;
        }
        
        renderProducts();
        renderPagination();
        
        // Auto-hide success message after 3 seconds
        setTimeout(() => hideApiStatus(), 3000);
        
    } catch (error) {
        console.error('Error loading products:', error);
        showApiStatus(`✗ ${error.message}. Make sure backend is running on port 3004.`, 'error');
        
        document.getElementById('productsTableBody').innerHTML = `
            <tr>
                <td colspan="9" class="error-cell">
                    <div class="error-content">
                        <i class="fas fa-exclamation-triangle"></i>
                        <h3>Failed to load products</h3>
                        <p>${error.message}</p>
                        <p class="error-hint">Make sure the backend server is running:</p>
                        <code>cd brandeduk-backend && npm start</code>
                        <br><br>
                        <button class="btn btn-primary" onclick="loadProducts()">
                            <i class="fas fa-sync-alt"></i> Retry
                        </button>
                    </div>
                </td>
            </tr>
        `;
    } finally {
        isLoading = false;
        showLoading(false);
    }
}

/**
 * Render Products Table
 */
function renderProducts() {
    const tbody = document.getElementById('productsTableBody');
    if (!tbody) return;
    
    if (products.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" class="empty-cell">
                    <div class="empty-content">
                        <i class="fas fa-box-open"></i>
                        <h3>No products found</h3>
                        <p>Try adjusting your search or category filter</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    window.__productSummaryCache = window.__productSummaryCache || {};

    tbody.innerHTML = products.map(product => {
        const code = product.code || product.styleCode || 'N/A';
        const name = product.name || product.styleName || 'Unnamed Product';
        const brand = product.brand || 'N/A';
        const productType = product.productType || 'N/A';
        const image = product.image || product.primaryImage || '';
        const blankPrice = product.priceRange?.min || product.minPrice || product.price || null;
        const dtgPrice = getProcessPrice(product, 'dtg');
        const embPrice = getProcessPrice(product, 'emb');
        const scrPrice = getProcessPrice(product, 'scr');
        const htvPrice = getProcessPrice(product, 'htv');
        const dtfPrice = getProcessPrice(product, 'dtf');
        const colors = product.colors || product.colourVariants || [];

        // Cache summary for cross-page modal usage
        if (code && code !== 'N/A') {
            window.__productSummaryCache[String(code).toUpperCase()] = product;
        }
        
        return `
            <tr class="${selectedProducts.includes(code) ? 'selected' : ''}" data-code="${code}">
                <td>
                    <div class="checkbox-wrapper">
                        <input type="checkbox" 
                               ${selectedProducts.includes(code) ? 'checked' : ''}
                               onchange="toggleProductSelect('${code}', this.checked)">
                    </div>
                </td>
                <td>
                    <img src="${image || 'https://via.placeholder.com/50x50/e2e8f0/718096?text=No+Img'}" 
                         alt="${name}" 
                         class="product-image"
                         loading="lazy"
                         onerror="this.src='https://via.placeholder.com/50x50/e2e8f0/718096?text=No+Img'">
                </td>
                <td>
                    <a href="#" class="product-link" onclick="openProductDetail('${code}', event)">${code}</a>
                </td>
                <td>
                    <div class="product-name" title="${name}">${truncate(name, 40)}</div>
                </td>
                <td><span class="brand-badge">${brand}</span></td>
                <td>
                    <span class="product-type-badge">${productType}</span>
                </td>
                <td class="price-cell">${formatPrice(blankPrice)}</td>
                <td class="price-cell">${formatPrice(dtgPrice)}</td>
                <td class="price-cell">${formatPrice(embPrice)}</td>
                <td class="price-cell">${formatPrice(scrPrice)}</td>
                <td class="price-cell">${formatPrice(htvPrice)}</td>
                <td class="price-cell">${formatPrice(dtfPrice)}</td>
                <td>
                    <div class="colors-preview">
                        ${renderColorDots(colors)}
                    </div>
                </td>
                <td>
                    <a href="#" class="manage-link" onclick="openProductDetail('${code}', event)">
                        <i class="fas fa-external-link-alt"></i> View
                    </a>
                </td>
            </tr>
        `;
    }).join('');
}

/**
 * Truncate text
 */
function truncate(text, length) {
    if (!text) return '';
    return text.length > length ? text.substring(0, length) + '...' : text;
}

/**
 * Render Color Dots
 */
function renderColorDots(colors) {
    if (!colors || colors.length === 0) return '<span class="no-colors">-</span>';
    
    const displayColors = colors.slice(0, 5);
    const remaining = colors.length - 5;
    
    let html = displayColors.map(color => {
        const colorName = typeof color === 'string' ? color : (color.name || color.colour || color.primaryColour || color.color || '');
        const css = getColorCss(colorName);
        return `<span class="color-dot" title="${colorName}" style="background:${css}"></span>`;
    }).join('');
    
    if (remaining > 0) {
        html += `<span class="color-more">+${remaining}</span>`;
    }
    
    return html;
}

/**
 * Format Price
 */
function formatPrice(value) {
    if (value === null || value === undefined || isNaN(value)) {
        return '<span class="price-na">-</span>';
    }
    return '£' + parseFloat(value).toFixed(2);
}

/**
 * Render Pagination
 */
function renderPagination() {
    const container = document.getElementById('paginationContainer');
    if (!container) return;
    
    const totalPages = Math.ceil(totalProducts / perPage);
    const startItem = totalProducts > 0 ? (currentPage - 1) * perPage + 1 : 0;
    const endItem = Math.min(currentPage * perPage, totalProducts);
    
    container.innerHTML = `
        <div class="pagination-info">
            Showing ${startItem.toLocaleString()}-${endItem.toLocaleString()} of ${totalProducts.toLocaleString()} products
        </div>
        <div class="pagination-controls">
            <button class="pagination-btn" onclick="goToPage(1)" ${currentPage <= 1 ? 'disabled' : ''} title="First">
                <i class="fas fa-angle-double-left"></i>
            </button>
            <button class="pagination-btn" onclick="goToPage(${currentPage - 1})" ${currentPage <= 1 ? 'disabled' : ''}>
                <i class="fas fa-chevron-left"></i>
            </button>
            ${getPaginationButtons(currentPage, totalPages)}
            <button class="pagination-btn" onclick="goToPage(${currentPage + 1})" ${currentPage >= totalPages ? 'disabled' : ''}>
                <i class="fas fa-chevron-right"></i>
            </button>
            <button class="pagination-btn" onclick="goToPage(${totalPages})" ${currentPage >= totalPages ? 'disabled' : ''} title="Last">
                <i class="fas fa-angle-double-right"></i>
            </button>
        </div>
        <div class="per-page-select">
            <span>Show:</span>
            <select id="perPageSelect" onchange="changePerPage(this.value)">
                <option value="15" ${perPage === 15 ? 'selected' : ''}>15</option>
                <option value="25" ${perPage === 25 ? 'selected' : ''}>25</option>
                <option value="50" ${perPage === 50 ? 'selected' : ''}>50</option>
                <option value="100" ${perPage === 100 ? 'selected' : ''}>100</option>
            </select>
            <span>per page</span>
        </div>
    `;
}

/**
 * Get Pagination Buttons HTML
 */
function getPaginationButtons(current, total) {
    if (total <= 1) return `<button class="pagination-btn active">1</button>`;
    
    let buttons = [];
    
    if (total <= 7) {
        for (let i = 1; i <= total; i++) {
            buttons.push(i);
        }
    } else {
        if (current <= 3) {
            buttons = [1, 2, 3, 4, '...', total];
        } else if (current >= total - 2) {
            buttons = [1, '...', total - 3, total - 2, total - 1, total];
        } else {
            buttons = [1, '...', current - 1, current, current + 1, '...', total];
        }
    }
    
    return buttons.map(btn => {
        if (btn === '...') {
            return '<span class="pagination-ellipsis">...</span>';
        }
        return `<button class="pagination-btn ${btn === current ? 'active' : ''}" onclick="goToPage(${btn})">${btn}</button>`;
    }).join('');
}

/**
 * Go To Page
 */
function goToPage(page) {
    const totalPages = Math.ceil(totalProducts / perPage);
    if (page < 1 || page > totalPages) return;
    
    currentPage = page;
    selectedProducts = [];
    updateSelectAllCheckbox();
    updateBulkActionsBar();
    loadProducts();
    
    // Scroll to top of table
    document.querySelector('.products-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/**
 * Change Per Page
 */
function changePerPage(value) {
    perPage = parseInt(value);
    currentPage = 1;
    loadProducts();
}

/**
 * Select Category
 */
function selectCategory(categoryName) {
    currentCategory = categoryName;
    currentPage = 1;
    selectedProducts = [];
    searchQuery = '';
    
    const searchInput = document.getElementById('productSearch');
    if (searchInput) searchInput.value = '';
    
    renderCategories();
    loadProducts();
    updateBulkActionsBar();
}

/**
 * Search Products
 */
function searchProducts() {
    const input = document.getElementById('productSearch');
    searchQuery = input ? input.value.trim() : '';
    currentPage = 1;
    currentCategory = 'all';
    renderCategories();
    loadProducts();
    
    // Show/hide clear button
    const clearBtn = document.getElementById('searchClearBtn');
    if (clearBtn) {
        clearBtn.style.display = searchQuery ? 'block' : 'none';
    }
}

/**
 * Clear Search
 */
function clearSearch() {
    const input = document.getElementById('productSearch');
    if (input) input.value = '';
    searchQuery = '';
    
    const clearBtn = document.getElementById('searchClearBtn');
    if (clearBtn) clearBtn.style.display = 'none';
    
    loadProducts();
}

/**
 * Refresh Products
 */
function refreshProducts() {
    loadProducts();
    loadCategories();
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
        selectedProducts = products.map(p => p.code || p.styleCode);
    } else {
        selectedProducts = [];
    }
    
    renderProducts();
    updateBulkActionsBar();
}

/**
 * Select All Products on Page
 */
function selectAllProducts(e) {
    e.preventDefault();
    selectedProducts = products.map(p => p.code || p.styleCode);
    const selectAllCheckbox = document.getElementById('selectAll');
    if (selectAllCheckbox) selectAllCheckbox.checked = true;
    renderProducts();
    updateBulkActionsBar();
}

/**
 * Update Row Selection Visual
 */
function updateRowSelection(code, isSelected) {
    const row = document.querySelector(`tr[data-code="${code}"]`);
    if (row) {
        row.classList.toggle('selected', isSelected);
    }
}

/**
 * Update Select All Checkbox
 */
function updateSelectAllCheckbox() {
    const selectAll = document.getElementById('selectAll');
    if (selectAll && products.length > 0) {
        const allCodes = products.map(p => p.code || p.styleCode);
        const allSelected = allCodes.every(code => selectedProducts.includes(code));
        const someSelected = allCodes.some(code => selectedProducts.includes(code));
        
        selectAll.checked = allSelected;
        selectAll.indeterminate = someSelected && !allSelected;
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
    event.preventDefault();
    
    if (selectedProducts.length === 0) {
        alert('Please select at least one product');
        return;
    }
    
    const actions = {
        'active': 'set as Active',
        'inactive': 'set as Inactive',
        'export': 'exported to CSV',
        'best-sellers': 'added to Best Sellers',
        'categories': 'categories modified'
    };
    
    const actionText = actions[action] || action;
    
    console.log('Bulk action:', action, 'Products:', selectedProducts);
    alert(`${selectedProducts.length} products would be ${actionText}:\n\n${selectedProducts.slice(0, 10).join(', ')}${selectedProducts.length > 10 ? '...' : ''}`);
    
    // Close dropdown
    document.querySelectorAll('.dropdown-menu.open').forEach(m => m.classList.remove('open'));
}

/**
 * Open Product Detail
 */
function openProductDetail(code, event) {
    if (event) event.preventDefault();
    
    // Open product detail page instead of API JSON
    openProductDetailPage(code, event);
}

/**
 * Initialize Product Search
 */
function initProductSearch() {
    const searchInput = document.getElementById('productSearch');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchProducts();
            }
        });
        
        searchInput.addEventListener('input', function() {
            const clearBtn = document.getElementById('searchClearBtn');
            if (clearBtn) {
                clearBtn.style.display = this.value ? 'block' : 'none';
            }
        });
    }
}

/**
 * Show/Hide Loading Overlay
 */
function showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.style.display = show ? 'flex' : 'none';
    }
}

/**
 * Show API Status Message
 */
function showApiStatus(message, type = 'info') {
    const status = document.getElementById('apiStatus');
    if (status) {
        status.className = `api-status api-status-${type}`;
        status.innerHTML = message;
        status.style.display = 'block';
    }
}

/**
 * Hide API Status
 */
function hideApiStatus() {
    const status = document.getElementById('apiStatus');
    if (status) {
        status.style.display = 'none';
    }
}

// ============================================
// BULK ACTIONS - DecoNetwork Style
// ============================================

let selectedBulkAction = null;

/**
 * Select Bulk Action from Dropdown
 */
function selectBulkAction(action, event) {
    if (event) event.preventDefault();
    
    selectedBulkAction = action;
    
    const actionLabels = {
        'inactive': 'Set Inactive Status',
        'active': 'Set Active Status',
        'delete': 'Delete Products',
        'undelete': 'Undelete Products',
        'export-inventory': 'Export Inventory Levels',
        'export': 'Export Products',
        'availability': 'Set Availability',
        'categories': 'Modify Categories',
        'group': 'Assign Product Group'
    };
    
    const label = document.getElementById('bulkActionLabel');
    if (label) {
        label.textContent = actionLabels[action] || 'Choose Bulk Action';
    }
    
    // Close dropdown
    document.querySelectorAll('.dropdown-menu').forEach(m => m.classList.remove('open'));
}

/**
 * Apply Selected Bulk Action
 */
function applySelectedBulkAction() {
    if (!selectedBulkAction) {
        showNotification('Please select a bulk action first', 'warning');
        return;
    }
    
    if (selectedProducts.length === 0) {
        showNotification('Please select at least one product', 'warning');
        return;
    }
    
    const actionLabels = {
        'inactive': 'set as Inactive',
        'active': 'set as Active',
        'delete': 'deleted',
        'undelete': 'restored',
        'export-inventory': 'inventory exported',
        'export': 'exported',
        'availability': 'availability updated',
        'categories': 'categories modified',
        'group': 'assigned to group'
    };
    
    const confirmMessage = `Are you sure you want to apply "${actionLabels[selectedBulkAction]}" to ${selectedProducts.length} product(s)?`;
    
    if (confirm(confirmMessage)) {
        console.log('Applying bulk action:', selectedBulkAction, 'to products:', selectedProducts);
        
        // Simulate API call
        showNotification(`${selectedProducts.length} products ${actionLabels[selectedBulkAction]} successfully!`, 'success');
        
        // Reset selection
        selectedProducts = [];
        selectedBulkAction = null;
        const label = document.getElementById('bulkActionLabel');
        if (label) label.textContent = 'Choose Bulk Action';
        updateBulkActionsBar();
        renderProducts();
    }
}

/**
 * Select All Products on Page
 */
function selectAllProducts(e) {
    if (e) e.preventDefault();
    selectedProducts = products.map(p => p.code || p.styleCode);
    const selectAllCheckbox = document.getElementById('selectAll');
    if (selectAllCheckbox) selectAllCheckbox.checked = true;
    
    // Show global select link
    const globalLink = document.getElementById('selectAllGlobalLink');
    if (globalLink && totalProducts > products.length) {
        globalLink.style.display = 'inline';
        globalLink.textContent = `Select all ${totalProducts.toLocaleString()} products`;
    }
    
    renderProducts();
    updateBulkActionsBar();
}

/**
 * Select All Products Globally
 */
function selectAllProductsGlobal(e) {
    if (e) e.preventDefault();
    
    showNotification(`All ${totalProducts.toLocaleString()} products selected for bulk action`, 'info');
    
    // In real implementation, this would flag to use all products
    // For now we just show the count
    const countEl = document.getElementById('selectedCount');
    if (countEl) {
        countEl.textContent = totalProducts.toLocaleString();
    }
}

/**
 * Show Notification Toast
 */
function showNotification(message, type = 'info') {
    // Remove existing notifications
    document.querySelectorAll('.notification-toast').forEach(n => n.remove());
    
    const toast = document.createElement('div');
    toast.className = `notification-toast notification-${type}`;
    toast.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

/**
 * Toggle Dropdown Menu
 */
function toggleDropdown(button) {
    const menu = button.nextElementSibling;
    const isOpen = menu.classList.contains('open');
    
    // Close all other dropdowns
    document.querySelectorAll('.dropdown-menu').forEach(m => m.classList.remove('open'));
    
    if (!isOpen) {
        menu.classList.add('open');
    }
}

// Close dropdowns when clicking outside
document.addEventListener('click', function(e) {
    if (!e.target.closest('.dropdown')) {
        document.querySelectorAll('.dropdown-menu').forEach(m => m.classList.remove('open'));
    }
});

