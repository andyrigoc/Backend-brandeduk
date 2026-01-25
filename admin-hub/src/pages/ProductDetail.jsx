import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Row,
  Col,
  Card,
  Image,
  Menu,
  Table,
  Input,
  Button,
  Space,
  Tag,
  Checkbox,
  Descriptions,
  Divider,
  Typography,
  InputNumber,
  Switch,
} from 'antd';
import {
  ArrowLeftOutlined,
  SaveOutlined,
  EditOutlined,
} from '@ant-design/icons';
import brandColors from '../theme/brandColors';

const { Title, Text } = Typography;

// Mock product detail data
const mockProductDetail = {
  code: 'PC450',
  name: 'Fan Favorite Tee',
  brand: 'Port & Company',
  productType: 'T-Shirts',
  gender: 'Unisex',
  ageGroup: 'Adult',
  fabricDescription: '100% ring spun combed cotton, 4.5 oz',
  specification: 'Classic fit, Shoulder-to-shoulder taping, Cover-seamed front neck, Double-needle hem',
  skuCount: 378,
  image: 'https://via.placeholder.com/300x350/e53e3e/ffffff?text=Fan+Favorite+Tee',
};

const mockSkuData = [
  { key: 1, color: 'Athletic Heather', size: 'Small', skuCode: '1083262', gtin: '00191265222256', inventory: 4500, stock: false, location: '', lowWarning: '', reorder: '' },
  { key: 2, color: 'Athletic Heather', size: 'Medium', skuCode: '1083263', gtin: '00191265222258', inventory: 4500, stock: true, location: '', inventoryOnHand: 0, lowWarning: 4, reorder: 20 },
  { key: 3, color: 'Athletic Heather', size: 'Large', skuCode: '1083264', gtin: '00191265222259', inventory: 4500, stock: true, location: '', inventoryOnHand: 0, lowWarning: 4, reorder: 20 },
  { key: 4, color: 'Athletic Heather', size: 'X Large', skuCode: '1083265', gtin: '00191265222262', inventory: 4500, stock: false, location: '', lowWarning: '', reorder: '' },
  { key: 5, color: 'Athletic Heather', size: '2X Large', skuCode: '1083271', gtin: '00191265222254', inventory: 99, stock: false, location: '', lowWarning: '', reorder: '' },
  { key: 6, color: 'Athletic Heather', size: '3X Large', skuCode: '1083282', gtin: '00191265222255', inventory: 3802, stock: false, location: '', lowWarning: '', reorder: '' },
  { key: 7, color: 'Athletic Heather', size: '4X Large', skuCode: '1083293', gtin: '00191265222257', inventory: 3802, stock: false, location: '', lowWarning: '', reorder: '' },
];

