import React, { useState, useEffect } from 'react';
import {
  Row,
  Col,
  Card,
  Table,
  Input,
  Button,
  Space,
  Tag,
  Dropdown,
  Checkbox,
  Select,
  Image,
  Typography,
  Tabs,
  message,
} from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  DownloadOutlined,
  UploadOutlined,
  FilterOutlined,
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import brandColors from '../theme/brandColors';

const { Text, Link } = Typography;

// Mock categories data
const mockCategories = [
  { id: 'all', name: 'All', count: 8109 },
  { id: 't-shirts', name: 'T-Shirts', count: 0 },
  { id: 'best-sellers', name: 'Best Sellers', count: 74, isGroup: true },
  { id: 'unisex-t-shirts', name: 'Unisex T-Shirts', count: 54 },
  { id: 'womens', name: "Women's", count: 51 },
  { id: 'sweatshirts', name: 'Sweatshirts', count: 63 },
  { id: 'polos', name: "Polo's", count: 69 },
  { id: 'jackets', name: 'Jackets', count: 49 },
  { id: 'youth', name: 'Youth', count: 25 },
  { id: 'headwear', name: 'Headwear', count: 49 },
  { id: 'accessories', name: 'Accessories', count: 1 },
  { id: 'drinkware', name: 'Drinkware', count: 14 },
];

// Mock products data
const mockProducts = [
  {
    key: 'PC450',
    code: 'PC450',
    image: 'https://via.placeholder.com/50x50/e53e3e/ffffff?text=T',
    name: 'Fan Favorite Tee',
    supplier: 'SanMar',
    group: 'Apparel',
    blank: 4.86,
    dtf: 13.66,
    dp: null,
    emb: null,
    scr: 11.11,
  },
  {
    key: '5000',
    code: '5000',
    image: 'https://via.placeholder.com/50x50/38a169/ffffff?text=T',
    name: 'Heavy Cotton 100% Cotton T Shirt',
    supplier: 'SanMar',
    group: 'Apparel',
    blank: 4.29,
    dtf: 13.09,
    dp: null,
    emb: null,
    scr: 10.54,
  },
  {
    key: 'DM130',
    code: 'DM130',
    image: 'https://via.placeholder.com/50x50/3182ce/ffffff?text=T',
    name: 'Perfect Tri ® Tee',
    supplier: 'SanMar',
    group: 'Apparel',
    blank: 8.24,
    dtf: 17.04,
    dp: null,
    emb: null,
    scr: 14.49,
  },
  {
    key: 'NL6210',
    code: 'NL6210',
    image: 'https://via.placeholder.com/50x50/805ad5/ffffff?text=T',
    name: 'Apparel ® Unisex CVC Tee',
    supplier: 'SanMar',
    group: 'Apparel',
    blank: 6.15,
    dtf: 14.95,
    dp: null,
    emb: null,
    scr: 12.40,
  },
  {
    key: 'DT6000',
    code: 'DT6000',
    image: 'https://via.placeholder.com/50x50/d69e2e/ffffff?text=T',
    name: 'Very Important Tee ®',
    supplier: 'SanMar',
    group: 'Apparel',
    blank: 6.44,
    dtf: 13.64,
    dp: null,
    emb: null,
    scr: 12.69,
  },
  {
    key: 'NL3601',
    code: 'NL3601',
    image: 'https://via.placeholder.com/50x50/00838f/ffffff?text=T',
    name: 'Apparel ® Cotton Long Sleeve Tee',
    supplier: 'SanMar',
    group: 'Apparel',
    blank: 10.95,
    dtf: 19.75,
    dp: null,
    emb: null,
    scr: 17.20,
  },
  {
    key: 'BC3001',
    code: 'BC3001',
    image: 'https://via.placeholder.com/50x50/1a365d/ffffff?text=T',
    name: 'Unisex Jersey Short Sleeve Tee',
    supplier: 'SanMar',
    group: 'Apparel',
    blank: 7.20,
    dtf: 16.00,
    dp: null,
    emb: null,
    scr: 13.45,
  },
];

