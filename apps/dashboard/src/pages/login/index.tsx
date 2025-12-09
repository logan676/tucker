import { Form, Input, Button, Card, message } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth'

interface LoginForm {
  username: string
  password: string
}

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuthStore()

  const onFinish = (values: LoginForm) => {
    // Mock admin login - in production, call the actual API
    if (values.username === 'admin' && values.password === 'admin123') {
      login('mock-admin-token', {
        id: '1',
        username: 'admin',
        role: 'admin',
      })
      message.success('Login successful')
      navigate('/dashboard')
    } else {
      message.error('Invalid username or password')
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
          name="login"
          onFinish={onFinish}
          autoComplete="off"
          size="large"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Please input username!' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Username" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input password!' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Password" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Login
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center', color: '#888' }}>
            Demo: admin / admin123
          </div>
        </Form>
      </Card>
    </div>
  )
}
