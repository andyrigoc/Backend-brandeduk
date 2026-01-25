/**
 * BrandedUK Admin Hub - Product Detail Page
 * DecoNetwork-style product management with tabs
 */

let currentProduct = null;
let currentDetailTab = 'general';
let productBrands = [];
let productColors = [];

/**
 * Open Product Detail Page
 */
async function openProductDetailPage(code, event) {
    if (event) event.preventDefault();
    
    // Show loading state
    const pageContainer = document.getElementById('page-products');
    pageContainer.innerHTML = `
        <div class="loading-fullpage">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Loading product details...</p>
        </div>
    `;
    
    try {
        // Fetch product details from API
        const response = await fetch(`${API_BASE_URL}/api/products/${code}`);
        if (!response.ok) throw new Error('Product not found');
        
        currentProduct = await response.json();
        
        // Load brands for dropdown
        await loadBrandsForDropdown();
        
        // Render detail page
        renderProductDetailPage();
        
    } catch (error) {
        console.error('Error loading product:', error);
        pageContainer.innerHTML = `
            <div class="error-fullpage">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Failed to load product</h3>
                <p>${error.message}</p>
                <button class="btn btn-primary" onclick="initProductsPage()">
                    <i class="fas fa-arrow-left"></i> Back to Products
                </button>
            </div>
        `;
    }
}

/**
 * Load Brands for Dropdown
 */
async function loadBrandsForDropdown() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/products/brands`);
        if (response.ok) {
            const data = await response.json();
            productBrands = data.brands || [];
        }
    } catch (error) {
        console.error('Error loading brands:', error);
        productBrands = [];
    }
}

/**
 * Render Product Detail Page
 */
function renderProductDetailPage() {
    const pageContainer = document.getElementById('page-products');
    const product = currentProduct;
    
    const code = product.code || product.styleCode || 'N/A';
    const name = product.name || product.styleName || 'Unnamed Product';
    const brand = product.brand || 'Unspecified';
    const image = product.image || product.primaryImage || '';
    const colors = product.colors || product.colourVariants || [];
    const description = product.description || '';
    const productType = product.productType || 'Apparel';
    
    // Prepare colors for table
    productColors = colors.map((c, idx) => ({
        id: idx,
        name: typeof c === 'string' ? c : (c.name || c.colour || 'Unknown'),
        hex: typeof c === 'string' ? getColorHex(c) : (c.hex || c.colorHex || getColorHex(c.name)),
        active: true,
        default: idx === 0,
        searchFacet: getSearchFacet(typeof c === 'string' ? c : c.name),
        colorType: getColorType(typeof c === 'string' ? c : c.name)
    }));
    
    pageContainer.innerHTML = `
        <div class="product-detail-container">
            <!-- Breadcrumb -->
            <div class="product-detail-breadcrumb">
                <a href="#" onclick="initProductsPage(); return false;">Products</a>
                <span class="separator">/</span>
                <a href="#" onclick="initProductsPage(); return false;">Products</a>
                <span class="separator">/</span>
                <span>${code}</span>
            </div>
            
            <!-- Top Bar -->
            <div class="product-detail-topbar">
                <button class="btn btn-secondary" onclick="initProductsPage()">
                    <i class="fas fa-arrow-left"></i> Back to Products
                </button>
                <div class="buttons-right">
                    <button class="btn btn-secondary">
                        <i class="fas fa-external-link-alt"></i> View Product
                    </button>
                    <button class="btn btn-secondary" onclick="reportProductProblem()">
                        <i class="fas fa-flag"></i> Report a problem
                    </button>
                </div>
            </div>
            
            <!-- Main Layout -->
            <div class="product-detail-main">
                <!-- Left Side: Image + Menu -->
                <div class="product-detail-left">
                    <div class="product-image-preview">
                        <img src="${image || 'https://via.placeholder.com/200x200/e2e8f0/718096?text=No+Image'}" 
                             alt="${name}"
                             onerror="this.src='https://via.placeholder.com/200x200/e2e8f0/718096?text=No+Image'">
                        <div class="product-image-overlay">${truncateText(name, 30)}</div>
                    </div>
                    
                    <div class="properties-menu">
                        <div class="properties-menu-item ${currentDetailTab === 'general' ? 'active' : ''}" onclick="switchDetailTab('general')">
                            <i class="fas fa-info-circle"></i> General
                        </div>
                        <div class="properties-menu-item ${currentDetailTab === 'colors' ? 'active' : ''}" onclick="switchDetailTab('colors')">
                            <i class="fas fa-palette"></i> Colors
                        </div>
                        <div class="properties-menu-item ${currentDetailTab === 'views' ? 'active' : ''}" onclick="switchDetailTab('views')">
                            <i class="fas fa-th-large"></i> Views & Decoration Areas
                        </div>
                        <div class="properties-menu-item ${currentDetailTab === 'pricing' ? 'active' : ''}" onclick="switchDetailTab('pricing')">
                            <i class="fas fa-pound-sign"></i> Pricing
                        </div>
                        <div class="properties-menu-item ${currentDetailTab === 'quantities' ? 'active' : ''}" onclick="switchDetailTab('quantities')">
                            <i class="fas fa-cubes"></i> Minimum Quantities & Bundles
                        </div>
                        <div class="properties-menu-item ${currentDetailTab === 'sizing' ? 'active' : ''}" onclick="switchDetailTab('sizing')">
                            <i class="fas fa-ruler"></i> Sizing
                        </div>
                        <div class="properties-menu-item ${currentDetailTab === 'shipping' ? 'active' : ''}" onclick="switchDetailTab('shipping')">
                            <i class="fas fa-truck"></i> Shipping & Production
                        </div>
                        <div class="properties-menu-item ${currentDetailTab === 'supplier' ? 'active' : ''}" onclick="switchDetailTab('supplier')">
                            <i class="fas fa-industry"></i> Supplier
                        </div>
                        <div class="properties-menu-item ${currentDetailTab === 'sku' ? 'active' : ''}" onclick="switchDetailTab('sku')">
                            <i class="fas fa-barcode"></i> SKU, GTIN & Inventory
                        </div>
                        <div class="properties-menu-item ${currentDetailTab === 'categories' ? 'active' : ''}" onclick="switchDetailTab('categories')">
                            <i class="fas fa-folder"></i> Categories
                        </div>
                        <div class="properties-menu-item ${currentDetailTab === 'images' ? 'active' : ''}" onclick="switchDetailTab('images')">
                            <i class="fas fa-images"></i> Images
                        </div>
                        <div class="properties-menu-item ${currentDetailTab === 'specification' ? 'active' : ''}" onclick="switchDetailTab('specification')">
                            <i class="fas fa-list-ul"></i> Product Specification
                        </div>
                        <div class="properties-menu-item ${currentDetailTab === 'meta' ? 'active' : ''}" onclick="switchDetailTab('meta')">
                            <i class="fas fa-code"></i> Meta Information
                        </div>
                        <div class="properties-menu-item ${currentDetailTab === 'related' ? 'active' : ''}" onclick="switchDetailTab('related')">
                            <i class="fas fa-link"></i> Related Products
                        </div>
                    </div>
                </div>
                
                <!-- Right Side: Content -->
                <div class="product-detail-content">
                    <div id="detailTabContent">
                        ${renderDetailTabContent()}
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Switch Detail Tab
 */
