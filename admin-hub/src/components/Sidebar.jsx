import React from 'react';
import { Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  ShoppingOutlined,
  AppstoreOutlined,
  TagsOutlined,
  FileTextOutlined,
  SettingOutlined,
  BarChartOutlined,
  UserOutlined,
  DollarOutlined,
  TeamOutlined,
  PictureOutlined,
  PrinterOutlined,
  ShopOutlined,
} from '@ant-design/icons';

const Sidebar = ({ collapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      type: 'divider',
    },
    {
      key: 'products-section',
      type: 'group',
      label: !collapsed ? 'PRODUCTS' : null,
      children: [
        {
          key: '/products',
          icon: <ShoppingOutlined />,
          label: 'Products',
        },
        {
          key: '/categories',
          icon: <AppstoreOutlined />,
          label: 'Categories',
        },
        {
          key: '/brands',
          icon: <TagsOutlined />,
          label: 'Brands',
        },
        {
          key: '/product-groups',
          icon: <ShopOutlined />,
          label: 'Product Groups',
        },
      ],
    },
    {
      key: 'pricing-section',
      type: 'group',
      label: !collapsed ? 'PRICING' : null,
      children: [
        {
          key: '/pricing-rules',
          icon: <DollarOutlined />,
          label: 'Pricing Rules',
        },
        {
          key: '/decoration',
          icon: <PrinterOutlined />,
          label: 'Decoration Processes',
          children: [
            {
              key: '/decoration/dtf',
              label: 'Full Color Printing (DTF)',
            },
            {
              key: '/decoration/digital',
              label: 'Digital Printing',
            },
            {
              key: '/decoration/embroidery',
              label: 'Embroidery',
            },
            {
              key: '/decoration/screen',
              label: 'Screen Printing',
            },
          ],
        },
      ],
    },
    {
      key: 'sales-section',
      type: 'group',
      label: !collapsed ? 'SALES & SERVICE' : null,
      children: [
        {
          key: '/quotes',
          icon: <FileTextOutlined />,
          label: 'Quotes',
        },
        {
          key: '/customers',
          icon: <TeamOutlined />,
          label: 'Customers',
        },
      ],
    },
    {
      key: 'system-section',
      type: 'group',
      label: !collapsed ? 'SYSTEM' : null,
      children: [
        {
          key: '/stock-designs',
          icon: <PictureOutlined />,
          label: 'Stock Designs',
        },
        {
          key: '/reports',
          icon: <BarChartOutlined />,
          label: 'Reports',
        },
        {
          key: '/settings',
          icon: <SettingOutlined />,
          label: 'Settings',
        },
        {
          key: '/account',
          icon: <UserOutlined />,
          label: 'Account',
        },
      ],
    },
  ];

  const handleMenuClick = ({ key }) => {
    if (key && !key.includes('-section')) {
      navigate(key);
    }
  };

  // Get selected key based on current path
  const getSelectedKey = () => {
    const path = location.pathname;
    if (path === '/') return '/';
    
    // Find matching menu item
    const findKey = (items) => {
      for (const item of items) {
        if (item.key === path) return item.key;
        if (item.children) {
          const childKey = findKey(item.children);
          if (childKey) return childKey;
        }
      }
      return null;
    };
    
    return findKey(menuItems) || path;
  };

  // Get open keys for submenus
  const getOpenKeys = () => {
    const path = location.pathname;
    if (path.startsWith('/decoration')) return ['/decoration'];
    return [];
  };

  return (
    <Menu
      theme="dark"
      mode="inline"
      selectedKeys={[getSelectedKey()]}
      defaultOpenKeys={collapsed ? [] : getOpenKeys()}
      items={menuItems}
      onClick={handleMenuClick}
      style={{ borderRight: 0 }}
    />
  );
};

export default Sidebar;
