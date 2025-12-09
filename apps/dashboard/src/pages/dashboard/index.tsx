import { Row, Col, Card, Statistic } from 'antd'
import {
  ShopOutlined,
  OrderedListOutlined,
  UserOutlined,
  DollarOutlined,
} from '@ant-design/icons'

export default function DashboardPage() {
  // In production, fetch real stats from API
  const stats = {
    merchants: 156,
    orders: 1234,
    users: 5678,
    revenue: 123456.78,
  }

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>Dashboard</h2>
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Merchants"
              value={stats.merchants}
              prefix={<ShopOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Orders"
              value={stats.orders}
              prefix={<OrderedListOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Users"
              value={stats.users}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Revenue"
              value={stats.revenue}
              prefix={<DollarOutlined />}
              precision={2}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: 24 }}>
        <Col span={12}>
          <Card title="Recent Orders">
            <p style={{ color: '#888', textAlign: 'center', padding: 40 }}>
              Order statistics chart will be displayed here
            </p>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Sales Trend">
            <p style={{ color: '#888', textAlign: 'center', padding: 40 }}>
              Sales trend chart will be displayed here
            </p>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
