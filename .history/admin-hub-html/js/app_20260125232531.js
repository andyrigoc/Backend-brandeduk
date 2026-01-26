/**
 * BrandedUK Admin Hub - Main Application Script
 */

document.addEventListener('DOMContentLoaded', function() {
    initSidebar();
    initNavigation();
    initPeriodSelector();
    initDropdowns();
});

/**
 * Sidebar Toggle & Submenu
 */
function initSidebar() {
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const productsMenu = document.getElementById('products-menu');
    const productsSubmenu = document.getElementById('products-submenu');
    const decorationMenu = document.getElementById('decoration-menu');
    const decorationSubmenu = document.getElementById('decoration-submenu');

    // Toggle sidebar collapse
    sidebarToggle.addEventListener('click', function() {
        sidebar.classList.toggle('collapsed');
        
        // Close submenu when collapsing
        if (sidebar.classList.contains('collapsed')) {
            if (productsMenu) productsMenu.classList.remove('open');
            if (productsSubmenu) productsSubmenu.classList.remove('open');
            decorationMenu.classList.remove('open');
            decorationSubmenu.classList.remove('open');
        }
    });

    // Products submenu toggle
    if (productsMenu && productsSubmenu) {
        productsMenu.addEventListener('click', function(e) {
            e.preventDefault();
            if (!sidebar.classList.contains('collapsed')) {
                this.classList.toggle('open');
                productsSubmenu.classList.toggle('open');
            }
        });
    }

    // Decoration submenu toggle
    decorationMenu.addEventListener('click', function(e) {
        e.preventDefault();
        if (!sidebar.classList.contains('collapsed')) {
            this.classList.toggle('open');
            decorationSubmenu.classList.toggle('open');
        }
    });
}

/**
 * Page Navigation
 */
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item[data-page]');
    const pages = document.querySelectorAll('.page');

    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const pageId = this.getAttribute('data-page');
            
            // Update active nav item
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
            
            // Show corresponding page
            pages.forEach(page => page.classList.remove('active'));
            const targetPage = document.getElementById('page-' + pageId);
            if (targetPage) {
                targetPage.classList.add('active');
                
                // Initialize page-specific content
                if (pageId === 'products') {
                    initProductsPage();
                } else if (pageId === 'brands') {
                    initBrandsPage();
                } else if (pageId === 'categories') {
                    initCategoriesPage();
                } else if (pageId === 'dashboard') {
                    initDashboard();
                } else if (pageId === 'suppliers-in-use') {
                    if (typeof initSuppliersInUsePage === 'function') initSuppliersInUsePage();
                } else if (pageId === 'supplier-markup') {
                    if (typeof initSupplierMarkupPage === 'function') initSupplierMarkupPage();
                } else if (pageId === 'decoration-areas') {
                    if (typeof initDecorationAreasPage === 'function') initDecorationAreasPage();
                }
            }
            
            // Update breadcrumb
            updateBreadcrumb(pageId);
        });
    });
}

/**
 * Update Breadcrumb
 */
function updateBreadcrumb(pageId) {
    const breadcrumb = document.querySelector('.breadcrumb');
    const pageTitle = document.querySelector('.page-title');
    
    const titles = {
        'dashboard': 'Dashboard',
        'products': 'Products',
        'suppliers-in-use': 'Suppliers In Use',
        'supplier-markup': 'Supplier Product Markup',
        'supplier-account-details': 'Supplier Account Details',
        'decoration-areas': 'Decoration Areas',
        'volume-discounts': 'Volume Discounts',
        'sizes': 'Sizes',
        'custom-fields': 'Custom Fields',
        'bulk-product-display': 'Bulk Product Display',
        'inventory-settings': 'Inventory Settings',
        'categories': 'Categories',
        'brands': 'Brands',
        'product-groups': 'Product Groups',
        'pricing-rules': 'Pricing Rules',
        'quotes': 'Quotes',
        'customers': 'Customers',
        'reports': 'Reports',
        'settings': 'Settings'
    };
    
    const title = titles[pageId] || pageId.charAt(0).toUpperCase() + pageId.slice(1);
    
    if (breadcrumb) {
        breadcrumb.innerHTML = `<a href="#">Dashboard</a> / ${title}`;
    }
    if (pageTitle) {
        pageTitle.textContent = title;
    }
}

