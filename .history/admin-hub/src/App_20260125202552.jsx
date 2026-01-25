import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { antTheme } from './theme/brandColors';
import AdminLayout from './layouts/AdminLayout';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import ComingSoon from './pages/ComingSoon';
import './styles/global.css';

const App = () => {
  return (
    <ConfigProvider theme={antTheme}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AdminLayout />}>
            {/* Dashboard */}
            <Route index element={<Dashboard />} />
            
            {/* Products */}
            <Route path="products" element={<Products />} />
            <Route path="products/:code" element={<ProductDetail />} />
            
            {/* Categories */}
            <Route 
              path="categories" 
              element={
                <ComingSoon 
                  title="Categories" 
                  description="Manage product categories and hierarchy."
                />
              } 
            />
            
            {/* Brands */}
            <Route 
              path="brands" 
              element={
                <ComingSoon 
                  title="Brands" 
                  description="Manage product brands and suppliers."
                />
              } 
            />
            
            {/* Product Groups */}
            <Route 
              path="product-groups" 
              element={
                <ComingSoon 
                  title="Product Groups" 
                  description="Manage Best Sellers, Specials, and custom product groups."
                />
              } 
            />
            
            {/* Pricing Rules */}
            <Route 
              path="pricing-rules" 
              element={
                <ComingSoon 
                  title="Pricing Rules" 
                  description="Configure markup tiers and pricing strategies."
                />
              } 
            />
            
            {/* Decoration Processes */}
            <Route path="decoration">
              <Route 
                index 
                element={
                  <ComingSoon 
                    title="Decoration Processes" 
                    description="Configure DTF, Embroidery, Screen Printing and more."
                  />
                } 
              />
              <Route 
                path="dtf" 
                element={
                  <ComingSoon 
                    title="Full Color Printing (DTF)" 
                    description="Configure DTF printing options and pricing."
                  />
                } 
              />
              <Route 
                path="digital" 
                element={
                  <ComingSoon 
                    title="Digital Printing" 
                    description="Configure digital printing options."
                  />
                } 
              />
              <Route 
                path="embroidery" 
                element={
                  <ComingSoon 
                    title="Embroidery" 
                    description="Configure embroidery options and stitch pricing."
                  />
                } 
              />
              <Route 
                path="screen" 
                element={
                  <ComingSoon 
                    title="Screen Printing" 
                    description="Configure screen printing options."
                  />
                } 
              />
            </Route>
            
            {/* Quotes */}
            <Route 
              path="quotes" 
              element={
                <ComingSoon 
                  title="Quotes" 
                  description="View and manage customer quote requests."
                />
              } 
            />
            
            {/* Customers */}
            <Route 
              path="customers" 
              element={
                <ComingSoon 
                  title="Customers" 
                  description="Manage customer accounts and contacts."
                />
              } 
            />
            
            {/* Stock Designs */}
            <Route 
              path="stock-designs" 
              element={
                <ComingSoon 
                  title="Stock Designs" 
                  description="Manage pre-made design templates."
                />
              } 
            />
            
            {/* Reports */}
            <Route 
              path="reports" 
              element={
                <ComingSoon 
                  title="Reports" 
                  description="View sales, inventory and performance reports."
                />
              } 
            />
            
            {/* Settings */}
            <Route 
              path="settings" 
              element={
                <ComingSoon 
                  title="Settings" 
                  description="Configure system settings and preferences."
                />
              } 
            />
            
            {/* Account */}
            <Route 
              path="account" 
              element={
                <ComingSoon 
                  title="Account" 
                  description="Manage your account settings."
                />
              } 
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
};

export default App;