function switchDetailTab(tab) {
    currentDetailTab = tab;
    
    // Update menu active state
    document.querySelectorAll('.properties-menu-item').forEach(item => {
        item.classList.remove('active');
    });
    event.target.closest('.properties-menu-item').classList.add('active');
    
    // Update content
    document.getElementById('detailTabContent').innerHTML = renderDetailTabContent();
}

/**
 * Render Detail Tab Content
 */
function renderDetailTabContent() {
    const product = currentProduct;
    
    switch (currentDetailTab) {
        case 'general':
            return renderGeneralTab(product);
        case 'colors':
            return renderColorsTab(product);
        case 'views':
            return renderViewsTab(product);
        case 'pricing':
            return renderPricingTab(product);
        case 'quantities':
            return renderQuantitiesTab(product);
        case 'sizing':
            return renderSizingTab(product);
        case 'shipping':
            return renderShippingTab(product);
        case 'supplier':
            return renderSupplierTab(product);
        case 'sku':
            return renderSkuTab(product);
        case 'categories':
            return renderCategoriesTab(product);
        case 'images':
            return renderImagesTab(product);
        case 'specification':
            return renderSpecificationTab(product);
        case 'meta':
            return renderMetaTab(product);
        case 'related':
            return renderRelatedTab(product);
        default:
            return renderGeneralTab(product);
    }
}

/**
 * GENERAL TAB
 */
function renderGeneralTab(product) {
    const code = product.code || product.styleCode || '';
    const name = product.name || product.styleName || '';
    const brand = product.brand || 'Unspecified';
    const description = product.description || '';
    const sold = product.numberSold || 0;
    const decorated = product.decoratedProducts || 0;
    
    return `
        <div class="section-header">
            <h2>General</h2>
            <div class="stats">
                <span>Number Sold: <strong>${sold}</strong></span>
                <span>Number of Decorated Products: <strong>${decorated}</strong></span>
                <a href="#" onclick="viewProductOnStore(event)">View Product</a>
                <a href="#" onclick="reportProductProblem(event)">Report a problem with this product</a>
            </div>
        </div>
        
        <div class="section-body">
            <div class="form-columns">
                <div class="form-column">
                    <div class="checkbox-group">
                        <input type="checkbox" id="activeForSale" checked>
                        <label for="activeForSale">
                            Active for sale
                            <i class="fas fa-question-circle help-icon" title="Toggles availability of the product in both your online store and Business Hub."></i>
                        </label>
                    </div>
                    
                    <div class="checkbox-group">
                        <input type="checkbox" id="autoSelected">
                        <label for="autoSelected">
                            Auto Selected From Catalog
                        </label>
                    </div>
                    
                    <div class="form-group">
                        <label>Product name</label>
                        <input type="text" id="productName" value="${escapeHtml(name)}">
                    </div>
                    
                    <div class="form-group">
                        <label>Product code</label>
                        <input type="text" id="productCode" value="${escapeHtml(code)}">
                    </div>
                    
                    <div class="form-group">
                        <label>Allow Blank Purchase</label>
                        <select id="allowBlankPurchase">
                            <option value="default" selected>Use Default (Yes)</option>
                            <option value="yes">Yes</option>
                            <option value="no">No</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>Brand</label>
                        <div class="brand-selector">
                            <select id="productBrand">
                                <option value="">Unspecified</option>
                                ${productBrands.map(b => `
                                    <option value="${b.brand}" ${b.brand === brand ? 'selected' : ''}>${b.brand}</option>
                                `).join('')}
                            </select>
                            <a href="#" class="manage-link" onclick="openManageBrandsModal(event)">Manage Brands</a>
                        </div>
                    </div>
                </div>
                
                <div class="form-column">
                    <div class="form-group">
                        <label>Description</label>
                        <textarea id="productDescription">${escapeHtml(description)}</textarea>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="section-buttons">
            <button class="btn btn-primary" onclick="saveProductGeneral()">
                <i class="fas fa-save"></i> Save
            </button>
            <button class="btn btn-secondary" onclick="saveAndContinue()">
                <i class="fas fa-save"></i> Save and Continue
            </button>
            <button class="btn btn-outline" onclick="initProductsPage()">Cancel</button>
        </div>
    `;
}

