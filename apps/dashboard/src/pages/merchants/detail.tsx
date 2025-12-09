import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Card,
  Descriptions,
  Tag,
  Button,
  Space,
  Spin,
  Avatar,
  Divider,
} from 'antd'
import { ArrowLeftOutlined, ShopOutlined } from '@ant-design/icons'
import { merchantsApi } from '@/services/merchants'

const statusColors: Record<string, string> = {
  pending: 'orange',
  active: 'green',
  suspended: 'red',
  closed: 'default',
}

export default function MerchantDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: merchant, isLoading } = useQuery({
    queryKey: ['merchant', id],
    queryFn: () => merchantsApi.getById(id!),
    enabled: !!id,
  })

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: 50 }}>
        <Spin size="large" />
      </div>
    )
  }

  if (!merchant) {
    return <div>Merchant not found</div>
  }

  return (
    <div>
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate('/merchants')}
        style={{ marginBottom: 24 }}
      >
        Back to Merchants
      </Button>

      <Card>
        <Space align="start" size={24}>
          <Avatar
            src={merchant.logo}
            icon={<ShopOutlined />}
            size={100}
          />
          <div>
            <h2 style={{ margin: 0 }}>{merchant.name}</h2>
            <p style={{ color: '#888', marginTop: 8 }}>
              {merchant.description || 'No description'}
            </p>
            <Space style={{ marginTop: 8 }}>
              <Tag color={statusColors[merchant.status]}>
                {merchant.status.toUpperCase()}
              </Tag>
              <Tag color={merchant.isOpen ? 'green' : 'default'}>
                {merchant.isOpen ? 'OPEN' : 'CLOSED'}
              </Tag>
            </Space>
          </div>
        </Space>

        <Divider />

        <Descriptions title="Basic Information" column={2}>
          <Descriptions.Item label="Phone">
            {merchant.phone || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Category">
            {merchant.category?.name || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Rating">
            {merchant.rating} / 5.0 ({merchant.ratingCount} reviews)
          </Descriptions.Item>
          <Descriptions.Item label="Monthly Sales">
            {merchant.monthlySales}
          </Descriptions.Item>
          <Descriptions.Item label="Min Order Amount">
            ¥{merchant.minOrderAmount}
          </Descriptions.Item>
          <Descriptions.Item label="Delivery Fee">
            ¥{merchant.deliveryFee}
          </Descriptions.Item>
          <Descriptions.Item label="Delivery Time">
            {merchant.deliveryTime || '-'}
          </Descriptions.Item>
        </Descriptions>

        <Divider />

        <Descriptions title="Location" column={2}>
          <Descriptions.Item label="Province">
            {merchant.province || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="City">
            {merchant.city || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="District">
            {merchant.district || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Address">
            {merchant.address || '-'}
          </Descriptions.Item>
        </Descriptions>

        <Divider />

        <Descriptions title="Timestamps" column={2}>
          <Descriptions.Item label="Created At">
            {new Date(merchant.createdAt).toLocaleString()}
          </Descriptions.Item>
          <Descriptions.Item label="Updated At">
            {new Date(merchant.updatedAt).toLocaleString()}
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  )
}
