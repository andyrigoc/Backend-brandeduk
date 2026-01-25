// BrandedUK Admin Hub - Brand Colors & Theme Configuration
// Professional color palette for admin interface

export const brandColors = {
  // Primary Brand Colors
  primary: '#1a365d',      // Deep Navy Blue - main brand color
  primaryLight: '#2c5282', // Lighter navy for hover states
  primaryDark: '#1a202c',  // Darker navy for headers
  
  // Accent Colors
  accent: '#00838f',       // Teal - for highlights and CTAs
  accentLight: '#4fb3bf',  // Light teal for secondary actions
  accentDark: '#005662',   // Dark teal for active states
  
  // Sidebar Colors (Dark Theme)
  sidebarBg: '#1a202c',         // Dark background
  sidebarHover: '#2d3748',      // Hover state
  sidebarActive: '#00838f',     // Active menu item (teal accent)
  sidebarText: '#a0aec0',       // Muted text
  sidebarTextActive: '#ffffff', // Active/hover text
  
  // Header Colors
  headerBg: '#1a365d',          // Navy header
  headerText: '#ffffff',        // White text
  
  // Status Colors
  success: '#38a169',     // Green
  warning: '#d69e2e',     // Amber
  error: '#e53e3e',       // Red
  info: '#3182ce',        // Blue
  
  // Neutral Colors
  background: '#f7fafc',  // Light gray background
  surface: '#ffffff',     // White cards/panels
  border: '#e2e8f0',      // Border color
  textPrimary: '#1a202c', // Main text
  textSecondary: '#718096', // Secondary text
  textMuted: '#a0aec0',   // Muted text
  
  // Table Colors
  tableHeader: '#f7fafc',
  tableRowHover: '#edf2f7',
  tableRowSelected: '#e6fffa',
};

// Ant Design Theme Token Override
export const antTheme = {
  token: {
    colorPrimary: brandColors.primary,
    colorLink: brandColors.accent,
    colorSuccess: brandColors.success,
    colorWarning: brandColors.warning,
    colorError: brandColors.error,
    colorInfo: brandColors.info,
    colorBgContainer: brandColors.surface,
    colorBgLayout: brandColors.background,
    borderRadius: 6,
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  },
  components: {
    Layout: {
      headerBg: brandColors.headerBg,
      siderBg: brandColors.sidebarBg,
      bodyBg: brandColors.background,
    },
    Menu: {
      darkItemBg: brandColors.sidebarBg,
      darkItemColor: brandColors.sidebarText,
      darkItemHoverBg: brandColors.sidebarHover,
      darkItemSelectedBg: brandColors.sidebarActive,
      darkItemSelectedColor: brandColors.sidebarTextActive,
    },
    Table: {
      headerBg: brandColors.tableHeader,
      rowHoverBg: brandColors.tableRowHover,
      rowSelectedBg: brandColors.tableRowSelected,
    },
    Card: {
      borderRadiusLG: 8,
    },
  },
};

export default brandColors;
