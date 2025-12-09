import { Form, Input, Button, Card, message } from 'antd'
import { PhoneOutlined, SafetyOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth'
import { useState } from 'react'
import api from '@/services/api'

interface LoginForm {
  phone: string
  code: string
}

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [sendingCode, setSendingCode] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [form] = Form.useForm()

  const sendSmsCode = async () => {
    const phone = form.getFieldValue('phone')
    if (!phone || !/^1\d{10}$/.test(phone)) {
      message.error('Please enter a valid phone number')
      return
    }

    setSendingCode(true)
    try {
      await api.post('/auth/sms/send', { phone })
      message.success('Verification code sent! (Dev mode: use 123456)')
      setCountdown(60)
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } catch {
      message.error('Failed to send code')
    } finally {
      setSendingCode(false)
    }
  }

  const onFinish = async (values: LoginForm) => {
    setLoading(true)
    try {
      const response = await api.post<unknown, { accessToken: string; user: { id: string; phone: string; name?: string } }>('/auth/login/phone', {
        phone: values.phone,
        code: values.code,
      })

      login(response.accessToken, {
        id: response.user.id,
        username: response.user.name || response.user.phone,
        phone: response.user.phone,
        role: 'admin',
      })
      message.success('Login successful')
      navigate('/dashboard')
    } catch {
      message.error('Invalid phone or code')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <Card
        title="Tucker Admin Dashboard"
        style={{ width: 400 }}
        headStyle={{ textAlign: 'center', fontSize: 20 }}
      >
        <Form
          form={form}
          name="login"
          onFinish={onFinish}
          autoComplete="off"
          size="large"
        >
          <Form.Item
            name="phone"
            rules={[
              { required: true, message: 'Please input phone number!' },
              { pattern: /^1\d{10}$/, message: 'Invalid phone number format' },
            ]}
          >
            <Input prefix={<PhoneOutlined />} placeholder="Phone Number" />
          </Form.Item>

          <Form.Item
            name="code"
            rules={[{ required: true, message: 'Please input verification code!' }]}
          >
            <Input
              prefix={<SafetyOutlined />}
              placeholder="Verification Code"
              suffix={
                <Button
                  type="link"
                  size="small"
                  onClick={sendSmsCode}
                  disabled={countdown > 0 || sendingCode}
                  loading={sendingCode}
                >
                  {countdown > 0 ? `${countdown}s` : 'Get Code'}
                </Button>
              }
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              Login
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center', color: '#888' }}>
            Admin phones: 13800138000, 13900139000
            <br />
            Dev code: 123456
          </div>
        </Form>
      </Card>
    </div>
  )
}
