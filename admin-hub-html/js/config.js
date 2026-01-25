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
        accent: '#7C3AED',       // Purple
        accentDark: '#5B21B6',
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

// Color utilities (deterministic mapping from color description/name to a CSS color)
window.COLOR_UTILS = window.COLOR_UTILS || (() => {
    const NAMED = {
        black: '#111827',
        white: '#ffffff',
        ivory: '#fff7ed',
        cream: '#fff7ed',
        natural: '#f5f5dc',
        beige: '#f5f5dc',
        tan: '#d2b48c',
        khaki: '#c8b568',
        brown: '#8b5a2b',
        chocolate: '#5a3825',
        navy: '#1e3a5f',
        blue: '#2563eb',
        royal: '#1d4ed8',
        sky: '#38bdf8',
        carolina: '#38bdf8',
        cyan: '#06b6d4',
        teal: '#0d9488',
        turquoise: '#14b8a6',
        green: '#16a34a',
        lime: '#65a30d',
        olive: '#6b7c2a',
        yellow: '#eab308',
        gold: '#d4a017',
        orange: '#f97316',
        red: '#dc2626',
        maroon: '#7f1d1d',
        burgundy: '#7f1d1d',
        pink: '#ec4899',
        fuchsia: '#e11d48',
        purple: '#7c3aed',
        violet: '#7c3aed',
        grey: '#6b7280',
        gray: '#6b7280',
        charcoal: '#374151',
        silver: '#9ca3af',
    };

    function hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = (hash << 5) - hash + str.charCodeAt(i);
            hash |= 0;
        }
        return Math.abs(hash);
    }

    function hslToHex(h, s, l) {
        s /= 100;
        l /= 100;
        const c = (1 - Math.abs(2 * l - 1)) * s;
        const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
        const m = l - c / 2;
        let r = 0, g = 0, b = 0;
        if (0 <= h && h < 60) { r = c; g = x; b = 0; }
        else if (60 <= h && h < 120) { r = x; g = c; b = 0; }
        else if (120 <= h && h < 180) { r = 0; g = c; b = x; }
        else if (180 <= h && h < 240) { r = 0; g = x; b = c; }
        else if (240 <= h && h < 300) { r = x; g = 0; b = c; }
        else { r = c; g = 0; b = x; }
        const toHex = (n) => Math.round((n + m) * 255).toString(16).padStart(2, '0');
        return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    }

    function normalizeColorName(input) {
        return String(input || '')
            .toLowerCase()
            .replace(/\([^)]*\)/g, ' ')
            .replace(/[^a-z0-9]+/g, ' ')
            .trim();
    }

    function toHex(colorName) {
        const normalized = normalizeColorName(colorName);
        if (!normalized) return '#d1d5db';

        // Try exact token matches in order (handles 'black/black', 'dark grey', etc.)
        const tokens = normalized.split(' ').filter(Boolean);
        for (const t of tokens) {
            if (NAMED[t]) return NAMED[t];
        }

        // Try contains matches (handles 'brown check', 'heather grey', etc.)
        for (const [key, hex] of Object.entries(NAMED)) {
            if (normalized.includes(key)) return hex;
        }

        // Deterministic fallback: unique HSL based on string hash
        const hash = hashString(normalized);
        const h = hash % 360;
        const s = 55 + (hash % 25); // 55-79
        const l = 45 + (hash % 10); // 45-54
        return hslToHex(h, s, l);
    }

    function toCss(colorName) {
        return toHex(colorName);
    }

    return { toHex, toCss };
})();
