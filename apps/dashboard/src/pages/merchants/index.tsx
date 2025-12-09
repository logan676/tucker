import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Table, Card, Input, Select, Button, Tag, Space, Avatar } from 'antd'
import { SearchOutlined, ShopOutlined } from '@ant-design/icons'
import { useQuery } from '@tanstack/react-query'
import { merchantsApi } from '@/services/merchants'
import type { Merchant } from '@/types'
import type { ColumnsType } from 'antd/es/table'

const statusColors: Record<string, string> = {
  pending: 'orange',
  active: 'green',
  suspended: 'red',
  closed: 'default',
}

const statusLabels: Record<string, string> = {
  pending: 'Pending',
  active: 'Active',
  suspended: 'Suspended',
  closed: 'Closed',
}

export default function MerchantsPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [keyword, setKeyword] = useState('')
  const [status, setStatus] = useState<string>()

  const { data, isLoading } = useQuery({
    queryKey: ['merchants', { page, pageSize, keyword, status }],
    queryFn: () => merchantsApi.getList({ page, pageSize, keyword, status }),
  })

  const columns: ColumnsType<Merchant> = [
    {
      title: 'Merchant',
      key: 'merchant',
      render: (_, record) => (
        <Space>
          <Avatar
            src={record.logo}
            icon={<ShopOutlined />}
            size={40}
          />
          <div>
            <div style={{ fontWeight: 500 }}>{record.name}</div>
            <div style={{ fontSize: 12, color: '#888' }}>
              {record.category?.name || '-'}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone) => phone || '-',
    },
    {
      title: 'Location',
      key: 'location',
      render: (_, record) =>
        record.city && record.district
          ? `${record.city} ${record.district}`
          : '-',
    },
    {
      title: 'Rating',
      dataIndex: 'rating',
      key: 'rating',
      render: (rating) => `${rating} / 5.0`,
    },
    {
      title: 'Monthly Sales',
      dataIndex: 'monthlySales',
      key: 'monthlySales',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={statusColors[status]}>{statusLabels[status]}</Tag>
      ),
    },
    {
      title: 'Open',
      dataIndex: 'isOpen',
      key: 'isOpen',
      render: (isOpen) => (
        <Tag color={isOpen ? 'green' : 'default'}>
          {isOpen ? 'Open' : 'Closed'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button type="link" onClick={() => navigate(`/merchants/${record.id}`)}>
          View
        </Button>
      ),
    },
  ]

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>Merchants</h2>
      <Card>
        <Space style={{ marginBottom: 16 }}>
          <Input
            placeholder="Search merchants..."
            prefix={<SearchOutlined />}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            style={{ width: 250 }}
            allowClear
          />
          <Select
            placeholder="Status"
            value={status}
            onChange={setStatus}
            allowClear
            style={{ width: 150 }}
            options={[
              { label: 'Pending', value: 'pending' },
              { label: 'Active', value: 'active' },
              { label: 'Suspended', value: 'suspended' },
              { label: 'Closed', value: 'closed' },
            ]}
          />
        </Space>
        <Table
          columns={columns}
          dataSource={data?.items || []}
          rowKey="id"
          loading={isLoading}
          pagination={{
            current: page,
            pageSize,
            total: data?.pagination.total || 0,
            onChange: (p, ps) => {
              setPage(p)
              setPageSize(ps)
            },
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} merchants`,
          }}
        />
      </Card>
    </div>
  )
}
