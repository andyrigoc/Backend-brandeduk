/**
 * BrandedUK Admin Hub - Brands Page Script
 * Connects to API: /api/products/brands
 */

const API_BASE_URL = 'http://localhost:3004';

// State
let brands = [];
let selectedBrand = null;
let brandProducts = [];
let currentPage = 1;
let perPage = 15;
let totalProducts = 0;
let isLoading = false;

/**
 * Initialize Brands Page
 */
async function initBrandsPage() {
    const pageContainer = document.getElementById('page-brands');
    pageContainer.innerHTML = getBrandsPageHTML();
    
    await loadBrands();
}

/**
 * Get Brands Page HTML Template
 */
function getBrandsPageHTML() {
    return `
        <div class="page-header">
            <div class="breadcrumb">
                <a href="#">Dashboard</a> / Brands
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <h1 class="page-title">Brands <span id="brandCountBadge" class="product-count-badge"></span></h1>
                <button class="btn btn-secondary" onclick="loadBrands()">
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
                        <input type="text" id="brandSearch" placeholder="Search brands..." onkeyup="filterBrands(this.value)">
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
 * Load Brands from API
 */
async function loadBrands() {
    const container = document.getElementById('brandList');
    container.innerHTML = '<div class="loading-small"><i class="fas fa-spinner fa-spin"></i> Loading brands...</div>';
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/products/brands`);
        if (!response.ok) throw new Error('Failed to fetch brands');
        
        const data = await response.json();
        brands = data.brands || [];
        
        // Update count badge
        const badge = document.getElementById('brandCountBadge');
        if (badge) {
            badge.textContent = `${brands.length} brands`;
        }
        
        renderBrands(brands);
    } catch (error) {
        console.error('Error loading brands:', error);
        container.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Failed to load brands</p>
                <p class="error-hint">Make sure backend is running on port 3004</p>
                <button class="btn btn-secondary" onclick="loadBrands()">Retry</button>
            </div>
        `;
    }
}

/**
 * Render Brands List
 */
function renderBrands(brandsToRender) {
    const container = document.getElementById('brandList');
    
    if (brandsToRender.length === 0) {
        container.innerHTML = '<div class="empty-message">No brands found</div>';
        return;
    }
    
    container.innerHTML = brandsToRender.map(brand => `
        <div class="brand-item ${selectedBrand?.id === brand.id ? 'active' : ''}"
             onclick="selectBrand(${brand.id}, '${brand.name.replace(/'/g, "\\'")}', '${brand.slug}')">
            <div class="brand-info">
                ${brand.logo ? `<img src="${brand.logo}" alt="${brand.name}" class="brand-logo" onerror="this.style.display='none'">` : ''}
                <span class="brand-name">${brand.name}</span>
            </div>
            <span class="brand-count">${brand.count.toLocaleString()}</span>
        </div>
    `).join('');
}

/**
 * Filter Brands by Search
 */
function filterBrands(searchTerm) {
    const filtered = brands.filter(brand => 
        brand.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    renderBrands(filtered);
}

/**
 * Select a Brand and Load its Products
 */
async function selectBrand(brandId, brandName, brandSlug) {
    selectedBrand = { id: brandId, name: brandName, slug: brandSlug };
    currentPage = 1;
    
    // Update active state in brand list
    document.querySelectorAll('.brand-item').forEach(item => item.classList.remove('active'));
    event.currentTarget.classList.add('active');
    
    await loadBrandProducts();
}

/**
 * Load Products for Selected Brand
 */
async function loadBrandProducts() {
    if (!selectedBrand) return;
    
    const panel = document.getElementById('brandProductsPanel');
    panel.innerHTML = `
        <div class="brand-products-header">
            <h2>${selectedBrand.name} Products</h2>
        </div>
        <div class="loading-overlay" style="position: relative; padding: 60px;">
            <div class="loading-spinner">
                <i class="fas fa-spinner fa-spin"></i>
                <span>Loading ${selectedBrand.name} products...</span>
            </div>
        </div>
    `;
    
    try {
        const url = `${API_BASE_URL}/api/products?brand=${encodeURIComponent(selectedBrand.slug || selectedBrand.name)}&page=${currentPage}&limit=${perPage}`;
        console.log('Fetching brand products:', url);
        
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch products');
        
        const data = await response.json();
        brandProducts = data.items || [];
        totalProducts = data.total || 0;
        
        renderBrandProducts();
    } catch (error) {
        console.error('Error loading brand products:', error);
        panel.innerHTML = `
            <div class="brand-products-header">
                <h2>${selectedBrand.name} Products</h2>
            </div>
            <div class="error-content" style="padding: 60px; text-align: center;">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Failed to load products</h3>
                <p>${error.message}</p>
                <button class="btn btn-primary" onclick="loadBrandProducts()">Retry</button>
            </div>
        `;
    }
}

/**
 * Render Brand Products
 */
function renderBrandProducts() {
    const panel = document.getElementById('brandProductsPanel');
    
    const totalPages = Math.ceil(totalProducts / perPage);
    const startItem = totalProducts > 0 ? (currentPage - 1) * perPage + 1 : 0;
    const endItem = Math.min(currentPage * perPage, totalProducts);
    
    panel.innerHTML = `
        <div class="brand-products-header">
            <h2>${selectedBrand.name} Products</h2>
            <span class="product-count-badge">${totalProducts.toLocaleString()} products</span>
        </div>
        
        <div class="products-grid" id="brandProductsGrid">
            ${brandProducts.length === 0 ? `
                <div class="empty-content">
                    <i class="fas fa-box-open"></i>
                    <h3>No products found</h3>
                    <p>This brand has no products</p>
                </div>
            ` : brandProducts.map(product => renderProductCard(product)).join('')}
        </div>
        
        ${totalProducts > perPage ? `
            <div class="products-pagination">
                <div class="pagination-info">
                    Showing ${startItem}-${endItem} of ${totalProducts.toLocaleString()}
                </div>
                <div class="pagination-controls">
                    <button class="pagination-btn" onclick="goToBrandPage(${currentPage - 1})" ${currentPage <= 1 ? 'disabled' : ''}>
                        <i class="fas fa-chevron-left"></i>
                    </button>
                    <span class="pagination-current">Page ${currentPage} of ${totalPages}</span>
                    <button class="pagination-btn" onclick="goToBrandPage(${currentPage + 1})" ${currentPage >= totalPages ? 'disabled' : ''}>
                        <i class="fas fa-chevron-right"></i>
                    </button>
                </div>
            </div>
        ` : ''}
    `;
}

/**
 * Render a Product Card
 */
function renderProductCard(product) {
    const code = product.code || product.styleCode || 'N/A';
    const name = product.name || product.styleName || 'Unnamed Product';
    const image = product.image || product.primaryImage || '';
    const price = product.priceRange?.min || product.minPrice || product.price || null;
    const colors = product.colors || product.colourVariants || [];
    
    return `
        <div class="product-card" onclick="openProductDetail('${code}')">
            <div class="product-card-image">
                <img src="${image || 'https://via.placeholder.com/200x200/e2e8f0/718096?text=No+Img'}" 
                     alt="${name}"
                     loading="lazy"
                     onerror="this.src='https://via.placeholder.com/200x200/e2e8f0/718096?text=No+Img'">
            </div>
            <div class="product-card-info">
                <div class="product-card-code">${code}</div>
                <div class="product-card-name">${truncate(name, 50)}</div>
                <div class="product-card-price">${formatPrice(price)}</div>
                <div class="product-card-colors">
                    ${colors.slice(0, 6).map(() => '<span class="color-dot"></span>').join('')}
                    ${colors.length > 6 ? `<span class="color-more">+${colors.length - 6}</span>` : ''}
                </div>
            </div>
        </div>
    `;
}

/**
 * Go To Brand Products Page
 */
function goToBrandPage(page) {
    const totalPages = Math.ceil(totalProducts / perPage);
    if (page < 1 || page > totalPages) return;
    
    currentPage = page;
    loadBrandProducts();
}

/**
 * Helper Functions
 */
function truncate(text, length) {
    if (!text) return '';
    return text.length > length ? text.substring(0, length) + '...' : text;
}

function formatPrice(value) {
    if (value === null || value === undefined || isNaN(value)) {
        return '<span class="price-na">-</span>';
    }
    return '£' + parseFloat(value).toFixed(2);
}

function openProductDetail(code) {
    window.open(`${API_BASE_URL}/api/products/${code}`, '_blank');
}
