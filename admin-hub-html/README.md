# BrandedUK Admin Hub

A modern, responsive admin dashboard for managing the BrandedUK e-commerce platform.

![BrandedUK Admin](https://via.placeholder.com/800x400/1a365d/ffffff?text=BrandedUK+Admin+Hub)

## 🚀 Features

- **Dashboard** - Overview of orders, sales, and visitors
- **Products** - Browse and search all Ralawise products with filters
- **Categories** - View product types with counts
- **Brands** - Manage brands and view products by brand
- **Product Detail Modal** - View full product information

## 🎨 Design

- **Primary Color**: Navy Blue (#1a365d)
- **Accent Color**: Teal (#00838f)
- **Clean, modern interface** inspired by DecoNetwork

## 📁 Project Structure

```
admin-hub-html/
├── index.html          # Main HTML file
├── css/
│   ├── styles.css      # Global styles
│   ├── products.css    # Products page styles
│   ├── brands.css      # Brands page styles
│   ├── categories.css  # Categories page styles
│   └── modal.css       # Modal styles
├── js/
│   ├── config.js       # Configuration (API URL, etc.)
│   ├── api.js          # Centralized API calls
│   ├── app.js          # Main navigation
│   ├── products.js     # Products page logic
│   ├── brands.js       # Brands page logic
│   ├── categories.js   # Categories page logic
│   ├── modal.js        # Product modal
│   └── charts.js       # Dashboard charts
└── README.md
```

## ⚙️ Configuration

Edit `js/config.js` to change the API endpoint:

```javascript
const CONFIG = {
    API_BASE_URL: 'http://localhost:3004', // Your backend URL
    // ...
};
```

## 🛠️ Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/brandeduk-admin-hub.git
   ```

2. **Start the backend server**
   ```bash
   cd brandeduk-backend
   npm install
   npm start
   ```

3. **Open the admin hub**
   - Simply open `index.html` in your browser
   - Or use a local server: `npx serve .`

## 🔗 API Endpoints Used

| Endpoint | Description |
|----------|-------------|
| `GET /api/products` | List products with filters |
| `GET /api/products/:code` | Get product details |
| `GET /api/products/types` | Get product categories |
| `GET /api/products/brands` | Get all brands |

## 📱 Responsive

The admin hub is fully responsive and works on:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (< 768px)

## 🔐 Security

- CORS enabled on backend for localhost development
- No sensitive data stored in frontend
- API key configuration via environment variables

## 📄 License

MIT License - BrandedUK © 2026
