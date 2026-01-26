/**
 * BrandedUK Admin Hub - Product Modal
 * Shows product details in a modal overlay
 */

// Global in-memory cache for product summary data coming from list endpoints (CSV-derived fields)
// Keyed by uppercased product code.
window.__productSummaryCache = window.__productSummaryCache || {};

function getCachedProductSummary(productCode) {
    if (!productCode) return null;
    const key = String(productCode).toUpperCase();
    return window.__productSummaryCache[key] || null;
}

function extractPrimaryImage(product) {
    if (!product) return '';
    const images = Array.isArray(product.images) ? product.images : [];

    return (
        product.image ||
        product.primaryImage ||
        product.image_url ||
        product.imageUrl ||
        product.thumbnail ||
        product.thumbnailUrl ||
        images[0] ||
        ''
    );
}

function extractPriceRange(product) {
    if (!product) return {};
    const pr = product.priceRange || {};
    const min = pr.min ?? product.minPrice ?? product.price ?? null;
    const max = pr.max ?? product.maxPrice ?? null;

    if (min === null && max === null) return {};
    return { min, max };
}

function escapeAttr(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function getColorCss(colorName) {
    try {
        return window.COLOR_UTILS?.toCss ? window.COLOR_UTILS.toCss(colorName) : '#d1d5db';
    } catch {
        return '#d1d5db';
    }
}

function findVariantByColor(product, colorName) {
    if (!product || !colorName) return null;
    const variants = product.colourVariants || product.colorVariants || product.variants || [];
    if (!Array.isArray(variants)) return null;

    const target = String(colorName).toLowerCase().trim();
    return variants.find(v => {
        const n = String(v?.name || v?.colour || v?.color || v?.primaryColour || '').toLowerCase().trim();
        return n && (n === target || n.includes(target) || target.includes(n));
    }) || null;
}

function extractVariantImage(variant) {
    if (!variant) return '';
    const images = Array.isArray(variant.images) ? variant.images : [];
    return (
        variant.image ||
        variant.primaryImage ||
        variant.imageUrl ||
        variant.image_url ||
        variant.thumbnail ||
        variant.thumbnailUrl ||
        images[0] ||
        ''
    );
}

// Active modal state
window.__currentModalProduct = window.__currentModalProduct || null;
window.__currentModalSelectedColor = window.__currentModalSelectedColor || null;

function selectModalColor(productCode, colorName) {
    window.__currentModalSelectedColor = colorName;

    // Update UI selection
    document.querySelectorAll('.color-swatch').forEach(el => el.classList.remove('active'));
    const key = `[data-color="${CSS.escape(String(colorName))}"]`;
    const active = document.querySelector(`.color-swatch${key}`);
    active?.classList.add('active');

    // Try to swap image based on variant mapping
    const product = window.__currentModalProduct;
    const variant = findVariantByColor(product, colorName);
    const variantImage = extractVariantImage(variant);
    if (variantImage) {
        changeProductImage(variantImage, null);
    }
}

/**
 * Open Product Modal
 */
async function openProductModal(productCode) {
    // Create modal if not exists
    let modal = document.getElementById('productModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'productModal';
        modal.className = 'modal-overlay';
        document.body.appendChild(modal);
    }
    
    // Show loading state
    modal.innerHTML = `
        <div class="modal-container modal-lg">
            <div class="modal-header">
                <h2><i class="fas fa-box"></i> Loading product...</h2>
                <button class="modal-close" onclick="closeProductModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="loading-container">
                    <div class="loading-spinner">
                        <i class="fas fa-spinner fa-spin"></i>
                        <span>Loading product details...</span>
                    </div>
                </div>
            </div>
        </div>
    `;
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    
    try {
        // Prefer CSV-derived summary fields (image/price) from list views for consistency
        const cached = getCachedProductSummary(productCode);

        // Fetch product details
        const apiProduct = await API.getProduct(productCode);

        // Merge with cache, but keep cached image/price if API doesn't provide them
        const merged = { ...(cached || {}), ...(apiProduct || {}) };

        const cachedImage = extractPrimaryImage(cached);
        const apiImage = extractPrimaryImage(apiProduct);
        if (!apiImage && cachedImage) {
            merged.image = cached.image || cached.primaryImage || cachedImage;
            merged.primaryImage = cached.primaryImage || cached.image || cachedImage;
            if ((!merged.images || merged.images.length === 0) && Array.isArray(cached.images) && cached.images.length > 0) {
                merged.images = cached.images;
            }
        }

        const apiPrice = extractPriceRange(apiProduct);
        const cachedPrice = extractPriceRange(cached);
        if (!apiPrice.min && cachedPrice.min) {
            merged.priceRange = cachedPrice;
            if (!merged.minPrice && cached.minPrice) merged.minPrice = cached.minPrice;
        }

        renderProductModal(merged);
    } catch (error) {
        console.error('Error loading product:', error);
        modal.innerHTML = `
            <div class="modal-container">
                <div class="modal-header">
                    <h2><i class="fas fa-exclamation-triangle"></i> Error</h2>
                    <button class="modal-close" onclick="closeProductModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="error-content">
                        <i class="fas fa-exclamation-triangle"></i>
                        <h3>Failed to load product</h3>
                        <p>${error.message}</p>
                        <button class="btn btn-primary" onclick="openProductModal('${productCode}')">Retry</button>
                        <button class="btn btn-secondary" onclick="closeProductModal()">Close</button>
                    </div>
                </div>
            </div>
        `;
    }
}

/**
 * Render Product Modal Content
 */
function renderProductModal(product) {
    const modal = document.getElementById('productModal');
    if (!modal) return;

    // Keep current modal product available for color selection
    window.__currentModalProduct = product;
    
    const code = product.code || product.styleCode || 'N/A';
    const name = product.name || product.styleName || 'Unnamed Product';
    const description = product.description || product.styleDescription || '';
    const brand = product.brand || '';
    const productType = product.productType || '';
    const images = Array.isArray(product.images) ? product.images : [];
    const primaryImage = extractPrimaryImage(product) || images[0] || '';
    const colors = product.colors || product.colourVariants || [];
    const sizes = product.sizes || [];
    const priceRange = extractPriceRange(product);
    const gender = product.gender || '';
    const fabric = product.fabric || '';
    
    modal.innerHTML = `
        <div class="modal-container modal-lg">
            <div class="modal-header">
                <div class="modal-title-group">
                    <h2><i class="fas fa-box"></i> ${code}</h2>
                    ${brand ? `<span class="modal-subtitle">${brand}</span>` : ''}
                </div>
                <button class="modal-close" onclick="closeProductModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <div class="modal-body">
                <div class="product-detail-layout">
                    <!-- Left: Images -->
                    <div class="product-detail-images">
                        <div class="product-main-image">
                            <img src="${primaryImage || 'https://via.placeholder.com/400x400/e2e8f0/718096?text=No+Image'}" 
                                 alt="${name}"
                                 id="productMainImage"
                                 onerror="this.src='https://via.placeholder.com/400x400/e2e8f0/718096?text=No+Image'">
                        </div>
                        ${images.length > 1 ? `
                            <div class="product-thumbnails">
                                ${images.slice(0, 6).map((img, i) => `
                                    <img src="${img}" 
                                         alt="View ${i+1}"
                                         class="product-thumbnail ${i === 0 ? 'active' : ''}"
                                         onclick="changeProductImage('${img}', this)"
                                         onerror="this.style.display='none'">
                                `).join('')}
                            </div>
                        ` : ''}
                    </div>
                    
                    <!-- Right: Info -->
                    <div class="product-detail-info">
                        <h1 class="product-detail-name">${name}</h1>
                        
                        <div class="product-detail-meta">
                            ${productType ? `<span class="meta-badge type"><i class="fas fa-th-large"></i> ${productType}</span>` : ''}
                            ${gender ? `<span class="meta-badge gender"><i class="fas fa-venus-mars"></i> ${gender}</span>` : ''}
                            ${fabric ? `<span class="meta-badge fabric"><i class="fas fa-scroll"></i> ${fabric}</span>` : ''}
                        </div>
                        
                        <div class="product-detail-price">
                            ${priceRange.min ? `
                                <span class="price-label">Price from</span>
                                <span class="price-value">£${parseFloat(priceRange.min).toFixed(2)}</span>
                                ${priceRange.max && priceRange.max !== priceRange.min ? 
                                    `<span class="price-to">to £${parseFloat(priceRange.max).toFixed(2)}</span>` : ''}
                            ` : '<span class="price-na">Price not available</span>'}
                        </div>
                        
                        ${colors.length > 0 ? `
                            <div class="product-detail-section">
                                <h4><i class="fas fa-palette"></i> Colors (${colors.length})</h4>
                                <div class="product-colors-list">
                                    ${colors.slice(0, 14).map((color, idx) => {
                                        const colorName = typeof color === 'string' ? color : (color.name || color.colour || color.color || '');
                                        const safeName = escapeAttr(colorName);
                                        const css = getColorCss(colorName);
                                        const isActive = (window.__currentModalSelectedColor && String(window.__currentModalSelectedColor) === String(colorName)) || (!window.__currentModalSelectedColor && idx === 0);
                                        return `
                                            <button class="color-swatch ${isActive ? 'active' : ''}" 
                                                type="button"
                                                data-color="${safeName}"
                                                onclick="selectModalColor('${escapeAttr(code)}','${safeName}')"
                                                title="${safeName}">
                                                <span class="color-swatch-dot" style="background:${css}"></span>
                                                <span class="color-swatch-label">${safeName}</span>
                                            </button>
                                        `;
                                    }).join('')}
                                    ${colors.length > 14 ? `<span class="color-more">+${colors.length - 14} more</span>` : ''}
                                </div>
                            </div>
                        ` : ''}
                        
                        ${sizes.length > 0 ? `
                            <div class="product-detail-section">
                                <h4><i class="fas fa-ruler"></i> Sizes (${sizes.length})</h4>
                                <div class="product-sizes-list">
                                    ${sizes.map(size => `<span class="size-tag">${size}</span>`).join('')}
                                </div>
                            </div>
                        ` : ''}
                        
                        ${description ? `
                            <div class="product-detail-section">
                                <h4><i class="fas fa-align-left"></i> Description</h4>
                                <p class="product-description">${description}</p>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
            
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeProductModal()">
                    <i class="fas fa-times"></i> Close
                </button>
                <a href="${CONFIG.API_BASE_URL}/api/products/${code}" target="_blank" class="btn btn-secondary">
                    <i class="fas fa-code"></i> View API Response
                </a>
                <button class="btn btn-primary" onclick="editProduct('${code}')">
                    <i class="fas fa-edit"></i> Edit Product
                </button>
            </div>
        </div>
    `;
}

/**
 * Change Product Main Image
 */
function changeProductImage(imageUrl, thumbnail) {
    const mainImage = document.getElementById('productMainImage');
    if (mainImage) {
        mainImage.src = imageUrl;
    }
    
    // Update active thumbnail
    document.querySelectorAll('.product-thumbnail').forEach(t => t.classList.remove('active'));
    thumbnail?.classList.add('active');
}

/**
 * Close Product Modal
 */
function closeProductModal() {
    const modal = document.getElementById('productModal');
    if (modal) {
        modal.classList.remove('open');
        if (document.querySelectorAll('.modal-overlay.open').length === 0) {
            document.body.style.overflow = '';
        }
    }
}

/**
 * Edit Product (placeholder)
 */
function editProduct(code) {
    alert(`Edit product ${code} - Coming soon!`);
}

// Close modal on Escape key
function closeTopMostModalOverlay() {
    const openOverlays = Array.from(document.querySelectorAll('.modal-overlay.open'));
    if (openOverlays.length === 0) return;
    const top = openOverlays[openOverlays.length - 1];
    top.classList.remove('open');
    if (document.querySelectorAll('.modal-overlay.open').length === 0) {
        document.body.style.overflow = '';
    }
}

// Close modal on Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeTopMostModalOverlay();
    }
});

// Close modal on overlay click
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal-overlay')) {
        e.target.classList.remove('open');
        if (document.querySelectorAll('.modal-overlay.open').length === 0) {
            document.body.style.overflow = '';
        }
    }
});
