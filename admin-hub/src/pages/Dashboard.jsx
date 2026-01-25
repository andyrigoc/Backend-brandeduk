import React, { useState } from 'react';
import { Row, Col, Card, Table, Button, Segmented, Statistic } from 'antd';
import {
  ShoppingCartOutlined,
  FileTextOutlined,
  DollarOutlined,
  PercentageOutlined,
  UserOutlined,
  EyeOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from '@ant-design/icons';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import brandColors from '../theme/brandColors';

// Demo data for dashboard
const mockStatsData = {
  '24h': { orders: 2, quotes: 0, sales: 160, commission: 0, visitors: 5, visits: 59 },
  'week': { orders: 3, quotes: 0, sales: 851, commission: 0, visitors: 104, visits: 468 },
  'month': { orders: 6, quotes: 0, sales: 928, commission: 4, visitors: 413, visits: 2036 },
  'year': { orders: 36, quotes: 6, sales: 34584, commission: 356, visitors: 7070, visits: 22253 },
  'all': { orders: 52, quotes: 10, sales: 45411, commission: 361, visitors: 9767, visits: 27343 },
};

const chartData = [
  { date: '23 Sep', orders: 0, visitors: 5 },
  { date: '24 Sep', orders: 0, visitors: 8 },
  { date: '25 Sep', orders: 1, visitors: 12 },
  { date: '26 Sep', orders: 0, visitors: 15 },
  { date: '27 Sep', orders: 0, visitors: 10 },
  { date: '28 Sep', orders: 0, visitors: 18 },
  { date: '29 Sep', orders: 1, visitors: 22 },
  { date: '30 Sep', orders: 0, visitors: 14 },
  { date: '1 Oct', orders: 2, visitors: 28 },
  { date: '2 Oct', orders: 0, visitors: 20 },
  { date: '3 Oct', orders: 0, visitors: 15 },
  { date: '4 Oct', orders: 0, visitors: 12 },
  { date: '5 Oct', orders: 1, visitors: 35 },
  { date: '6 Oct', orders: 0, visitors: 18 },
  { date: '7 Oct', orders: 0, visitors: 14 },
  { date: '8 Oct', orders: 0, visitors: 22 },
  { date: '9 Oct', orders: 0, visitors: 16 },
  { date: '10 Oct', orders: 0, visitors: 12 },
  { date: '11 Oct', orders: 1, visitors: 38 },
  { date: '12 Oct', orders: 0, visitors: 20 },
  { date: '13 Oct', orders: 0, visitors: 15 },
  { date: '14 Oct', orders: 0, visitors: 18 },
  { date: '15 Oct', orders: 0, visitors: 25 },
  { date: '16 Oct', orders: 0, visitors: 30 },
  { date: '17 Oct', orders: 1, visitors: 42 },
  { date: '18 Oct', orders: 0, visitors: 28 },
  { date: '19 Oct', orders: 0, visitors: 22 },
  { date: '20 Oct', orders: 0, visitors: 35 },
  { date: '21 Oct', orders: 2, visitors: 55 },
  { date: '22 Oct', orders: 0, visitors: 45 },
];

const Dashboard = () => {
  const [period, setPeriod] = useState('month');
  const [chartType, setChartType] = useState('Orders');

  const stats = mockStatsData[period];

  const periodOptions = [
    { label: 'Past 24 Hours', value: '24h' },
    { label: 'Past Week', value: 'week' },
    { label: 'Past Month', value: 'month' },
    { label: 'Past Year', value: 'year' },
    { label: 'All Time', value: 'all' },
  ];

  // Table columns for stats overview
  const statsColumns = [
    {
      title: '',
      dataIndex: 'metric',
      key: 'metric',
      width: 120,
    },
    {
      title: 'Past 24 Hours',
      dataIndex: '24h',
      key: '24h',
      align: 'center',
    },
    {
      title: 'Past Week',
      dataIndex: 'week',
      key: 'week',
      align: 'center',
    },
    {
      title: 'Past Month',
      dataIndex: 'month',
      key: 'month',
      align: 'center',
      className: 'stats-table-highlight',
    },
    {
      title: 'Past Year',
      dataIndex: 'year',
      key: 'year',
      align: 'center',
    },
    {
      title: 'All Time',
      dataIndex: 'all',
      key: 'all',
      align: 'center',
    },
  ];

  const ordersTableData = [
    {
      key: 'orders',
      metric: 'Orders',
      '24h': mockStatsData['24h'].orders,
      'week': mockStatsData['week'].orders,
      'month': mockStatsData['month'].orders,
      'year': mockStatsData['year'].orders,
      'all': mockStatsData['all'].orders,
    },
    {
      key: 'quotes',
      metric: 'Quotes',
      '24h': mockStatsData['24h'].quotes,
      'week': mockStatsData['week'].quotes,
      'month': mockStatsData['month'].quotes,
      'year': mockStatsData['year'].quotes,
      'all': mockStatsData['all'].quotes,
    },
    {
      key: 'sales',
      metric: 'Sales',
      '24h': `£${mockStatsData['24h'].sales.toLocaleString()}`,
      'week': `£${mockStatsData['week'].sales.toLocaleString()}`,
      'month': `£${mockStatsData['month'].sales.toLocaleString()}`,
      'year': `£${mockStatsData['year'].sales.toLocaleString()}`,
      'all': `£${mockStatsData['all'].sales.toLocaleString()}`,
    },
    {
      key: 'commission',
      metric: 'Commission',
      '24h': `£${mockStatsData['24h'].commission}`,
      'week': `£${mockStatsData['week'].commission}`,
      'month': `£${mockStatsData['month'].commission}`,
      'year': `£${mockStatsData['year'].commission}`,
      'all': `£${mockStatsData['all'].commission}`,
    },
  ];

  const visitorsTableData = [
    {
      key: 'visitors',
      metric: 'Visitors',
      '24h': mockStatsData['24h'].visitors,
      'week': mockStatsData['week'].visitors,
      'month': mockStatsData['month'].visitors,
      'year': mockStatsData['year'].visitors,
      'all': mockStatsData['all'].visitors,
    },
    {
      key: 'visits',
      metric: 'Visits',
      '24h': mockStatsData['24h'].visits,
      'week': mockStatsData['week'].visits,
      'month': mockStatsData['month'].visits,
      'year': mockStatsData['year'].visits,
      'all': mockStatsData['all'].visits,
    },
  ];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <Segmented
          options={periodOptions}
          value={period}
          onChange={setPeriod}
        />
      </div>

      {/* Quick Stats Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stats-card">
            <Statistic
              title="Total Orders"
              value={stats.orders}
              prefix={<ShoppingCartOutlined style={{ color: brandColors.accent }} />}
              valueStyle={{ color: brandColors.primaryDark }}
            />
            <div className="stats-card-change positive">
              <ArrowUpOutlined /> 12% from last period
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stats-card">
            <Statistic
              title="Quotes"
              value={stats.quotes}
              prefix={<FileTextOutlined style={{ color: brandColors.info }} />}
              valueStyle={{ color: brandColors.primaryDark }}
            />
            <div className="stats-card-change positive">
              <ArrowUpOutlined /> 5% from last period
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stats-card">
            <Statistic
              title="Total Sales"
              value={stats.sales}
              prefix="£"
              valueStyle={{ color: brandColors.success }}
            />
            <div className="stats-card-change positive">
              <ArrowUpOutlined /> 18% from last period
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stats-card">
            <Statistic
              title="Visitors"
              value={stats.visitors}
              prefix={<EyeOutlined style={{ color: brandColors.warning }} />}
              valueStyle={{ color: brandColors.primaryDark }}
            />
            <div className="stats-card-change negative">
              <ArrowDownOutlined /> 3% from last period
            </div>
          </Card>
        </Col>
      </Row>

      {/* Orders & Sales Table */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={14}>
          <Card 
            title="Orders & Sales Overview" 
            className="stats-table"
            extra={
              <Segmented
                options={['Orders', 'Quotes', 'Sales', 'Commission']}
                value={chartType}
                onChange={setChartType}
                size="small"
              />
            }
          >
            <Table
              columns={statsColumns}
              dataSource={ordersTableData}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title="Orders Trend" className="chart-container">
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  interval={4}
                />
                <YAxis 
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="orders"
                  stroke={brandColors.accent}
                  strokeWidth={2}
                  dot={{ fill: brandColors.accent, r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Visitors Table */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card 
            title="Traffic Overview" 
            className="stats-table"
            extra={
              <Segmented
                options={['Visitors', 'Visits']}
                size="small"
              />
            }
          >
            <Table
              columns={statsColumns}
              dataSource={visitorsTableData}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title="Visitors Trend" className="chart-container">
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  interval={4}
                />
                <YAxis 
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="visitors"
                  stroke={brandColors.primary}
                  strokeWidth={2}
                  dot={{ fill: brandColors.primary, r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
