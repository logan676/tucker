import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Table, Card, Input, Tabs, Tag, Space, Avatar, Button } from 'antd'
import { SearchOutlined, ShopOutlined, FileTextOutlined } from '@ant-design/icons'
import { useQuery } from '@tanstack/react-query'
import { applicationsApi, type ApplicationStatus, type MerchantApplication } from '@/services/applications'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'

const statusConfig: Record<ApplicationStatus, { color: string; label: string }> = {
  draft: { color: 'default', label: 'Draft' },
  submitted: { color: 'orange', label: 'Pending Review' },
  under_review: { color: 'processing', label: 'Under Review' },
  approved: { color: 'success', label: 'Approved' },
  rejected: { color: 'error', label: 'Rejected' },
}

export default function ApplicationsPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<ApplicationStatus | undefined>(undefined)

  const { data, isLoading } = useQuery({
    queryKey: ['applications', { page, limit: pageSize, search, status }],
    queryFn: () => applicationsApi.getList({ page, limit: pageSize, search, status }),
  })

  const { data: pendingCount } = useQuery({
    queryKey: ['applications-pending-count'],
    queryFn: () => applicationsApi.getPendingCount(),
  })

  const columns: ColumnsType<MerchantApplication> = [
    {
      title: 'Business',
      key: 'business',
      render: (_, record) => (
        <Space>
          <Avatar
            src={record.logo}
            icon={<ShopOutlined />}
            size={40}
          />
          <div>
            <div style={{ fontWeight: 500 }}>{record.businessName}</div>
            <div style={{ fontSize: 12, color: '#888' }}>
              ABN: {record.abn}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Contact',
      key: 'contact',
      render: (_, record) => (
        <div>
          <div>{record.contactName}</div>
          <div style={{ fontSize: 12, color: '#888' }}>{record.contactPhone}</div>
        </div>
      ),
    },
    {
      title: 'Location',
      key: 'location',
      render: (_, record) => `${record.city}, ${record.district}`,
    },
    {
      title: 'Category',
      key: 'category',
      render: (_, record) => record.category?.name || '-',
    },
    {
      title: 'Submitted',
      key: 'submittedAt',
      render: (_, record) =>
        record.submittedAt
          ? dayjs(record.submittedAt).format('YYYY-MM-DD HH:mm')
          : '-',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: ApplicationStatus) => (
        <Tag color={statusConfig[status].color}>{statusConfig[status].label}</Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button type="link" onClick={() => navigate(`/applications/${record.id}`)}>
          {record.status === 'submitted' ? 'Review' : 'View'}
        </Button>
      ),
    },
  ]

  const tabItems = [
    { key: '', label: 'All' },
    {
      key: 'submitted',
      label: (
        <span>
          Pending Review
          {pendingCount?.count ? (
            <Tag color="orange" style={{ marginLeft: 8 }}>
              {pendingCount.count}
            </Tag>
          ) : null}
        </span>
      ),
    },
    { key: 'under_review', label: 'Under Review' },
    { key: 'approved', label: 'Approved' },
    { key: 'rejected', label: 'Rejected' },
  ]

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>
        <FileTextOutlined style={{ marginRight: 8 }} />
        Merchant Applications
      </h2>

      <Card>
        <Tabs
          activeKey={status || ''}
          onChange={(key) => {
            setStatus(key as ApplicationStatus || undefined)
            setPage(1)
          }}
          items={tabItems}
        />

        <Space style={{ marginBottom: 16 }}>
          <Input
            placeholder="Search by business name or ABN..."
            prefix={<SearchOutlined />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 300 }}
            allowClear
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
            total: data?.total || 0,
            onChange: (p, ps) => {
              setPage(p)
              setPageSize(ps)
            },
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} applications`,
          }}
        />
      </Card>
    </div>
  )
}
