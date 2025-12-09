import { useState } from 'react'
import {
  Table,
  Card,
  Input,
  Select,
  Button,
  Tag,
  Space,
  Avatar,
  Switch,
  Modal,
  message,
} from 'antd'
import { SearchOutlined, ShoppingOutlined, DeleteOutlined } from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { productsApi } from '@/services/products'
import { merchantsApi } from '@/services/merchants'
import type { Product, Merchant } from '@/types'
import type { ColumnsType } from 'antd/es/table'

export default function ProductsPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [keyword, setKeyword] = useState('')
  const [merchantId, setMerchantId] = useState<string>()
  const [isAvailable, setIsAvailable] = useState<boolean>()

  const { data, isLoading } = useQuery({
    queryKey: ['products', { page, pageSize, keyword, merchantId, isAvailable }],
    queryFn: () =>
      productsApi.getList({ page, pageSize, keyword, merchantId, isAvailable }),
  })

  const { data: merchants } = useQuery({
    queryKey: ['merchants-select'],
    queryFn: () => merchantsApi.getList({ page: 1, pageSize: 100 }),
  })

  const toggleMutation = useMutation({
    mutationFn: ({ id, available }: { id: string; available: boolean }) =>
      productsApi.toggleAvailability(id, available),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      message.success('Product availability updated')
    },
    onError: () => {
      message.error('Failed to update product')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => productsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      message.success('Product deleted')
    },
    onError: () => {
      message.error('Failed to delete product')
    },
  })

  const handleDelete = (product: Product) => {
    Modal.confirm({
      title: 'Delete Product',
      content: `Are you sure you want to delete "${product.name}"?`,
      okText: 'Delete',
      okButtonProps: { danger: true },
      onOk: () => deleteMutation.mutate(product.id),
    })
  }

  const columns: ColumnsType<Product> = [
    {
      title: 'Product',
      key: 'product',
      render: (_, record) => (
        <Space>
          <Avatar
            src={record.image}
            icon={<ShoppingOutlined />}
            size={50}
            shape="square"
          />
          <div>
            <div style={{ fontWeight: 500 }}>{record.name}</div>
            <div
              style={{
                fontSize: 12,
                color: '#888',
                maxWidth: 200,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {record.description || '-'}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Price',
      key: 'price',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <span style={{ fontWeight: 500, color: '#f5222d' }}>
            ¥{record.price.toFixed(2)}
          </span>
          {record.originalPrice && record.originalPrice > record.price && (
            <span
              style={{
                fontSize: 12,
                color: '#999',
                textDecoration: 'line-through',
              }}
            >
              ¥{record.originalPrice.toFixed(2)}
            </span>
          )}
        </Space>
      ),
    },
    {
      title: 'Monthly Sales',
      dataIndex: 'monthlySales',
      key: 'monthlySales',
      sorter: true,
    },
    {
      title: 'Available',
      dataIndex: 'isAvailable',
      key: 'isAvailable',
      render: (available, record) => (
        <Switch
          checked={available}
          onChange={(checked) =>
            toggleMutation.mutate({ id: record.id, available: checked })
          }
          loading={toggleMutation.isPending}
        />
      ),
    },
    {
      title: 'Recommend',
      dataIndex: 'isRecommend',
      key: 'isRecommend',
      render: (isRecommend) => (
        <Tag color={isRecommend ? 'gold' : 'default'}>
          {isRecommend ? 'Recommended' : '-'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          />
        </Space>
      ),
    },
  ]

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>Products</h2>
      <Card>
        <Space style={{ marginBottom: 16 }} wrap>
          <Input
            placeholder="Search products..."
            prefix={<SearchOutlined />}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            style={{ width: 250 }}
            allowClear
          />
          <Select
            placeholder="Merchant"
            value={merchantId}
            onChange={setMerchantId}
            allowClear
            style={{ width: 200 }}
            showSearch
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            options={merchants?.items.map((m: Merchant) => ({
              label: m.name,
              value: m.id,
            }))}
          />
          <Select
            placeholder="Availability"
            value={isAvailable}
            onChange={setIsAvailable}
            allowClear
            style={{ width: 150 }}
            options={[
              { label: 'Available', value: true },
              { label: 'Unavailable', value: false },
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
            showTotal: (total) => `Total ${total} products`,
          }}
        />
      </Card>
    </div>
  )
}
