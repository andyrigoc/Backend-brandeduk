import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Input, Badge, Button, Avatar, Dropdown, Breadcrumb } from 'antd';
import {
  SearchOutlined,
  BellOutlined,
  QuestionCircleOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import Sidebar from '../components/Sidebar';
import brandColors from '../theme/brandColors';

const { Header, Sider, Content } = Layout;

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Generate breadcrumb items from current path
  const getBreadcrumbItems = () => {
    const pathParts = location.pathname.split('/').filter(Boolean);
    const items = [{ title: 'Dashboard', href: '/' }];
    
    let currentPath = '';
    pathParts.forEach((part, index) => {
      currentPath += `/${part}`;
      const title = part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' ');
      items.push({
        title,
        href: index === pathParts.length - 1 ? undefined : currentPath,
      });
    });
    
    return items;
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      danger: true,
    },
  ];

  return (
    <Layout className="admin-layout">
      {/* Header */}
      <Header className="admin-header" style={{ background: brandColors.headerBg }}>
        <div className="admin-logo">
          <div className="admin-logo-icon">B</div>
          <h1>BrandedUK Admin</h1>
        </div>
        
        <div className="header-search">
          <Input
            placeholder="Type to search..."
            prefix={<SearchOutlined />}
            size="middle"
          />
        </div>
        
        <div className="header-actions">
          <Badge count={4} size="small">
            <Button type="text" icon={<BellOutlined />} />
          </Badge>
          <Button type="text" icon={<QuestionCircleOutlined />} />
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Avatar 
              style={{ 
                backgroundColor: brandColors.accent, 
                cursor: 'pointer' 
              }}
              icon={<UserOutlined />}
            />
          </Dropdown>
        </div>
      </Header>

      <Layout>
        {/* Sidebar */}
        <Sider
          className="admin-sidebar"
          width={240}
          collapsedWidth={80}
          collapsed={collapsed}
          onCollapse={setCollapsed}
          collapsible
          theme="dark"
          style={{ background: brandColors.sidebarBg }}
        >
          <Sidebar collapsed={collapsed} />
        </Sider>

        {/* Main Content */}
        <Content className="admin-content" style={{ background: brandColors.background }}>
          <Breadcrumb
            className="admin-breadcrumb"
            items={getBreadcrumbItems()}
          />
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
