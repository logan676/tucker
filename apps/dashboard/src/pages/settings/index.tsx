import { useState } from 'react'
import {
  Card,
  Form,
  Input,
  Button,
  Tabs,
  Space,
  Switch,
  InputNumber,
  Divider,
  message,
  Typography,
  List,
  Tag,
} from 'antd'
import {
  SaveOutlined,
  SettingOutlined,
  SecurityScanOutlined,
  BellOutlined,
  GlobalOutlined,
} from '@ant-design/icons'

const { Title, Text } = Typography

export default function SettingsPage() {
  const [generalForm] = Form.useForm()
  const [notificationForm] = Form.useForm()
  const [loading, setLoading] = useState(false)

  const handleSaveGeneral = async () => {
    try {
      const values = await generalForm.validateFields()
      setLoading(true)
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      console.log('General settings:', values)
      message.success('Settings saved successfully')
    } catch {
      message.error('Please fill in all required fields')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveNotifications = async () => {
    try {
      const values = await notificationForm.validateFields()
      setLoading(true)
      await new Promise((resolve) => setTimeout(resolve, 1000))
      console.log('Notification settings:', values)
      message.success('Notification settings saved successfully')
    } catch {
      message.error('Please fill in all required fields')
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    {
      key: 'general',
      label: (
        <span>
          <SettingOutlined />
          General
        </span>
      ),
      children: (
        <Card>
          <Title level={4}>Platform Settings</Title>
          <Text type="secondary">Configure general platform settings</Text>
          <Divider />
          <Form
            form={generalForm}
            layout="vertical"
            initialValues={{
              platformName: 'Tucker',
              supportEmail: 'support@tucker.com',
              supportPhone: '+86 400-123-4567',
              defaultDeliveryFee: 5,
              minOrderAmount: 20,
              platformFeePercent: 15,
              enableRegistration: true,
              enableOrdering: true,
            }}
            style={{ maxWidth: 600 }}
          >
            <Form.Item
              name="platformName"
              label="Platform Name"
              rules={[{ required: true }]}
            >
              <Input placeholder="Platform name" />
            </Form.Item>
            <Form.Item
              name="supportEmail"
              label="Support Email"
              rules={[{ required: true, type: 'email' }]}
            >
              <Input placeholder="support@example.com" />
            </Form.Item>
            <Form.Item name="supportPhone" label="Support Phone">
              <Input placeholder="+86 xxx-xxxx-xxxx" />
            </Form.Item>
            <Divider />
            <Title level={5}>Order Settings</Title>
            <Space size="large">
              <Form.Item
                name="defaultDeliveryFee"
                label="Default Delivery Fee"
                rules={[{ required: true }]}
              >
                <InputNumber prefix="¥" min={0} />
              </Form.Item>
              <Form.Item
                name="minOrderAmount"
                label="Min Order Amount"
                rules={[{ required: true }]}
              >
                <InputNumber prefix="¥" min={0} />
              </Form.Item>
              <Form.Item
                name="platformFeePercent"
                label="Platform Fee (%)"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} max={100} suffix="%" />
              </Form.Item>
            </Space>
            <Divider />
            <Title level={5}>Feature Toggles</Title>
            <Form.Item
              name="enableRegistration"
              label="Allow New User Registration"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
            <Form.Item
              name="enableOrdering"
              label="Allow New Orders"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                onClick={handleSaveGeneral}
                loading={loading}
              >
                Save Settings
              </Button>
            </Form.Item>
          </Form>
        </Card>
      ),
    },
    {
      key: 'notifications',
      label: (
        <span>
          <BellOutlined />
          Notifications
        </span>
      ),
      children: (
        <Card>
          <Title level={4}>Notification Settings</Title>
          <Text type="secondary">Configure notification preferences</Text>
          <Divider />
          <Form
            form={notificationForm}
            layout="vertical"
            initialValues={{
              emailNewOrder: true,
              emailOrderCancelled: true,
              emailNewMerchant: true,
              pushNewOrder: true,
              pushOrderStatus: true,
              smsOrderConfirm: false,
            }}
            style={{ maxWidth: 600 }}
          >
            <Title level={5}>Email Notifications</Title>
            <Form.Item
              name="emailNewOrder"
              label="New Order Notification"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
            <Form.Item
              name="emailOrderCancelled"
              label="Order Cancelled Notification"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
            <Form.Item
              name="emailNewMerchant"
              label="New Merchant Registration"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
            <Divider />
            <Title level={5}>Push Notifications</Title>
            <Form.Item
              name="pushNewOrder"
              label="Push New Orders"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
            <Form.Item
              name="pushOrderStatus"
              label="Push Order Status Changes"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
            <Divider />
            <Title level={5}>SMS Notifications</Title>
            <Form.Item
              name="smsOrderConfirm"
              label="SMS Order Confirmation"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                onClick={handleSaveNotifications}
                loading={loading}
              >
                Save Notifications
              </Button>
            </Form.Item>
          </Form>
        </Card>
      ),
    },
    {
      key: 'security',
      label: (
        <span>
          <SecurityScanOutlined />
          Security
        </span>
      ),
      children: (
        <Card>
          <Title level={4}>Security Settings</Title>
          <Text type="secondary">Manage security and access control</Text>
          <Divider />
          <List
            itemLayout="horizontal"
            dataSource={[
              {
                title: 'Two-Factor Authentication',
                description: 'Add an extra layer of security to your account',
                status: 'Disabled',
                statusColor: 'default',
              },
              {
                title: 'Session Management',
                description: 'View and manage active sessions',
                status: '1 Active',
                statusColor: 'green',
              },
              {
                title: 'API Keys',
                description: 'Manage API keys for integrations',
                status: '0 Keys',
                statusColor: 'blue',
              },
              {
                title: 'Login History',
                description: 'View recent login activity',
                status: 'View',
                statusColor: 'default',
              },
            ]}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <Button type="link" key="configure">
                    Configure
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  title={item.title}
                  description={item.description}
                />
                <Tag color={item.statusColor}>{item.status}</Tag>
              </List.Item>
            )}
          />
        </Card>
      ),
    },
    {
      key: 'integrations',
      label: (
        <span>
          <GlobalOutlined />
          Integrations
        </span>
      ),
      children: (
        <Card>
          <Title level={4}>Third-Party Integrations</Title>
          <Text type="secondary">Manage payment and service integrations</Text>
          <Divider />
          <List
            itemLayout="horizontal"
            dataSource={[
              {
                title: 'Stripe',
                description: 'Payment processing',
                status: 'Connected',
                statusColor: 'green',
              },
              {
                title: 'Twilio',
                description: 'SMS notifications',
                status: 'Connected',
                statusColor: 'green',
              },
              {
                title: 'Redis',
                description: 'Cache and session storage',
                status: 'Connected',
                statusColor: 'green',
              },
              {
                title: 'AWS S3',
                description: 'File storage',
                status: 'Not Configured',
                statusColor: 'default',
              },
              {
                title: 'Google Maps',
                description: 'Location services',
                status: 'Not Configured',
                statusColor: 'default',
              },
            ]}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <Button type="link" key="configure">
                    {item.status === 'Connected' ? 'Manage' : 'Connect'}
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  title={item.title}
                  description={item.description}
                />
                <Tag color={item.statusColor}>{item.status}</Tag>
              </List.Item>
            )}
          />
        </Card>
      ),
    },
  ]

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>Settings</h2>
      <Tabs defaultActiveKey="general" items={tabs} tabPosition="left" />
    </div>
  )
}
