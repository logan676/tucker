import { Form, Input, Button, Card, message } from 'antd'
import { MailOutlined, LockOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth'
import { useState } from 'react'
import api from '@/services/api'

interface LoginForm {
  email: string
  password: string
}

interface AdminLoginResponse {
  accessToken: string
  refreshToken: string
  expiresIn: number
  user: {
    id: string
    email: string
    name: string | null
    avatar: string | null
    role: string
  }
}

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [loading, setLoading] = useState(false)

  const onFinish = async (values: LoginForm) => {
    setLoading(true)
    try {
      const response = await api.post<unknown, AdminLoginResponse>('/auth/login/admin', {
        email: values.email,
        password: values.password,
      })

      login(response.accessToken, {
        id: response.user.id,
        username: response.user.name || response.user.email,
        email: response.user.email,
        role: 'admin',
      })
      message.success('Login successful')
      navigate('/dashboard')
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }
      message.error(err?.response?.data?.message || 'Invalid email or password')
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
        styles={{ header: { textAlign: 'center', fontSize: 20 } }}
      >
        <Form
          name="login"
          onFinish={onFinish}
          autoComplete="off"
          size="large"
          initialValues={{
            email: '',
            password: '',
          }}
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email!' },
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="Email" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'Please input your password!' },
              { min: 6, message: 'Password must be at least 6 characters!' },
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Password" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              Login
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center', color: '#888', fontSize: 12 }}>
            Contact administrator if you need an account
          </div>
        </Form>
      </Card>
    </div>
  )
}
