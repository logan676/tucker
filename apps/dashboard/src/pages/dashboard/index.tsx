import { Row, Col, Card, Statistic, Spin } from 'antd'
import {
  ShopOutlined,
  OrderedListOutlined,
  UserOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  SyncOutlined,
} from '@ant-design/icons'
import { useQuery } from '@tanstack/react-query'
import { adminApi } from '@/services/admin'

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: adminApi.getDashboardStats,
  })

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 100 }}>
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>Dashboard</h2>
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Merchants"
              value={stats?.totalMerchants || 0}
              prefix={<ShopOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Orders"
              value={stats?.totalOrders || 0}
              prefix={<OrderedListOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Users"
              value={stats?.totalUsers || 0}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Revenue"
              value={stats?.totalRevenue || 0}
              prefix={<DollarOutlined />}
              precision={2}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Today's Orders"
              value={stats?.todayOrders || 0}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#13c2c2' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Today's Revenue"
              value={stats?.todayRevenue || 0}
              prefix={<DollarOutlined />}
              precision={2}
              valueStyle={{ color: '#eb2f96' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Pending Merchants"
              value={stats?.pendingMerchants || 0}
              prefix={<ShopOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Active Orders"
              value={stats?.activeOrders || 0}
              prefix={<SyncOutlined spin={stats?.activeOrders ? stats.activeOrders > 0 : false} />}
              valueStyle={{ color: '#2f54eb' }}
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
