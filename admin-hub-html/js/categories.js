/**
 * BrandedUK Admin Hub - Categories Page
 * Displays product types/categories with counts
 */

// State
let allCategories = [];
let selectedCategory = null;
let categoryProducts = [];
let categoryCurrentPage = 1;
let categoryPerPage = 15;
let categoryTotalProducts = 0;

/**
 * Initialize Categories Page
 */
async function initCategoriesPage() {
    const pageContainer = document.getElementById('page-categories');
    pageContainer.innerHTML = getCategoriesPageHTML();
    
    await loadAllCategories();
}

/**
 * Get Categories Page HTML Template
 */
function getCategoriesPageHTML() {
    return `
        <div class="page-header">
            <div class="breadcrumb">
                <a href="#" onclick="navigateTo('dashboard')">Dashboard</a> / Categories
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <h1 class="page-title">Product Categories <span id="categoryCountBadge" class="product-count-badge"></span></h1>
                <button class="btn btn-secondary" onclick="loadAllCategories()">
                    <i class="fas fa-sync-alt"></i> Refresh
                </button>
            </div>
        </div>
        
        <div class="categories-grid-layout">
            <!-- Categories Cards -->
            <div class="categories-cards" id="categoriesCards">
                <div class="loading-container">
                    <div class="loading-spinner">
                        <i class="fas fa-spinner fa-spin"></i>
                        <span>Loading categories...</span>
                    </div>
                </div>
            </div>
            
            <!-- Category Products Panel (hidden until selected) -->
            <div class="category-products-panel" id="categoryProductsPanel" style="display: none;">
            </div>
        </div>
    `;
}

/**
 * Load All Categories from API
 */
async function loadAllCategories() {
    const container = document.getElementById('categoriesCards');
    if (!container) return;
    
    container.innerHTML = `
        <div class="loading-container">
            <div class="loading-spinner">
                <i class="fas fa-spinner fa-spin"></i>
                <span>Loading categories...</span>
            </div>
        </div>
    `;
    
    try {
        const data = await API.getProductTypes();
        allCategories = data.productTypes || [];
        
        // Update count badge
        const badge = document.getElementById('categoryCountBadge');
        if (badge) {
            badge.textContent = `${allCategories.length} categories • ${data.total?.toLocaleString() || 0} products`;
        }
        
        renderCategoriesGrid(allCategories);
    } catch (error) {
        console.error('Error loading categories:', error);
        container.innerHTML = `
            <div class="error-content">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Failed to load categories</h3>
                <p>${error.message}</p>
                <button class="btn btn-primary" onclick="loadAllCategories()">
                    <i class="fas fa-sync-alt"></i> Retry
                </button>
            </div>
        `;
    }
}

/**
 * Render Categories Grid
 */
