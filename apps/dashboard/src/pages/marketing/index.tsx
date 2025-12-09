import { useState } from 'react'
import {
  Table,
  Card,
  Input,
  Select,
  Button,
  Tag,
  Space,
  Switch,
  Modal,
  Form,
  InputNumber,
  DatePicker,
  message,
  Tabs,
  Descriptions,
  Progress,
} from 'antd'
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  GiftOutlined,
} from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { couponsApi, CreateCouponRequest, UpdateCouponRequest } from '@/services/coupons'
import type { Coupon } from '@/types'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'

const { RangePicker } = DatePicker

export default function MarketingPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [keyword, setKeyword] = useState('')
  const [isActive, setIsActive] = useState<boolean>()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)
  const [form] = Form.useForm()

  const { data, isLoading } = useQuery({
    queryKey: ['coupons', { page, pageSize, keyword, isActive }],
    queryFn: () => couponsApi.getList({ page, pageSize, keyword, isActive }),
  })

  const createMutation = useMutation({
    mutationFn: (data: CreateCouponRequest) => couponsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] })
      message.success('Coupon created successfully')
      setModalOpen(false)
      form.resetFields()
    },
    onError: () => {
      message.error('Failed to create coupon')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCouponRequest }) =>
      couponsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] })
      message.success('Coupon updated successfully')
      setModalOpen(false)
      setEditingCoupon(null)
      form.resetFields()
    },
    onError: () => {
      message.error('Failed to update coupon')
    },
  })

  const toggleMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      couponsApi.toggleActive(id, active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] })
      message.success('Coupon status updated')
    },
    onError: () => {
      message.error('Failed to update coupon status')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => couponsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] })
      message.success('Coupon deleted')
    },
    onError: () => {
      message.error('Failed to delete coupon')
    },
  })

  const handleCreate = () => {
    setEditingCoupon(null)
    form.resetFields()
    setModalOpen(true)
  }

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon)
    form.setFieldsValue({
      ...coupon,
      dateRange: [dayjs(coupon.startDate), dayjs(coupon.endDate)],
    })
    setModalOpen(true)
  }

  const handleDelete = (coupon: Coupon) => {
    Modal.confirm({
      title: 'Delete Coupon',
      content: `Are you sure you want to delete "${coupon.name}"?`,
      okText: 'Delete',
      okButtonProps: { danger: true },
      onOk: () => deleteMutation.mutate(coupon.id),
    })
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      const { dateRange, ...rest } = values
      const data = {
        ...rest,
        startDate: dateRange[0].toISOString(),
        endDate: dateRange[1].toISOString(),
      }

      if (editingCoupon) {
        updateMutation.mutate({ id: editingCoupon.id, data })
      } else {
        createMutation.mutate(data)
      }
    } catch {
      // Validation failed
    }
  }

  const getCouponStatus = (coupon: Coupon) => {
    const now = new Date()
    const start = new Date(coupon.startDate)
    const end = new Date(coupon.endDate)

    if (!coupon.isActive) return { color: 'default', text: 'Inactive' }
    if (now < start) return { color: 'blue', text: 'Scheduled' }
    if (now > end) return { color: 'default', text: 'Expired' }
    return { color: 'green', text: 'Active' }
  }

  const columns: ColumnsType<Coupon> = [
    {
      title: 'Coupon',
      key: 'coupon',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Space>
            <GiftOutlined style={{ color: '#faad14' }} />
            <span style={{ fontWeight: 500 }}>{record.name}</span>
          </Space>
          <span style={{ fontSize: 12, color: '#888' }}>
            Code: <Tag>{record.code}</Tag>
          </span>
        </Space>
      ),
    },
    {
      title: 'Discount',
      key: 'discount',
      render: (_, record) => (
        <span style={{ fontWeight: 500, color: '#f5222d' }}>
          {record.discountType === 'percentage'
            ? `${record.discountValue}% OFF`
            : `¥${record.discountValue.toFixed(2)} OFF`}
        </span>
      ),
    },
    {
      title: 'Conditions',
      key: 'conditions',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          {record.minOrderAmount && (
            <span style={{ fontSize: 12 }}>
              Min. order: ¥{record.minOrderAmount.toFixed(2)}
            </span>
          )}
          {record.maxDiscountAmount && (
            <span style={{ fontSize: 12 }}>
              Max. discount: ¥{record.maxDiscountAmount.toFixed(2)}
            </span>
          )}
          {!record.minOrderAmount && !record.maxDiscountAmount && (
            <span style={{ fontSize: 12, color: '#888' }}>No conditions</span>
          )}
        </Space>
      ),
    },
    {
      title: 'Valid Period',
      key: 'period',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <span style={{ fontSize: 12 }}>
            {dayjs(record.startDate).format('YYYY-MM-DD')}
          </span>
          <span style={{ fontSize: 12 }}>
            to {dayjs(record.endDate).format('YYYY-MM-DD')}
          </span>
        </Space>
      ),
    },
    {
      title: 'Usage',
      key: 'usage',
      render: (_, record) => {
        const limit = record.usageLimit || Infinity
        const percent = Math.min((record.usageCount / limit) * 100, 100)
        return (
          <Space direction="vertical" size={0} style={{ width: 100 }}>
            <span style={{ fontSize: 12 }}>
              {record.usageCount} / {record.usageLimit || '∞'}
            </span>
            <Progress
              percent={percent}
              size="small"
              showInfo={false}
              status={percent >= 100 ? 'exception' : 'active'}
            />
          </Space>
        )
      },
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => {
        const status = getCouponStatus(record)
        return <Tag color={status.color}>{status.text}</Tag>
      },
    },
    {
      title: 'Active',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (active, record) => (
        <Switch
          checked={active}
          onChange={(checked) =>
            toggleMutation.mutate({ id: record.id, active: checked })
          }
          loading={toggleMutation.isPending}
        />
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
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
      <h2 style={{ marginBottom: 24 }}>Marketing</h2>
      <Tabs
        defaultActiveKey="coupons"
        items={[
          {
            key: 'coupons',
            label: 'Coupons',
            children: (
              <Card>
                <Space style={{ marginBottom: 16, width: '100%' }} wrap>
                  <Input
                    placeholder="Search coupons..."
                    prefix={<SearchOutlined />}
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    style={{ width: 250 }}
                    allowClear
                  />
                  <Select
                    placeholder="Status"
                    value={isActive}
                    onChange={setIsActive}
                    allowClear
                    style={{ width: 150 }}
                    options={[
                      { label: 'Active', value: true },
                      { label: 'Inactive', value: false },
                    ]}
                  />
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleCreate}
                  >
                    Create Coupon
                  </Button>
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
                    showTotal: (total) => `Total ${total} coupons`,
                  }}
                />
              </Card>
            ),
          },
          {
            key: 'analytics',
            label: 'Analytics',
            children: (
              <Card>
                <Descriptions title="Coupon Performance" bordered>
                  <Descriptions.Item label="Total Coupons">
                    {data?.pagination.total || 0}
                  </Descriptions.Item>
                  <Descriptions.Item label="Active Coupons">
                    {data?.items.filter((c) => c.isActive).length || 0}
                  </Descriptions.Item>
                  <Descriptions.Item label="Total Usage">
                    {data?.items.reduce((sum, c) => sum + c.usageCount, 0) || 0}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            ),
          },
        ]}
      />

      <Modal
        title={editingCoupon ? 'Edit Coupon' : 'Create Coupon'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => {
          setModalOpen(false)
          setEditingCoupon(null)
          form.resetFields()
        }}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        width={600}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="code"
            label="Coupon Code"
            rules={[{ required: true, message: 'Please enter coupon code' }]}
          >
            <Input placeholder="e.g., SUMMER20" />
          </Form.Item>
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Please enter coupon name' }]}
          >
            <Input placeholder="e.g., Summer Sale 20% Off" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea
              placeholder="Optional description"
              rows={2}
            />
          </Form.Item>
          <Space style={{ width: '100%' }} align="start">
            <Form.Item
              name="discountType"
              label="Discount Type"
              rules={[{ required: true }]}
              initialValue="percentage"
            >
              <Select style={{ width: 150 }}>
                <Select.Option value="percentage">Percentage</Select.Option>
                <Select.Option value="fixed">Fixed Amount</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="discountValue"
              label="Discount Value"
              rules={[{ required: true, message: 'Please enter discount value' }]}
            >
              <InputNumber
                style={{ width: 150 }}
                placeholder="e.g., 20"
                min={0}
              />
            </Form.Item>
          </Space>
          <Space style={{ width: '100%' }} align="start">
            <Form.Item name="minOrderAmount" label="Minimum Order">
              <InputNumber
                style={{ width: 150 }}
                placeholder="Optional"
                prefix="¥"
                min={0}
              />
            </Form.Item>
            <Form.Item name="maxDiscountAmount" label="Max Discount">
              <InputNumber
                style={{ width: 150 }}
                placeholder="Optional"
                prefix="¥"
                min={0}
              />
            </Form.Item>
            <Form.Item name="usageLimit" label="Usage Limit">
              <InputNumber
                style={{ width: 150 }}
                placeholder="Unlimited"
                min={1}
              />
            </Form.Item>
          </Space>
          <Form.Item
            name="dateRange"
            label="Valid Period"
            rules={[{ required: true, message: 'Please select valid period' }]}
          >
            <RangePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="isActive"
            label="Active"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
