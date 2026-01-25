/**
 * BrandedUK Admin Hub - Configuration
 */

const CONFIG = {
    // API Configuration
    API_BASE_URL: 'http://localhost:3004',
    
    // Pagination defaults
    DEFAULT_PAGE_SIZE: 15,
    PAGE_SIZE_OPTIONS: [15, 25, 50, 100],
    
    // Brand colors
    COLORS: {
        primary: '#1a365d',      // Navy blue
        primaryLight: '#2c5282',
        accent: '#00838f',       // Teal
        accentDark: '#006064',
        success: '#38a169',
        warning: '#d69e2e',
        error: '#e53e3e',
        info: '#3182ce'
    },
    
    // App info
    APP_NAME: 'BrandedUK Admin',
    VERSION: '1.0.0'
};

// Make it globally available
window.CONFIG = CONFIG;