function renderCategoriesGrid(categories) {
    const container = document.getElementById('categoriesCards');
    if (!container) return;
    
    if (categories.length === 0) {
        container.innerHTML = `
            <div class="empty-content">
                <i class="fas fa-folder-open"></i>
                <h3>No categories found</h3>
            </div>
        `;
        return;
    }
    
    // Sort by count descending
    const sorted = [...categories].sort((a, b) => b.count - a.count);
    
    // Category icons mapping
    const categoryIcons = {
        'T-Shirts': 'fa-tshirt',
        'Polos': 'fa-tshirt',
        'Polo Shirts': 'fa-tshirt',
        'Hoodies': 'fa-mitten',
        'Sweatshirts': 'fa-mitten',
        'Jackets': 'fa-vest',
        'Trousers': 'fa-socks',
        'Shorts': 'fa-socks',
        'Caps': 'fa-hat-cowboy',
        'Hats': 'fa-hat-cowboy',
        'Bags': 'fa-shopping-bag',
        'Accessories': 'fa-glasses',
        'Workwear': 'fa-hard-hat',
        'Sportswear': 'fa-running',
        'Kids': 'fa-child',
        'default': 'fa-box'
    };
    
    container.innerHTML = `
        <div class="category-cards-grid">
            ${sorted.map(cat => {
                const icon = categoryIcons[cat.name] || categoryIcons['default'];
                return `
                    <div class="category-card ${selectedCategory?.id === cat.id ? 'active' : ''}" 
                         onclick="selectCategoryItem(${cat.id}, '${escapeCatName(cat.name)}')">
                        <div class="category-card-icon">
                            <i class="fas ${icon}"></i>
                        </div>
                        <div class="category-card-info">
                            <h3>${cat.name}</h3>
                            <span class="category-card-count">${cat.count.toLocaleString()} products</span>
                            <span class="category-card-percentage">${cat.percentage}</span>
                        </div>
                        <div class="category-card-arrow">
                            <i class="fas fa-chevron-right"></i>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

/**
 * Escape category name
 */
function escapeCatName(name) {
    return name.replace(/'/g, "\\'").replace(/"/g, '\\"');
}

/**
 * Select Category and Show Products
 */
async function selectCategoryItem(catId, catName) {
    selectedCategory = { id: catId, name: catName };
    categoryCurrentPage = 1;
    
    // Update active state
    document.querySelectorAll('.category-card').forEach(card => card.classList.remove('active'));
    event.currentTarget?.classList.add('active');
    
    // Show products panel
    const panel = document.getElementById('categoryProductsPanel');
    panel.style.display = 'block';
    
    await loadCategoryProducts();
}

/**
 * Load Products for Selected Category
 */
async function loadCategoryProducts() {
    if (!selectedCategory) return;
    
    const panel = document.getElementById('categoryProductsPanel');
    panel.innerHTML = `
        <div class="category-products-header">
            <h2><i class="fas fa-th-large"></i> ${selectedCategory.name}</h2>
            <button class="btn btn-secondary btn-sm" onclick="closeCategoryProducts()">
                <i class="fas fa-times"></i> Close
            </button>
        </div>
        <div class="loading-container">
            <div class="loading-spinner">
                <i class="fas fa-spinner fa-spin"></i>
                <span>Loading products...</span>
            </div>
        </div>
    `;
    
    try {
        const data = await API.getProducts({
            productType: selectedCategory.name,
            page: categoryCurrentPage,
            limit: categoryPerPage
        });
        
        categoryProducts = data.items || [];
        categoryTotalProducts = data.total || 0;
        
        renderCategoryProducts();
    } catch (error) {
        console.error('Error loading category products:', error);
        panel.innerHTML = `
            <div class="category-products-header">
                <h2><i class="fas fa-th-large"></i> ${selectedCategory.name}</h2>
                <button class="btn btn-secondary btn-sm" onclick="closeCategoryProducts()">
                    <i class="fas fa-times"></i> Close
                </button>
            </div>
            <div class="error-content">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Failed to load products</h3>
                <p>${error.message}</p>
                <button class="btn btn-primary" onclick="loadCategoryProducts()">Retry</button>
            </div>
        `;
    }
}

/**
 * Render Category Products
 */
function renderCategoryProducts() {
    const panel = document.getElementById('categoryProductsPanel');
    const totalPages = Math.ceil(categoryTotalProducts / categoryPerPage);
    
    panel.innerHTML = `
        <div class="category-products-header">
            <div>
                <h2><i class="fas fa-th-large"></i> ${selectedCategory.name}</h2>
                <span class="product-count-badge">${categoryTotalProducts.toLocaleString()} products</span>
            </div>
            <button class="btn btn-secondary btn-sm" onclick="closeCategoryProducts()">
                <i class="fas fa-times"></i> Close
            </button>
        </div>
        
        ${categoryProducts.length === 0 ? `
            <div class="empty-content">
                <i class="fas fa-box-open"></i>
                <h3>No products in this category</h3>
            </div>
        ` : `
            <div class="products-grid">
                ${categoryProducts.map(product => renderCategoryProductCard(product)).join('')}
            </div>
            
            ${categoryTotalProducts > categoryPerPage ? `
                <div class="products-pagination">
                    <div class="pagination-info">
                        Page ${categoryCurrentPage} of ${totalPages}
                    </div>
                    <div class="pagination-controls">
                        <button class="pagination-btn" onclick="goToCategoryPage(${categoryCurrentPage - 1})" ${categoryCurrentPage <= 1 ? 'disabled' : ''}>
                            <i class="fas fa-chevron-left"></i>
                        </button>
                        <span class="pagination-current">Page ${categoryCurrentPage}</span>
                        <button class="pagination-btn" onclick="goToCategoryPage(${categoryCurrentPage + 1})" ${categoryCurrentPage >= totalPages ? 'disabled' : ''}>
                            <i class="fas fa-chevron-right"></i>
                        </button>
                    </div>
                </div>
            ` : ''}
        `}
    `;
}

/**
 * Render Category Product Card
 */
function renderCategoryProductCard(product) {
    const code = product.code || product.styleCode || 'N/A';
    const name = product.name || product.styleName || 'Unnamed';
    const image = product.image || product.primaryImage || '';
    const price = product.priceRange?.min || product.minPrice || null;
    const brand = product.brand || '';
    const colors = product.colors || product.colourVariants || [];

    // Cache summary for modal consistency (same image/price as the card)
    if (code && code !== 'N/A') {
        window.__productSummaryCache = window.__productSummaryCache || {};
        window.__productSummaryCache[String(code).toUpperCase()] = product;
    }
    
    return `
        <div class="product-card" onclick="openProductModal('${code}')">
            <div class="product-card-image">
                <img src="${image || 'https://via.placeholder.com/200x200/e2e8f0/718096?text=No+Image'}" 
                     alt="${name}"
                     loading="lazy"
                     onerror="this.src='https://via.placeholder.com/200x200/e2e8f0/718096?text=No+Image'">
            </div>
            <div class="product-card-info">
                <div class="product-card-code">${code}</div>
                <div class="product-card-name">${truncateCatText(name, 40)}</div>
                ${brand ? `<div class="product-card-brand">${brand}</div>` : ''}
                <div class="product-card-price">${formatCatPrice(price)}</div>
                ${colors.length ? `
                    <div class="product-card-colors">
                        ${colors.slice(0, 5).map(color => {
                            const colorName = typeof color === 'string' ? color : (color.name || color.colour || color.primaryColour || color.color || '');
                            const css = window.COLOR_UTILS?.toCss ? window.COLOR_UTILS.toCss(colorName) : '#d1d5db';
                            return `<span class="color-dot" title="${colorName}" style="background:${css}"></span>`;
                        }).join('')}
                        ${colors.length > 5 ? `<span class="color-more">+${colors.length - 5}</span>` : ''}
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}

/**
 * Close Category Products Panel
 */
function closeCategoryProducts() {
    const panel = document.getElementById('categoryProductsPanel');
    panel.style.display = 'none';
    selectedCategory = null;
    
    document.querySelectorAll('.category-card').forEach(card => card.classList.remove('active'));
}

/**
 * Go To Category Page
 */
function goToCategoryPage(page) {
    const totalPages = Math.ceil(categoryTotalProducts / categoryPerPage);
    if (page < 1 || page > totalPages) return;
    
    categoryCurrentPage = page;
    loadCategoryProducts();
}

/**
 * Helpers
 */
function truncateCatText(text, length) {
    if (!text) return '';
    return text.length > length ? text.substring(0, length) + '...' : text;
}

function formatCatPrice(value) {
    if (value === null || value === undefined || isNaN(value)) {
        return '<span class="price-na">-</span>';
    }
    return '£' + parseFloat(value).toFixed(2);
}
