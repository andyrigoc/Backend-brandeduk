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
    const decorationMenu = document.getElementById('decoration-menu');
    const decorationSubmenu = document.getElementById('decoration-submenu');

    // Toggle sidebar collapse
    sidebarToggle.addEventListener('click', function() {
        sidebar.classList.toggle('collapsed');
        
        // Close submenu when collapsing
        if (sidebar.classList.contains('collapsed')) {
            decorationMenu.classList.remove('open');
            decorationSubmenu.classList.remove('open');
        }
    });

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
        '24h': { orders: 2, quotes: 0, sales: '£160', visitors: 5 },
        'week': { orders: 3, quotes: 0, sales: '£851', visitors: 104 },
        'month': { orders: 6, quotes: 0, sales: '£928', visitors: 413 },
        'year': { orders: 36, quotes: 6, sales: '£34,584', visitors: 7070 },
        'all': { orders: 52, quotes: 10, sales: '£45,411', visitors: 9767 }
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