const Products = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedRows, setSelectedRows] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);

  const bulkActionItems = [
    { key: 'active', label: 'Set Active Status' },
    { key: 'inactive', label: 'Set Inactive Status' },
    { type: 'divider' },
    { key: 'delete', label: 'Delete Products', danger: true },
    { key: 'undelete', label: 'Undelete Products' },
    { type: 'divider' },
    { key: 'export-inventory', label: 'Export Inventory Levels' },
    { key: 'export-products', label: 'Export Products' },
    { type: 'divider' },
    { key: 'availability', label: 'Set Availability' },
    { key: 'categories', label: 'Modify Categories' },
    { key: 'group', label: 'Assign Product Group' },
  ];

  const handleBulkAction = ({ key }) => {
    message.info(`Action "${key}" would be applied to ${selectedRows.length} products`);
  };

  const columns = [
    {
      title: '',
      dataIndex: 'checkbox',
      key: 'checkbox',
      width: 40,
      render: (_, record) => (
        <Checkbox
          checked={selectedRows.includes(record.key)}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedRows([...selectedRows, record.key]);
            } else {
              setSelectedRows(selectedRows.filter((k) => k !== record.key));
            }
          }}
        />
      ),
    },
    {
      title: 'Image',
      dataIndex: 'image',
      key: 'image',
      width: 70,
      render: (src) => (
        <Image
          src={src}
          width={50}
          height={50}
          className="product-image"
          preview={false}
        />
      ),
    },
    {
      title: 'Code',
      dataIndex: 'code',
      key: 'code',
      width: 100,
      render: (code) => (
        <Link
          className="product-code-link"
          onClick={() => navigate(`/products/${code}`)}
        >
          {code}
        </Link>
      ),
    },
    {
      title: 'Product Name',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
    },
    {
      title: 'Supplier',
      dataIndex: 'supplier',
      key: 'supplier',
      width: 100,
    },
    {
      title: 'Product Group',
      dataIndex: 'group',
      key: 'group',
      width: 100,
    },
    {
      title: 'Blank',
      dataIndex: 'blank',
      key: 'blank',
      width: 80,
      align: 'right',
      render: (val) => val ? `£${val.toFixed(2)}` : 'N/A',
    },
    {
      title: 'DTF',
      dataIndex: 'dtf',
      key: 'dtf',
      width: 80,
      align: 'right',
      render: (val) => val ? `£${val.toFixed(2)}` : 'N/A',
    },
    {
      title: 'DP',
      dataIndex: 'dp',
      key: 'dp',
      width: 60,
      align: 'right',
      render: (val) => val ? `£${val.toFixed(2)}` : 'N/A',
    },
    {
      title: 'EMB',
      dataIndex: 'emb',
      key: 'emb',
      width: 60,
      align: 'right',
      render: (val) => val ? `£${val.toFixed(2)}` : 'N/A',
    },
    {
      title: 'SCR',
      dataIndex: 'scr',
      key: 'scr',
      width: 80,
      align: 'right',
      render: (val) => val ? `£${val.toFixed(2)}` : 'N/A',
    },
    {
      title: '',
      key: 'actions',
      width: 80,
      render: (_, record) => (
        <Link onClick={() => navigate(`/products/${record.code}`)}>
          Manage
        </Link>
      ),
    },
  ];

  const selectAllOnPage = () => {
    const allKeys = mockProducts.map((p) => p.key);
    setSelectedRows(allKeys);
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Products</h1>
        <Space>
          <Dropdown
            menu={{
              items: [
                { key: 'import-products', label: 'Import Products' },
                { key: 'import-inventory', label: 'Import Inventory Levels' },
              ],
            }}
          >
            <Button icon={<UploadOutlined />}>Import</Button>
          </Dropdown>
          <Button type="primary" icon={<PlusOutlined />}>
            Add Product
          </Button>
        </Space>
      </div>

      <Row gutter={16}>
        {/* Categories Sidebar */}
        <Col xs={24} md={6} lg={5}>
          <Card className="categories-sidebar" size="small">
            <div className="categories-header">
              <span className="categories-title">Categories</span>
              <Space size={4}>
                <Button size="small" type="link">Add</Button>
                <Button size="small" type="link">Delete</Button>
                <Button size="small" type="link">Edit</Button>
              </Space>
            </div>
            <div>
              {mockCategories.map((cat) => (
                <div
                  key={cat.id}
                  className={`category-item ${selectedCategory === cat.id ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  <span>
                    {cat.isGroup ? '⚫ ' : '○ '}
                    {cat.name}
                  </span>
                  <span className="count">({cat.count})</span>
                </div>
              ))}
            </div>
          </Card>
        </Col>

        {/* Products Table */}
        <Col xs={24} md={18} lg={19}>
          <Card size="small">
            <Tabs
              defaultActiveKey="search"
              items={[
                { key: 'search', label: 'Search' },
                { key: 'advanced', label: 'Advanced Search' },
              ]}
              style={{ marginBottom: 16 }}
            />

            <Input
              placeholder="search product codes, colors, description, name etc."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ marginBottom: 16 }}
              allowClear
            />

            {selectedRows.length > 0 && (
              <div className="bulk-actions-bar">
                <div className="bulk-actions-info">
                  <strong>{selectedRows.length} products</strong> on this page selected.{' '}
                  <Link onClick={selectAllOnPage}>
                    Select all {mockProducts.length} products
                  </Link>
                </div>
                <div className="bulk-actions-buttons">
                  <Dropdown menu={{ items: bulkActionItems, onClick: handleBulkAction }}>
                    <Button>
                      Bulk Action <DownloadOutlined />
                    </Button>
                  </Dropdown>
                  <Button type="primary">Apply Action</Button>
                </div>
              </div>
            )}

            <Table
              className="products-table"
              columns={columns}
              dataSource={mockProducts}
              loading={loading}
              pagination={{
                total: 8109,
                pageSize: 15,
                showSizeChanger: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} of ${total} products`,
              }}
              size="small"
              scroll={{ x: 1000 }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Products;
