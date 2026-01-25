/**
 * BrandedUK Admin Hub - Brands Page
 * Displays all brands with product counts
 */

// State
let allBrands = [];
let selectedBrand = null;
let brandProducts = [];
let brandCurrentPage = 1;
let brandPerPage = 15;
let brandTotalProducts = 0;

/**
 * Initialize Brands Page
 */
async function initBrandsPage() {
    const pageContainer = document.getElementById('page-brands');
    pageContainer.innerHTML = getBrandsPageHTML();
    
    await loadAllBrands();
}

/**
 * Get Brands Page HTML Template
 */
function getBrandsPageHTML() {
    return `
        <div class="page-header">
            <div class="breadcrumb">
                <a href="#" onclick="navigateTo('dashboard')">Dashboard</a> / Brands
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <h1 class="page-title">Brands <span id="brandCountBadge" class="product-count-badge"></span></h1>
                <button class="btn btn-secondary" onclick="loadAllBrands()">
                    <i class="fas fa-sync-alt"></i> Refresh
                </button>
            </div>
        </div>
        
        <div class="brands-layout">
            <!-- Brands Sidebar -->
            <div class="brands-panel">
                <div class="brands-header">
                    <span class="brands-title">All Brands</span>
                    <div class="brands-search">
                        <i class="fas fa-search"></i>
                        <input type="text" id="brandSearchInput" placeholder="Search brands..." onkeyup="filterBrandsList(this.value)">
                    </div>
                </div>
                <div class="brand-list" id="brandList">
                    <div class="loading-small"><i class="fas fa-spinner fa-spin"></i> Loading brands...</div>
                </div>
            </div>
            
            <!-- Brand Products Panel -->
            <div class="products-panel" id="brandProductsPanel">
                <div class="select-brand-message">
                    <i class="fas fa-tags"></i>
                    <h3>Select a Brand</h3>
                    <p>Choose a brand from the list to view its products</p>
                </div>
            </div>
        </div>
    `;
}

/**
 * Load All Brands from API
 */
async function loadAllBrands() {
    const container = document.getElementById('brandList');
    if (!container) return;
    
    container.innerHTML = '<div class="loading-small"><i class="fas fa-spinner fa-spin"></i> Loading brands...</div>';
    
    try {
        const data = await API.getBrands();
        allBrands = data.brands || [];
        
        // Update count badge
        const badge = document.getElementById('brandCountBadge');
        if (badge) {
            badge.textContent = `${allBrands.length} brands`;
        }
        
        renderBrandsList(allBrands);
    } catch (error) {
        console.error('Error loading brands:', error);
        container.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Failed to load brands</p>
                <p class="error-hint">${error.message}</p>
                <button class="btn btn-primary" onclick="loadAllBrands()">
                    <i class="fas fa-sync-alt"></i> Retry
                </button>
            </div>
        `;
    }
}

/**
 * Render Brands List
 */
function renderBrandsList(brands) {
    const container = document.getElementById('brandList');
    if (!container) return;
    
    if (brands.length === 0) {
        container.innerHTML = '<div class="empty-message">No brands found</div>';
        return;
    }
    
    // Sort by product count descending
    const sorted = [...brands].sort((a, b) => b.count - a.count);
    
    container.innerHTML = sorted.map(brand => `
        <div class="brand-item ${selectedBrand?.id === brand.id ? 'active' : ''}"
             onclick="selectBrandItem(${brand.id}, '${escapeName(brand.name)}', '${brand.slug}')">
            <div class="brand-info">
                ${brand.logoUrl ? `<img src="${brand.logoUrl}" alt="${brand.name}" class="brand-logo" onerror="this.style.display='none'">` : '<i class="fas fa-tag brand-icon"></i>'}
                <span class="brand-name">${brand.name}</span>
            </div>
            <span class="brand-count">${brand.count.toLocaleString()}</span>
        </div>
    `).join('');
}

/**
 * Escape single quotes in names for onclick
 */
function escapeName(name) {
    return name.replace(/'/g, "\\'").replace(/"/g, '\\"');
}

/**
 * Filter Brands by Search
 */
function filterBrandsList(searchTerm) {
    const filtered = allBrands.filter(brand => 
        brand.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    renderBrandsList(filtered);
}

/**
 * Select a Brand and Load its Products
 */
async function selectBrandItem(brandId, brandName, brandSlug) {
    selectedBrand = { id: brandId, name: brandName, slug: brandSlug };
    brandCurrentPage = 1;
    
    // Update active state
    document.querySelectorAll('.brand-item').forEach(item => item.classList.remove('active'));
    event.currentTarget?.classList.add('active');
    
    await loadBrandProductsList();
}

/**
 * Load Products for Selected Brand
 */
async function loadBrandProductsList() {
    if (!selectedBrand) return;
    
    const panel = document.getElementById('brandProductsPanel');
    panel.innerHTML = `
        <div class="brand-products-header">
            <h2><i class="fas fa-tag"></i> ${selectedBrand.name}</h2>
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
            brand: selectedBrand.slug || selectedBrand.name,
            page: brandCurrentPage,
            limit: brandPerPage
        });
        
        brandProducts = data.items || [];
        brandTotalProducts = data.total || 0;
        
        renderBrandProductsList();
    } catch (error) {
        console.error('Error loading brand products:', error);
        panel.innerHTML = `
            <div class="brand-products-header">
                <h2><i class="fas fa-tag"></i> ${selectedBrand.name}</h2>
            </div>
            <div class="error-content">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Failed to load products</h3>
                <p>${error.message}</p>
                <button class="btn btn-primary" onclick="loadBrandProductsList()">Retry</button>
            </div>
        `;
    }
}

