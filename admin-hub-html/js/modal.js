/**
 * BrandedUK Admin Hub - Product Modal
 * Shows product details in a modal overlay
 */

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
        // Fetch product details
        const product = await API.getProduct(productCode);
        renderProductModal(product);
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
    
    const code = product.code || product.styleCode || 'N/A';
    const name = product.name || product.styleName || 'Unnamed Product';
    const description = product.description || product.styleDescription || '';
    const brand = product.brand || '';
    const productType = product.productType || '';
    const images = product.images || [];
    const primaryImage = product.image || product.primaryImage || images[0] || '';
    const colors = product.colors || product.colourVariants || [];
    const sizes = product.sizes || [];
    const priceRange = product.priceRange || {};
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
                                    ${colors.slice(0, 12).map(color => {
                                        const colorName = typeof color === 'string' ? color : (color.name || color.colour || '');
                                        return `<span class="color-tag">${colorName}</span>`;
                                    }).join('')}
                                    ${colors.length > 12 ? `<span class="color-more">+${colors.length - 12} more</span>` : ''}
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
        document.body.style.overflow = '';
    }
}

/**
 * Edit Product (placeholder)
 */
function editProduct(code) {
    alert(`Edit product ${code} - Coming soon!`);
}

// Close modal on Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeProductModal();
    }
});

// Close modal on overlay click
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal-overlay')) {
        closeProductModal();
    }
});