/**
 * COLORS TAB
 */
function renderColorsTab(product) {
    return `
        <div class="section-header">
            <h2>Colors</h2>
        </div>
        
        <div class="section-body">
            <div class="color-sort-setting">
                <label>Color Sort Order:</label>
                <select id="colorSortOrder">
                    <option value="default">Use system default (alphabetically)</option>
                    <option value="custom">Specify custom</option>
                </select>
                <div class="sort-buttons">
                    <button class="btn btn-sm btn-secondary">Sort alphabetically</button>
                    <button class="btn btn-sm btn-secondary">Sort by hue</button>
                </div>
            </div>
            
            <div class="colors-table-wrapper">
                <table class="colors-table">
                    <thead>
                        <tr>
                            <th style="width: 50px;">On</th>
                            <th style="width: 60px;">Default</th>
                            <th style="width: 60px;">Color</th>
                            <th>Name</th>
                            <th>Search Facet</th>
                            <th>Color Type</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${productColors.map((color, idx) => `
                            <tr data-color-id="${idx}">
                                <td>
                                    <input type="checkbox" ${color.active ? 'checked' : ''} 
                                           onchange="toggleColorActive(${idx}, this.checked)">
                                </td>
                                <td>
                                    <input type="radio" name="defaultColor" ${color.default ? 'checked' : ''}
                                           onchange="setDefaultColor(${idx})">
                                </td>
                                <td>
                                    <span class="color-swatch" style="background-color: ${color.hex || '#ddd'}"></span>
                                </td>
                                <td class="color-name-cell">${color.name}</td>
                                <td>
                                    <select onchange="updateColorFacet(${idx}, this.value)">
                                        <option value="LightGrey" ${color.searchFacet === 'LightGrey' ? 'selected' : ''}>LightGrey</option>
                                        <option value="DarkGrey" ${color.searchFacet === 'DarkGrey' ? 'selected' : ''}>DarkGrey</option>
                                        <option value="Black" ${color.searchFacet === 'Black' ? 'selected' : ''}>Black</option>
                                        <option value="White" ${color.searchFacet === 'White' ? 'selected' : ''}>White</option>
                                        <option value="Red" ${color.searchFacet === 'Red' ? 'selected' : ''}>Red</option>
                                        <option value="Blue" ${color.searchFacet === 'Blue' ? 'selected' : ''}>Blue</option>
                                        <option value="Green" ${color.searchFacet === 'Green' ? 'selected' : ''}>Green</option>
                                        <option value="Yellow" ${color.searchFacet === 'Yellow' ? 'selected' : ''}>Yellow</option>
                                        <option value="Orange" ${color.searchFacet === 'Orange' ? 'selected' : ''}>Orange</option>
                                        <option value="Purple" ${color.searchFacet === 'Purple' ? 'selected' : ''}>Purple</option>
                                        <option value="Pink" ${color.searchFacet === 'Pink' ? 'selected' : ''}>Pink</option>
                                        <option value="Brown" ${color.searchFacet === 'Brown' ? 'selected' : ''}>Brown</option>
                                    </select>
                                </td>
                                <td>
                                    <select onchange="updateColorType(${idx}, this.value)">
                                        <option value="Light" ${color.colorType === 'Light' ? 'selected' : ''}>Light</option>
                                        <option value="Dark" ${color.colorType === 'Dark' ? 'selected' : ''}>Dark</option>
                                        <option value="White" ${color.colorType === 'White' ? 'selected' : ''}>White</option>
                                    </select>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            
            <button class="btn btn-secondary" style="margin-top: 16px;" onclick="addCustomColor()">
                <i class="fas fa-plus"></i> Add Color
            </button>
        </div>
        
        <div class="section-buttons">
            <button class="btn btn-primary" onclick="saveColors()">
                <i class="fas fa-save"></i> Save
            </button>
            <button class="btn btn-secondary" onclick="saveAndContinue()">
                <i class="fas fa-save"></i> Save and Continue
            </button>
            <button class="btn btn-outline" onclick="initProductsPage()">Cancel</button>
        </div>
    `;
}

/**
 * VIEWS & DECORATION AREAS TAB
 */
function renderViewsTab(product) {
    return `
        <div class="section-header">
            <h2>Views & Decoration Areas</h2>
        </div>
        
        <div class="section-body">
            <!-- Supported Decoration Processes -->
            <div class="decoration-process-section">
                <h3>Supported Decoration Processes</h3>
                <p style="color: #6b7280; font-size: 13px; margin-bottom: 16px;">
                    This product is using Smart Selected Rules. The available processes have been determined by the product attributes.
                    <a href="#" style="color: #0ea5e9;">See this product's Smart Select attributes</a>
                </p>
                
                <div class="decoration-options">
                    <div class="checkbox-group">
                        <input type="radio" name="processOption" id="smartSelect" checked>
                        <label for="smartSelect">Use Smart select rules to determine processes available</label>
                    </div>
                    <div class="checkbox-group">
                        <input type="radio" name="processOption" id="manualSelect">
                        <label for="manualSelect">Set processes available for this product</label>
                    </div>
                </div>
                
                <div class="decoration-processes-grid">
                    <div class="process-badge"><i class="fas fa-check-circle"></i> DTG</div>
                    <div class="process-badge"><i class="fas fa-check-circle"></i> SUB</div>
                    <div class="process-badge"><i class="fas fa-check-circle"></i> EMB</div>
                    <div class="process-badge"><i class="fas fa-check-circle"></i> SCR</div>
                    <div class="process-badge"><i class="fas fa-check-circle"></i> TRF</div>
                    <div class="process-badge"><i class="fas fa-check-circle"></i> RHS</div>
                    <div class="process-badge"><i class="fas fa-check-circle"></i> DTF</div>
                    <div class="process-badge"><i class="fas fa-check-circle"></i> UV</div>
                </div>
                
                <button class="btn btn-secondary" style="margin-top: 16px;">
                    Edit Decoration Process Description
                </button>
            </div>
            
            <!-- Product Views & Decoration Areas -->
            <div class="views-section">
                <h3>Product Views & Decoration Areas</h3>
                
                <div class="view-options">
                    <div class="checkbox-group">
                        <input type="radio" name="viewOption" id="supplierViews" checked>
                        <label for="supplierViews">Use Supplier Views</label>
                    </div>
                    <div class="checkbox-group">
                        <input type="radio" name="viewOption" id="customViews">
                        <label for="customViews">Define my own Views</label>
                    </div>
                    <button class="btn btn-secondary" style="margin-left: auto;" disabled>Add View</button>
                </div>
                
                <!-- Front View -->
                <div class="view-card">
                    <div class="view-card-header">
                        <h4><i class="fas fa-arrows-alt"></i> Front</h4>
                        <div class="view-actions">
                            <button class="btn btn-sm btn-secondary" title="Move Up"><i class="fas fa-arrow-up"></i></button>
                            <button class="btn btn-sm btn-secondary" title="Move Down"><i class="fas fa-arrow-down"></i></button>
                        </div>
                    </div>
                    <div class="view-card-body">
                        <div class="view-image-container">
                            <img src="${currentProduct?.image || 'https://via.placeholder.com/200x240/e5e7eb/374151?text=Front+View'}" alt="Front View">
                            <!-- Decoration Areas Overlay -->
                            <div class="decoration-area-overlay" style="top: 30%; left: 25%; width: 50%; height: 40%;"></div>
                        </div>
                        
                        <div class="areas-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Area Name</th>
                                        <th>Size<br>(W x H in)</th>
                                        <th>DTG</th>
                                        <th>EMB</th>
                                        <th>SCR</th>
                                        <th>TRF</th>
                                        <th>RHS</th>
                                        <th>DTF</th>
                                        <th>BH Only</th>
                                        <th>Sort</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>Body</td>
                                        <td>12 16</td>
                                        <td><i class="fas fa-check check-icon"></i></td>
                                        <td></td>
                                        <td><i class="fas fa-check check-icon"></i></td>
                                        <td><i class="fas fa-check check-icon"></i></td>
                                        <td><i class="fas fa-check check-icon"></i></td>
                                        <td><i class="fas fa-check check-icon"></i></td>
                                        <td></td>
                                        <td>
                                            <div class="sort-arrows">
                                                <button><i class="fas fa-arrow-up"></i></button>
                                                <button><i class="fas fa-arrow-down"></i></button>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Left Chest</td>
                                        <td>4 4</td>
                                        <td></td>
                                        <td><i class="fas fa-check check-icon"></i></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td>
                                            <div class="sort-arrows">
                                                <button><i class="fas fa-arrow-up"></i></button>
                                                <button><i class="fas fa-arrow-down"></i></button>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Right Chest</td>
                                        <td>4 4</td>
                                        <td></td>
                                        <td><i class="fas fa-check check-icon"></i></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td>
                                            <div class="sort-arrows">
                                                <button><i class="fas fa-arrow-up"></i></button>
                                                <button><i class="fas fa-arrow-down"></i></button>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                
                <!-- Back View -->
                <div class="view-card">
                    <div class="view-card-header">
                        <h4><i class="fas fa-arrows-alt"></i> Back</h4>
                        <div class="view-actions">
                            <button class="btn btn-sm btn-secondary" title="Move Up"><i class="fas fa-arrow-up"></i></button>
                            <button class="btn btn-sm btn-secondary" title="Move Down"><i class="fas fa-arrow-down"></i></button>
                        </div>
                    </div>
                    <div class="view-card-body">
                        <div class="view-image-container">
                            <img src="https://via.placeholder.com/200x240/e5e7eb/374151?text=Back+View" alt="Back View">
                            <div class="decoration-area-overlay" style="top: 25%; left: 20%; width: 60%; height: 45%;"></div>
                        </div>
                        
                        <div class="areas-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Area Name</th>
                                        <th>Size<br>(W x H in)</th>
                                        <th>DTG</th>
                                        <th>EMB</th>
                                        <th>SCR</th>
                                        <th>TRF</th>
                                        <th>RHS</th>
                                        <th>DTF</th>
                                        <th>BH Only</th>
                                        <th>Sort</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>Back</td>
                                        <td>14 18</td>
                                        <td><i class="fas fa-check check-icon"></i></td>
                                        <td></td>
                                        <td><i class="fas fa-check check-icon"></i></td>
                                        <td><i class="fas fa-check check-icon"></i></td>
                                        <td><i class="fas fa-check check-icon"></i></td>
                                        <td><i class="fas fa-check check-icon"></i></td>
                                        <td></td>
                                        <td>
                                            <div class="sort-arrows">
                                                <button><i class="fas fa-arrow-up"></i></button>
                                                <button><i class="fas fa-arrow-down"></i></button>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="section-buttons">
            <button class="btn btn-primary" onclick="saveViews()">
                <i class="fas fa-save"></i> Save
            </button>
            <button class="btn btn-secondary" onclick="saveAndContinue()">
                <i class="fas fa-save"></i> Save and Continue
            </button>
            <button class="btn btn-outline" onclick="initProductsPage()">Cancel</button>
        </div>
    `;
}

/**
 * PRICING TAB - DecoNetwork Style Complete
 */
function renderPricingTab(product) {
    const supplierCost = product.priceRange?.min || product.minPrice || product.price || 2.50;
    const markupPercent = 50;
    const markupAmount = (supplierCost * markupPercent / 100).toFixed(2);
    const blankProductPrice = (parseFloat(supplierCost) + parseFloat(markupAmount)).toFixed(2);
    
    // Decoration prices per process
    const decorationPrices = {
        DTG: 5.00, SUB: 5.00, EMB: 5.40, SCR: 5.40, TRF: 5.00, RHS: 5.00
    };
    
    // Calculate customer retail price (blank + decoration)
    const customerRetailDTG = (parseFloat(blankProductPrice) + decorationPrices.DTG).toFixed(2);
    const customerRetailSCR = (parseFloat(blankProductPrice) + decorationPrices.SCR).toFixed(2);
    
    return `
        <div class="section-header">
            <h2>Pricing</h2>
        </div>
        
        <div class="section-body">
            <!-- Contract Price Level -->
            <div class="pricing-section">
                <h3 class="pricing-section-title">Contract Price Level (Premium & Enterprise Levels Only)</h3>
                <div class="contract-price-levels">
                    <label class="radio-label">
                        <input type="radio" name="priceLevel" value="retail" checked>
                        <span class="radio-checkmark"></span>
                        Retail
                    </label>
                    <label class="radio-label">
                        <input type="radio" name="priceLevel" value="wholesale">
                        <span class="radio-checkmark"></span>
                        Wholesale
                    </label>
                    <label class="radio-label">
                        <input type="radio" name="priceLevel" value="vip">
                        <span class="radio-checkmark"></span>
                        VIP
                    </label>
                </div>
            </div>
            
            <!-- Default Pricing -->
            <div class="pricing-section">
                <div class="pricing-section-header">
                    <div>
                        <h3 class="pricing-section-title">Default Pricing</h3>
                        <p class="pricing-section-desc">Specify the blank price of this product and decoration pricing</p>
                    </div>
                </div>
                
                <!-- Price Breakdown Table -->
                <div class="price-breakdown-card">
                    <h4>Price Breakdown</h4>
                    
                    <table class="price-breakdown-table">
                        <tbody>
                            <tr>
                                <td class="label-cell">Supplier Base Cost (Piece) <i class="fas fa-question-circle help-icon" title="The cost from the supplier"></i></td>
                                <td class="link-cell"><a href="#" onclick="openViewCostModal(event)">View Cost</a></td>
                                <td class="value-cell">£${parseFloat(supplierCost).toFixed(2)}</td>
                                <td class="action-cell"></td>
                            </tr>
                            <tr>
                                <td class="label-cell">Supplier Product Markup (${markupPercent}%)</td>
                                <td class="link-cell"></td>
                                <td class="value-cell">£${markupAmount}</td>
                                <td class="action-cell">
                                    <button class="config-wheel" onclick="openMarkupConfig(event)" title="Configure Markup">
                                        <i class="fas fa-cog"></i>
                                    </button>
                                </td>
                            </tr>
                            <tr class="subtotal-row">
                                <td class="label-cell">Blank Product Price</td>
                                <td class="link-cell"></td>
                                <td class="value-cell">£${blankProductPrice}</td>
                                <td class="action-cell">
                                    <button class="config-wheel" onclick="openBlankPriceConfig(event)" title="Configure Blank Price">
                                        <i class="fas fa-cog"></i>
                                    </button>
                                </td>
                            </tr>
                            <tr>
                                <td class="label-cell">+ Decoration price</td>
                                <td class="link-cell"></td>
                                <td class="value-cell decoration-prices">
                                    <span class="process-header">DTG</span>
                                    <span class="process-header">SUB</span>
                                    <span class="process-header">EMB</span>
                                    <span class="process-header">SCR</span>
                                    <span class="process-header">TRF</span>
                                    <span class="process-header">RHS</span>
                                </td>
                                <td class="action-cell"></td>
                            </tr>
                            <tr>
                                <td class="label-cell"></td>
                                <td class="link-cell"><a href="#" onclick="openDecorationPricingModal(event)">Edit Price</a></td>
                                <td class="value-cell decoration-prices">
                                    <span>£${decorationPrices.DTG.toFixed(2)}</span>
                                    <span>£${decorationPrices.SUB.toFixed(2)}</span>
                                    <span>£${decorationPrices.EMB.toFixed(2)}</span>
                                    <span>£${decorationPrices.SCR.toFixed(2)}</span>
                                    <span>£${decorationPrices.TRF.toFixed(2)}</span>
                                    <span>£${decorationPrices.RHS.toFixed(2)}</span>
                                </td>
                                <td class="action-cell">
                                    <button class="config-wheel" onclick="openDecorationPriceConfig(event)" title="Configure Decoration Pricing">
                                        <i class="fas fa-cog"></i>
                                    </button>
                                </td>
                            </tr>
                            <tr class="total-row">
                                <td class="label-cell">= Customer Retail Price</td>
                                <td class="link-cell"><a href="#" onclick="toggleStorePricing(event)" id="storePricingLink">Show Store Pricing</a></td>
                                <td class="value-cell decoration-prices">
                                    <span>£${customerRetailDTG}</span>
                                    <span>£${customerRetailDTG}</span>
                                    <span>£${(parseFloat(blankProductPrice) + decorationPrices.EMB).toFixed(2)}</span>
                                    <span>£${customerRetailSCR}</span>
                                    <span>£${customerRetailDTG}</span>
                                    <span>£${customerRetailDTG}</span>
                                </td>
                                <td class="action-cell"></td>
                            </tr>
                            <tr>
                                <td class="label-cell">Retail Price Inc Tax (VAT +20%)</td>
                                <td class="link-cell"></td>
                                <td class="value-cell decoration-prices">
                                    <span>£${(customerRetailDTG * 1.2).toFixed(2)}</span>
                                    <span>£${(customerRetailDTG * 1.2).toFixed(2)}</span>
                                    <span>£${((parseFloat(blankProductPrice) + decorationPrices.EMB) * 1.2).toFixed(2)}</span>
                                    <span>£${(customerRetailSCR * 1.2).toFixed(2)}</span>
                                    <span>£${(customerRetailDTG * 1.2).toFixed(2)}</span>
                                    <span>£${(customerRetailDTG * 1.2).toFixed(2)}</span>
                                </td>
                                <td class="action-cell"></td>
                            </tr>
                        </tbody>
                    </table>
                    
                    <!-- Store Pricing (Initially Hidden) -->
                    <div id="storePricingSection" class="store-pricing-section" style="display: none;">
                        <div class="store-pricing-header">
                            <span>Store: brandeduk.com</span>
                            <a href="#" onclick="selectStore(event)">Select Store</a>
                        </div>
                        <table class="price-breakdown-table store-pricing-table">
                            <tbody>
                                <tr>
                                    <td class="label-cell">- Store Commission (20%)</td>
                                    <td class="value-cell">£${(customerRetailDTG * 0.2).toFixed(2)}</td>
                                </tr>
                                <tr>
                                    <td class="label-cell">= Store Wholesale Price</td>
                                    <td class="value-cell">£${(customerRetailDTG * 0.8).toFixed(2)}</td>
                                </tr>
                                <tr>
                                    <td class="label-cell">+ Store Markup (25%)</td>
                                    <td class="value-cell">£${(customerRetailDTG * 0.8 * 0.25).toFixed(2)}</td>
                                </tr>
                                <tr class="total-row">
                                    <td class="label-cell">= Store Retail Price</td>
                                    <td class="value-cell">£${(customerRetailDTG * 0.8 * 1.25).toFixed(2)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            
            <!-- Volume Discount -->
            <div class="pricing-section">
                <h3 class="pricing-section-title">Volume Discount</h3>
                <p class="pricing-section-desc">You can apply volume-based discounting for this product. This is in addition to any price breakdown pricing you configure.</p>
                
                <div class="form-group" style="max-width: 300px; margin-top: 16px;">
                    <label>Discount Table</label>
                    <select id="discountTable">
                        <option value="">No discount</option>
                        <option value="default">Use Default Discount</option>
                        <option value="good" selected>A good discount</option>
                        <option value="bulk">Bulk buyer discount</option>
                    </select>
                </div>
                
                <div class="checkbox-group" style="margin-top: 12px;">
                    <input type="checkbox" id="discountBaseOnly">
                    <label for="discountBaseOnly">Discount applies to base price only</label>
                </div>
            </div>
            
            <!-- Tax Exempt -->
            <div class="pricing-section">
                <div class="checkbox-group">
                    <input type="checkbox" id="taxExempt">
                    <label for="taxExempt">
                        Tax Exempt
                        <i class="fas fa-question-circle help-icon" title="Ticking this will not apply tax to this product"></i>
                    </label>
                </div>
            </div>
        </div>
        
        <div class="section-buttons">
            <button class="btn btn-primary" onclick="savePricing()">
                <i class="fas fa-save"></i> Save
            </button>
            <button class="btn btn-secondary" onclick="saveAndContinue()">
                <i class="fas fa-save"></i> Save & Continue
            </button>
            <button class="btn btn-outline btn-cancel" onclick="initProductsPage()">Cancel</button>
        </div>
    `;
}

/**
 * MINIMUM QUANTITIES & BUNDLES TAB - DecoNetwork Style
 */
function renderQuantitiesTab(product) {
    return `
        <div class="section-header">
            <h2>Minimum Quantities and Bundles</h2>
        </div>
        
        <div class="section-body">
            <!-- Minimum Quantities -->
            <div class="pricing-section">
                <h3 class="pricing-section-title">Minimum quantities</h3>
                
                <div class="checkbox-group" style="margin-bottom: 16px;">
                    <input type="checkbox" id="useDefaultMinQty" checked>
                    <label for="useDefaultMinQty">Use default minimum quantity</label>
                </div>
                
                <div class="form-group" style="max-width: 150px;">
                    <label>Minimum quantity <i class="fas fa-question-circle help-icon"></i></label>
                    <input type="number" id="minQuantity" value="1" min="1">
                </div>
                
                <p class="info-text" style="margin-top: 12px; color: #6b7280; font-size: 13px;">
                    A customer is not able to purchase any number of the chosen product at a volume less than this setting.
                </p>
            </div>
            
            <!-- Bundle Sizes -->
            <div class="pricing-section">
                <h3 class="pricing-section-title">Bundle Sizes</h3>
                <p class="pricing-section-desc">
                    Bundle Sizes set a limitation on products to be sold only in packages of a specific number of items. 
                    By default, bundles are set at 1 item per package.
                </p>
                
                <div class="bundle-options" style="margin: 16px 0;">
                    <label class="radio-label">
                        <input type="radio" name="bundleType" value="incremental" checked>
                        <span class="radio-checkmark"></span>
                        Use incremental bundles
                    </label>
                    <label class="radio-label">
                        <input type="radio" name="bundleType" value="custom">
                        <span class="radio-checkmark"></span>
                        Specify custom bundles
                    </label>
                </div>
                
                <div id="incrementalBundleSection">
                    <div class="form-group" style="max-width: 300px;">
                        <label>Maximum number of products that fit into the above package</label>
                        <input type="number" id="bundleSize" value="1" min="1">
                    </div>
                </div>
                
                <div id="customBundleSection" style="display: none;">
                    <div class="bundle-sizes-list">
                        <div class="bundle-size-item">
                            <input type="number" value="1" readonly>
                        </div>
                        <div class="bundle-size-item">
                            <input type="number" value="5">
                            <button class="btn btn-sm btn-danger" onclick="removeBundleSize(this)">Remove</button>
                        </div>
                        <div class="bundle-size-item">
                            <input type="number" value="20">
                            <button class="btn btn-sm btn-danger" onclick="removeBundleSize(this)">Remove</button>
                        </div>
                        <div class="bundle-size-item">
                            <input type="number" value="50">
                            <button class="btn btn-sm btn-danger" onclick="removeBundleSize(this)">Remove</button>
                        </div>
                        <div class="bundle-size-item">
                            <input type="number" value="100">
                            <button class="btn btn-sm btn-danger" onclick="removeBundleSize(this)">Remove</button>
                        </div>
                    </div>
                    <button class="btn btn-secondary" style="margin-top: 12px;" onclick="addBundleSize()">
                        Add Bundle Size
                    </button>
                </div>
                
                <div class="info-box" style="margin-top: 20px;">
                    <i class="fas fa-lightbulb" style="color: #0ea5e9;"></i>
                    <span>Bundles do not affect pricing in any way, however, you may wish to configure a price breakdown that matches your bundle sizes to make them more attractive to bulk buyers!</span>
                </div>
            </div>
        </div>
        
        <div class="section-buttons">
            <button class="btn btn-primary" onclick="saveQuantities()">
                <i class="fas fa-save"></i> Save
            </button>
            <button class="btn btn-secondary" onclick="saveAndContinue()">
                <i class="fas fa-save"></i> Save & Continue
            </button>
            <button class="btn btn-outline btn-cancel" onclick="initProductsPage()">Cancel</button>
        </div>
    `;
}

function renderSizingTab(product) {
    const sizes = product.sizes || product.sizeVariants || ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'];
    return `
        <div class="section-header">
            <h2>Sizing</h2>
        </div>
        <div class="section-body">
            <p>Available sizes for this product:</p>
            <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 16px;">
                ${(Array.isArray(sizes) ? sizes : []).map(size => `
                    <span style="padding: 8px 16px; background: #e5e7eb; border-radius: 6px; font-weight: 500;">${size}</span>
                `).join('')}
            </div>
        </div>
        <div class="section-buttons">
            <button class="btn btn-primary"><i class="fas fa-save"></i> Save</button>
            <button class="btn btn-outline" onclick="initProductsPage()">Cancel</button>
        </div>
    `;
}

function renderShippingTab(product) {
    return renderPlaceholderTab('Shipping & Production', 'Configure shipping dimensions, weights, and production settings.');
}

function renderSupplierTab(product) {
    return `
        <div class="section-header">
            <h2>Supplier</h2>
        </div>
        <div class="section-body">
            <div class="form-group" style="max-width: 400px;">
                <label>Supplier Name</label>
                <input type="text" value="Ralawise" disabled>
            </div>
            <div class="form-group" style="max-width: 400px;">
                <label>Supplier Code</label>
                <input type="text" value="${currentProduct?.code || ''}" disabled>
            </div>
        </div>
        <div class="section-buttons">
            <button class="btn btn-outline" onclick="initProductsPage()">Back</button>
        </div>
    `;
}

function renderSkuTab(product) {
    return renderPlaceholderTab('SKU, GTIN & Inventory', 'Manage SKU numbers, GTIN/EAN codes, and inventory levels.');
}

function renderCategoriesTab(product) {
    return `
        <div class="section-header">
            <h2>Categories</h2>
        </div>
        <div class="section-body">
            <p>Current product type: <strong>${currentProduct?.productType || 'N/A'}</strong></p>
            <div class="form-group" style="max-width: 400px; margin-top: 16px;">
                <label>Assign to Categories</label>
                <select multiple style="height: 200px;">
                    <option>Apparel</option>
                    <option selected>T-Shirts</option>
                    <option>Polo Shirts</option>
                    <option>Workwear</option>
                    <option>Hoodies</option>
                </select>
            </div>
        </div>
        <div class="section-buttons">
            <button class="btn btn-primary"><i class="fas fa-save"></i> Save</button>
            <button class="btn btn-outline" onclick="initProductsPage()">Cancel</button>
        </div>
    `;
}

function renderImagesTab(product) {
    return `
        <div class="section-header">
            <h2>Images</h2>
        </div>
        <div class="section-body">
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 16px;">
                <div style="border: 2px dashed #d1d5db; border-radius: 8px; padding: 40px; text-align: center; cursor: pointer;">
                    <i class="fas fa-plus" style="font-size: 24px; color: #9ca3af;"></i>
                    <p style="margin-top: 8px; color: #6b7280; font-size: 13px;">Add Image</p>
                </div>
                ${currentProduct?.image ? `
                    <div style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                        <img src="${currentProduct.image}" style="width: 100%; height: 150px; object-fit: cover;">
                    </div>
                ` : ''}
            </div>
        </div>
        <div class="section-buttons">
            <button class="btn btn-primary"><i class="fas fa-save"></i> Save</button>
            <button class="btn btn-outline" onclick="initProductsPage()">Cancel</button>
        </div>
    `;
}

function renderSpecificationTab(product) {
    return renderPlaceholderTab('Product Specification', 'Add product specifications and technical details.');
}

function renderMetaTab(product) {
    return renderPlaceholderTab('Meta Information', 'Configure SEO meta title, description, and keywords.');
}

function renderRelatedTab(product) {
    return renderPlaceholderTab('Related Products', 'Link related products for cross-selling.');
}

function renderPlaceholderTab(title, description) {
    return `
        <div class="section-header">
            <h2>${title}</h2>
        </div>
        <div class="section-body">
            <div style="text-align: center; padding: 60px 20px; color: #6b7280;">
                <i class="fas fa-cog" style="font-size: 48px; margin-bottom: 16px; opacity: 0.5;"></i>
                <p>${description}</p>
                <p style="font-size: 13px;">Configuration coming soon.</p>
            </div>
        </div>
        <div class="section-buttons">
            <button class="btn btn-outline" onclick="initProductsPage()">Back</button>
        </div>
    `;
}

/**
 * Helper Functions
 */
function truncateText(text, length) {
    if (!text) return '';
    return text.length > length ? text.substring(0, length) + '...' : text;
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function getColorHex(colorName) {
    if (!colorName) return '#cccccc';
    const colors = {
        'black': '#000000', 'white': '#ffffff', 'red': '#dc2626', 'blue': '#2563eb',
        'navy': '#1e3a5f', 'green': '#16a34a', 'yellow': '#eab308', 'orange': '#f97316',
        'pink': '#ec4899', 'purple': '#7c3aed', 'grey': '#6b7280', 'gray': '#6b7280',
        'charcoal': '#374151', 'royal': '#1d4ed8', 'maroon': '#7f1d1d', 'teal': '#0d9488'
    };
    const name = colorName.toLowerCase();
    for (const [key, hex] of Object.entries(colors)) {
        if (name.includes(key)) return hex;
    }
    return '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
}

function getSearchFacet(colorName) {
    if (!colorName) return 'LightGrey';
    const name = colorName.toLowerCase();
    if (name.includes('black')) return 'Black';
    if (name.includes('white')) return 'White';
    if (name.includes('red') || name.includes('maroon') || name.includes('crimson')) return 'Red';
    if (name.includes('blue') || name.includes('navy') || name.includes('royal')) return 'Blue';
    if (name.includes('green')) return 'Green';
    if (name.includes('yellow')) return 'Yellow';
    if (name.includes('orange')) return 'Orange';
    if (name.includes('pink')) return 'Pink';
    if (name.includes('purple')) return 'Purple';
    if (name.includes('brown')) return 'Brown';
    return 'LightGrey';
}

function getColorType(colorName) {
    if (!colorName) return 'Dark';
    const name = colorName.toLowerCase();
    if (name.includes('white') || name.includes('cream') || name.includes('ivory')) return 'White';
    if (name.includes('light') || name.includes('pale') || name.includes('pastel') || 
        name.includes('yellow') || name.includes('beige')) return 'Light';
    return 'Dark';
}

/**
 * Color Actions
 */
function toggleColorActive(idx, active) {
    if (productColors[idx]) {
        productColors[idx].active = active;
    }
}

function setDefaultColor(idx) {
    productColors.forEach((c, i) => c.default = (i === idx));
}

function updateColorFacet(idx, facet) {
    if (productColors[idx]) {
        productColors[idx].searchFacet = facet;
    }
}

function updateColorType(idx, type) {
    if (productColors[idx]) {
        productColors[idx].colorType = type;
    }
}

function addCustomColor() {
    const name = prompt('Enter color name:');
    if (name) {
        productColors.push({
            id: productColors.length,
            name: name,
            hex: getColorHex(name),
            active: true,
            default: false,
            searchFacet: getSearchFacet(name),
            colorType: getColorType(name)
        });
        document.getElementById('detailTabContent').innerHTML = renderColorsTab(currentProduct);
    }
}

/**
 * Save Functions (placeholder)
 */
function saveProductGeneral() {
    alert('Product general settings would be saved here.\n\nIn a real implementation, this would call PUT /api/products/' + currentProduct.code);
}

function saveColors() {
    console.log('Saving colors:', productColors);
    alert('Colors saved successfully!');
}

function saveViews() {
    alert('Views & Decoration Areas saved successfully!');
}

function savePricing() {
    alert('Pricing saved successfully!');
}

function saveAndContinue() {
    alert('Saved! Continuing to next section...');
}

function viewProductOnStore(event) {
    if (event) event.preventDefault();
    alert('Would open product on storefront');
}

function reportProductProblem(event) {
    if (event) event.preventDefault();
    alert('Would open problem report form');
}

/**
 * Manage Brands Modal
 */
function openManageBrandsModal(event) {
    if (event) event.preventDefault();
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'manageBrandsModal';
    modal.innerHTML = `
        <div class="modal-content brands-modal-content">
            <div class="modal-header">
                <h2>Manage Brands</h2>
                <button class="modal-close" onclick="closeBrandsModal()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="brands-list">
                    ${productBrands.slice(0, 20).map(b => `
                        <div class="brand-row">
                            <div class="brand-info">
                                <div class="brand-logo">
                                    <i class="fas fa-tag"></i>
                                </div>
                                <span>${b.brand}</span>
                            </div>
                            <div class="brand-actions">
                                <button class="btn btn-sm btn-secondary">Configure</button>
                                <button class="btn btn-sm btn-danger">Delete</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="add-brand-form">
                    <h4>Add New Brand</h4>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Brand Name</label>
                            <input type="text" placeholder="Enter brand name" id="newBrandName">
                        </div>
                        <button class="btn btn-primary" onclick="addNewBrand()">
                            <i class="fas fa-plus"></i> Add Brand
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('active'), 10);
}

function closeBrandsModal() {
    const modal = document.getElementById('manageBrandsModal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
    }
}

function addNewBrand() {
    const input = document.getElementById('newBrandName');
    const name = input?.value.trim();
    if (name) {
        productBrands.push({ brand: name, count: 0 });
        closeBrandsModal();
        document.getElementById('detailTabContent').innerHTML = renderGeneralTab(currentProduct);
        alert(`Brand "${name}" added successfully!`);
    }
}
