/**
 * BrandedUK Admin Hub - API Service
 * Centralized API calls with error handling
 */

const API = {
    baseUrl: CONFIG?.API_BASE_URL || 'http://localhost:3004',
    
    /**
     * Generic fetch with error handling
     */
    async fetch(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        
        try {
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });
            
            if (!response.ok) {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error(`[API] ${endpoint} failed:`, error);
            throw error;
        }
    },
    
    // ============ PRODUCTS ============
    
    async getProducts(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.fetch(`/api/products?${queryString}`);
    },
    
    async getProduct(code) {
        return this.fetch(`/api/products/${code}`);
    },
    
    async getProductPricing(code) {
        return this.fetch(`/api/products/${code}/pricing`);
    },
    
    async getRelatedProducts(code, limit = 12) {
        return this.fetch(`/api/products/${code}/related?limit=${limit}`);
    },
    
    // ============ PRODUCT TYPES (Categories) ============
    
    async getProductTypes() {
        return this.fetch('/api/products/types');
    },
    
    // ============ BRANDS ============
    
    async getBrands() {
        return this.fetch('/api/products/brands');
    },
    
    // ============ FILTERS ============
    
    async getFilters() {
        return this.fetch('/api/products/filters');
    },
    
    async getGenders() {
        return this.fetch('/api/filters/genders');
    },
    
    async getAgeGroups() {
        return this.fetch('/api/filters/age-groups');
    },
    
    async getFabrics() {
        return this.fetch('/api/filters/fabrics');
    },
    
    async getFeatures() {
        return this.fetch('/api/filters/features');
    },
    
    // ============ QUOTES ============
    
    async getQuotes(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.fetch(`/api/quotes?${queryString}`);
    },
    
    async getQuote(id) {
        return this.fetch(`/api/quotes/${id}`);
    },
    
    // ============ STATS (for Dashboard) ============
    
    async getDashboardStats() {
        // Fetch multiple endpoints in parallel for dashboard
        const [products, brands, types] = await Promise.all([
            this.getProducts({ limit: 1 }).catch(() => ({ total: 0 })),
            this.getBrands().catch(() => ({ brandCount: 0 })),
            this.getProductTypes().catch(() => ({ total: 0, productTypes: [] }))
        ]);
        
        return {
            totalProducts: products.total || 0,
            totalBrands: brands.brandCount || 0,
            totalCategories: types.productTypes?.length || 0
        };
    }
};

// Make it globally available
window.API = API;