const ProductDetail = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('sku-inventory');
  const [enableInventory, setEnableInventory] = useState(true);
  const [closingOut, setClosingOut] = useState(false);

  const product = mockProductDetail;

  const menuItems = [
    { key: 'general', label: 'General' },
    { key: 'colors', label: 'Colors' },
    { key: 'views-decoration', label: 'Views & Decoration Areas' },
    { key: 'pricing', label: 'Pricing' },
    { key: 'taxes', label: 'Taxes' },
    { key: 'min-quantities', label: 'Minimum Quantities & Bundles' },
    { key: 'sizing', label: 'Sizing' },
    { key: 'shipping', label: 'Shipping Dimensions & Weights' },
    { key: 'production', label: 'Production' },
    { key: 'supplier', label: 'Supplier & Purchasing' },
    { key: 'sku-inventory', label: 'SKU, GTIN, Inventory' },
    { key: 'categories', label: 'Categories' },
    { key: 'images', label: 'Images' },
    { key: 'specifications', label: 'Product Specification' },
    { key: 'meta', label: 'Meta Information' },
    { key: 'related', label: 'Related Products' },
    { key: 'availability', label: 'Availability' },
    { key: 'custom-fields', label: 'Custom Fields' },
    { key: 'decorated', label: 'Decorated Products' },
  ];

  const skuColumns = [
    {
      title: 'Color',
      dataIndex: 'color',
      key: 'color',
      width: 120,
      render: (color) => (
        <Space>
          <div 
            style={{ 
              width: 16, 
              height: 16, 
              background: '#a0aec0', 
              borderRadius: 2 
            }} 
          />
          {color}
        </Space>
      ),
    },
    {
      title: 'Size',
      dataIndex: 'size',
      key: 'size',
      width: 80,
    },
    {
      title: 'Sub Size',
      dataIndex: 'subSize',
      key: 'subSize',
      width: 70,
    },
    {
      title: 'SKU Code',
      dataIndex: 'skuCode',
      key: 'skuCode',
      width: 100,
    },
    {
      title: 'GTIN',
      dataIndex: 'gtin',
      key: 'gtin',
      width: 140,
    },
    {
      title: 'SanMar Inventory',
      dataIndex: 'inventory',
      key: 'inventory',
      width: 100,
      align: 'right',
    },
    {
      title: 'Stock Item?',
      dataIndex: 'stock',
      key: 'stock',
      width: 80,
      align: 'center',
      render: (val, record) => (
        <Checkbox checked={val} />
      ),
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
      width: 100,
      render: (val) => <Input size="small" value={val} style={{ width: 80 }} />,
    },
    {
      title: 'Inventory On Hand',
      dataIndex: 'inventoryOnHand',
      key: 'inventoryOnHand',
      width: 80,
      render: (val) => <InputNumber size="small" value={val} style={{ width: 60 }} />,
    },
    {
      title: 'New Inventory Level',
      dataIndex: 'newInventory',
      key: 'newInventory',
      width: 80,
      render: () => <InputNumber size="small" style={{ width: 60 }} />,
    },
    {
      title: 'Low Stock Warning',
      dataIndex: 'lowWarning',
      key: 'lowWarning',
      width: 80,
      render: (val) => <InputNumber size="small" value={val} style={{ width: 60 }} />,
    },
    {
      title: 'Reorder To Level',
      dataIndex: 'reorder',
      key: 'reorder',
      width: 80,
      render: (val) => <InputNumber size="small" value={val} style={{ width: 60 }} />,
    },
  ];

  return (
    <div>
      <div className="page-header">
        <Space>
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate('/products')}
          />
          <h1 className="page-title">
            Products / Products / {code}
          </h1>
        </Space>
        <Button type="link">View Audit Log</Button>
      </div>

      <Row gutter={16}>
        {/* Product Image & Info */}
        <Col xs={24} md={6}>
          <Card size="small" style={{ textAlign: 'center', marginBottom: 16 }}>
            <Image
              src={product.image}
              alt={product.name}
              style={{ maxWidth: '100%', maxHeight: 200 }}
              preview={false}
            />
            <Title level={5} style={{ marginTop: 12, marginBottom: 0 }}>
              {product.name}
            </Title>
          </Card>

          {/* Vertical Navigation Menu */}
          <Card size="small" bodyStyle={{ padding: 0 }}>
            <Menu
              mode="inline"
              selectedKeys={[activeSection]}
              onClick={({ key }) => setActiveSection(key)}
              items={menuItems}
              style={{ border: 'none' }}
            />
          </Card>
        </Col>

        {/* Content Area */}
        <Col xs={24} md={18}>
          <Card 
            title="SKU Item Information"
            extra={<Text type="secondary">Manage size/color combinations.</Text>}
          >
            <Title level={5}>SKU Table</Title>
            <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
              Manage the SKU codes, GTIN codes and inventory levels for each color and size combination.
            </Text>
            <Text style={{ marginBottom: 16, display: 'block' }}>
              Number of SKU items: <strong>{product.skuCount}</strong>
            </Text>

            <Space direction="vertical" style={{ marginBottom: 16 }}>
              <Checkbox 
                checked={enableInventory} 
                onChange={(e) => setEnableInventory(e.target.checked)}
              >
                Enable inventory on hand for this product
              </Checkbox>
              <Checkbox 
                checked={closingOut} 
                onChange={(e) => setClosingOut(e.target.checked)}
              >
                Closing Out
              </Checkbox>
            </Space>

            <Table
              columns={skuColumns}
              dataSource={mockSkuData}
              size="small"
              scroll={{ x: 1200 }}
              pagination={false}
            />

            <Divider />

            <Space>
              <Button type="primary" icon={<SaveOutlined />}>
                Save Changes
              </Button>
              <Button>Cancel</Button>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ProductDetail;