/**
 * Period Selector
 */
function initPeriodSelector() {
    const periodBtns = document.querySelectorAll('.period-btn');
    
    const statsData = {
        '24h': { orders: 12, quotes: 3, sales: '£1,840', visitors: 156 },
        'week': { orders: 78, quotes: 24, sales: '£12,450', visitors: 2340 },
        'month': { orders: 342, quotes: 98, sales: '£54,280', visitors: 12450 },
        'year': { orders: 4256, quotes: 1245, sales: '£678,450', visitors: 145670 },
        'all': { orders: 18432, quotes: 5678, sales: '£2,945,670', visitors: 678234 }
    };

    periodBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            periodBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const period = this.getAttribute('data-period');
            const data = statsData[period];
            
            // Update stat cards
            document.getElementById('stat-orders').textContent = data.orders;
            document.getElementById('stat-quotes').textContent = data.quotes;
            document.getElementById('stat-sales').textContent = data.sales;
            document.getElementById('stat-visitors').textContent = data.visitors.toLocaleString();
            
            // Update table highlight
            updateTableHighlight(period);
        });
    });
}

/**
 * Update Table Highlight
 */
function updateTableHighlight(period) {
    const tables = document.querySelectorAll('.stats-table');
    const columnMap = {
        '24h': 1,
        'week': 2,
        'month': 3,
        'year': 4,
        'all': 5
    };
    
    tables.forEach(table => {
        const cells = table.querySelectorAll('th, td');
        cells.forEach(cell => cell.classList.remove('highlight'));
        
        const colIndex = columnMap[period];
        const rows = table.querySelectorAll('tr');
        rows.forEach(row => {
            const cellsInRow = row.querySelectorAll('th, td');
            if (cellsInRow[colIndex]) {
                cellsInRow[colIndex].classList.add('highlight');
            }
        });
    });
}

/**
 * Dropdown Menus
 */
function initDropdowns() {
    document.addEventListener('click', function(e) {
        const dropdowns = document.querySelectorAll('.dropdown-menu.open');
        dropdowns.forEach(dropdown => {
            if (!dropdown.closest('.dropdown').contains(e.target)) {
                dropdown.classList.remove('open');
            }
        });
    });
}

function toggleDropdown(btn) {
    const dropdown = btn.closest('.dropdown');
    const menu = dropdown.querySelector('.dropdown-menu');
    
    // Close other dropdowns
    document.querySelectorAll('.dropdown-menu.open').forEach(m => {
        if (m !== menu) m.classList.remove('open');
    });
    
    menu.classList.toggle('open');
}

/**
 * Navigate to a page programmatically
 */
function navigateTo(pageId) {
    const navItem = document.querySelector(`.nav-item[data-page="${pageId}"]`);
    if (navItem) {
        navItem.click();
    }
}

/**
 * Initialize Dashboard with real data
 */
async function initDashboard() {
    try {
        const stats = await API.getDashboardStats();
        
        // Update stats if elements exist
        const productsEl = document.getElementById('stat-products');
        const brandsEl = document.getElementById('stat-brands');
        const categoriesEl = document.getElementById('stat-categories');
        
        if (productsEl) productsEl.textContent = stats.totalProducts.toLocaleString();
        if (brandsEl) brandsEl.textContent = stats.totalBrands.toLocaleString();
        if (categoriesEl) categoriesEl.textContent = stats.totalCategories.toLocaleString();
        
    } catch (error) {
        console.log('Dashboard stats not available:', error.message);
    }
}

/**
 * Show Toast Notification
 */
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
