import { useState } from 'react'
import { Table, Card, Select, Tag, Space, Button, Modal, Descriptions } from 'antd'
import { useQuery } from '@tanstack/react-query'
import { ordersApi } from '@/services/orders'
import type { Order, OrderStatus } from '@/types'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'

const statusColors: Record<OrderStatus, string> = {
  pending_payment: 'orange',
  pending_confirm: 'blue',
  confirmed: 'cyan',
  preparing: 'purple',
  delivering: 'geekblue',
  completed: 'green',
  cancelled: 'default',
  refunded: 'red',
}

const statusLabels: Record<OrderStatus, string> = {
  pending_payment: 'Pending Payment',
  pending_confirm: 'Pending Confirm',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  delivering: 'Delivering',
  completed: 'Completed',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
}

export default function OrdersPage() {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [status, setStatus] = useState<string>()
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['orders', { page, pageSize, status }],
    queryFn: () => ordersApi.getList({ page, pageSize, status }),
  })

  const columns: ColumnsType<Order> = [
    {
      title: 'Order No',
      dataIndex: 'orderNo',
      key: 'orderNo',
      render: (orderNo) => (
        <span style={{ fontFamily: 'monospace' }}>{orderNo}</span>
      ),
    },
    {
      title: 'Merchant',
      key: 'merchant',
      render: (_, record) => record.merchant?.name || '-',
    },
    {
      title: 'Total Amount',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount) => `¥${Number(amount).toFixed(2)}`,
    },
    {
      title: 'Pay Amount',
      dataIndex: 'payAmount',
      key: 'payAmount',
      render: (amount) => (
        <span style={{ color: '#f5222d', fontWeight: 500 }}>
          ¥{Number(amount).toFixed(2)}
        </span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: OrderStatus) => (
        <Tag color={statusColors[status]}>{statusLabels[status]}</Tag>
      ),
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => dayjs(date).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button type="link" onClick={() => setSelectedOrder(record)}>
          View
        </Button>
      ),
    },
  ]

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>Orders</h2>
      <Card>
        <Space style={{ marginBottom: 16 }}>
          <Select
            placeholder="Status"
            value={status}
            onChange={setStatus}
            allowClear
            style={{ width: 180 }}
            options={Object.entries(statusLabels).map(([value, label]) => ({
              value,
              label,
            }))}
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
            showTotal: (total) => `Total ${total} orders`,
          }}
        />
      </Card>

      <Modal
        title={`Order #${selectedOrder?.orderNo}`}
        open={!!selectedOrder}
        onCancel={() => setSelectedOrder(null)}
        footer={null}
        width={600}
      >
        {selectedOrder && (
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="Order No" span={2}>
              {selectedOrder.orderNo}
            </Descriptions.Item>
            <Descriptions.Item label="Merchant">
              {selectedOrder.merchant?.name || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={statusColors[selectedOrder.status]}>
                {statusLabels[selectedOrder.status]}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Total Amount">
              ¥{Number(selectedOrder.totalAmount).toFixed(2)}
            </Descriptions.Item>
            <Descriptions.Item label="Delivery Fee">
              ¥{Number(selectedOrder.deliveryFee).toFixed(2)}
            </Descriptions.Item>
            <Descriptions.Item label="Discount">
              -¥{Number(selectedOrder.discountAmount).toFixed(2)}
            </Descriptions.Item>
            <Descriptions.Item label="Pay Amount">
              <span style={{ color: '#f5222d', fontWeight: 500 }}>
                ¥{Number(selectedOrder.payAmount).toFixed(2)}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="Remark" span={2}>
              {selectedOrder.remark || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Created At" span={2}>
              {dayjs(selectedOrder.createdAt).format('YYYY-MM-DD HH:mm:ss')}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  )
}