/**
 * Render Brand Products
 */
function renderBrandProductsList() {
    const panel = document.getElementById('brandProductsPanel');
    const totalPages = Math.ceil(brandTotalProducts / brandPerPage);
    
    panel.innerHTML = `
        <div class="brand-products-header">
            <h2><i class="fas fa-tag"></i> ${selectedBrand.name}</h2>
            <span class="product-count-badge">${brandTotalProducts.toLocaleString()} products</span>
        </div>
        
        ${brandProducts.length === 0 ? `
            <div class="empty-content">
                <i class="fas fa-box-open"></i>
                <h3>No products found</h3>
                <p>This brand has no active products</p>
            </div>
        ` : `
            <div class="products-grid">
                ${brandProducts.map(product => renderBrandProductCard(product)).join('')}
            </div>
            
            ${brandTotalProducts > brandPerPage ? `
                <div class="products-pagination">
                    <div class="pagination-info">
                        Page ${brandCurrentPage} of ${totalPages} (${brandTotalProducts.toLocaleString()} products)
                    </div>
                    <div class="pagination-controls">
                        <button class="pagination-btn" onclick="goToBrandProductsPage(1)" ${brandCurrentPage <= 1 ? 'disabled' : ''}>
                            <i class="fas fa-angle-double-left"></i>
                        </button>
                        <button class="pagination-btn" onclick="goToBrandProductsPage(${brandCurrentPage - 1})" ${brandCurrentPage <= 1 ? 'disabled' : ''}>
                            <i class="fas fa-chevron-left"></i>
                        </button>
                        <span class="pagination-current">Page ${brandCurrentPage}</span>
                        <button class="pagination-btn" onclick="goToBrandProductsPage(${brandCurrentPage + 1})" ${brandCurrentPage >= totalPages ? 'disabled' : ''}>
                            <i class="fas fa-chevron-right"></i>
                        </button>
                        <button class="pagination-btn" onclick="goToBrandProductsPage(${totalPages})" ${brandCurrentPage >= totalPages ? 'disabled' : ''}>
                            <i class="fas fa-angle-double-right"></i>
                        </button>
                    </div>
                </div>
            ` : ''}
        `}
    `;
}

/**
 * Render a Product Card
 */
function renderBrandProductCard(product) {
    const code = product.code || product.styleCode || 'N/A';
    const name = product.name || product.styleName || 'Unnamed Product';
    const image = product.image || product.primaryImage || '';
    const price = product.priceRange?.min || product.minPrice || null;
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
                <div class="product-card-name">${truncateText(name, 45)}</div>
                <div class="product-card-price">${formatPriceValue(price)}</div>
                <div class="product-card-colors">
                    ${colors.slice(0, 5).map(color => {
                        const colorName = typeof color === 'string' ? color : (color.name || color.colour || color.primaryColour || color.color || '');
                        const css = window.COLOR_UTILS?.toCss ? window.COLOR_UTILS.toCss(colorName) : '#d1d5db';
                        return `<span class="color-dot" title="${colorName}" style="background:${css}"></span>`;
                    }).join('')}
                    ${colors.length > 5 ? `<span class="color-more">+${colors.length - 5}</span>` : ''}
                </div>
            </div>
        </div>
    `;
}

/**
 * Go To Page in Brand Products
 */
function goToBrandProductsPage(page) {
    const totalPages = Math.ceil(brandTotalProducts / brandPerPage);
    if (page < 1 || page > totalPages) return;
    
    brandCurrentPage = page;
    loadBrandProductsList();
}

/**
 * Helper: Truncate text
 */
function truncateText(text, length) {
    if (!text) return '';
    return text.length > length ? text.substring(0, length) + '...' : text;
}

/**
 * Helper: Format price
 */
function formatPriceValue(value) {
    if (value === null || value === undefined || isNaN(value)) {
        return '<span class="price-na">-</span>';
    }
    return '£' + parseFloat(value).toFixed(2);
}
