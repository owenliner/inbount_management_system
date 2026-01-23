import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Form, Input, Button, Card, message } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { authApi, LoginParams } from '@/api/auth'
import { useAuthStore } from '@/store/authStore'

export default function Login() {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()

  const handleLogin = async (values: LoginParams) => {
    setLoading(true)
    try {
      const response = await authApi.login(values)
      if (response.code === 0 && response.data) {
        const { token, user, roles } = response.data
        setAuth(token, user, roles)
        message.success('登录成功')
        navigate('/dashboard')
      } else {
        message.error(response.msg || '登录失败')
      }
    } catch (error) {
      message.error(error instanceof Error ? error.message : '登录失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
      }}
    >
      <Card
        className="w-[400px] shadow-xl"
        styles={{ body: { padding: '40px 32px' } }}
      >
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">仓储管理系统</h1>
          <p className="text-gray-500">商品入库管理系统</p>
        </div>
        <Form
          name="login"
          onFinish={handleLogin}
          autoComplete="off"
          size="large"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input
              prefix={<UserOutlined className="text-gray-400" />}
              placeholder="用户名"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-gray-400" />}
              placeholder="密码"
            />
          </Form.Item>

          <Form.Item className="mb-0">
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              className="h-10"
            >
              登录
            </Button>
          </Form.Item>
        </Form>
        <div className="text-center mt-4 text-gray-400 text-sm">
          默认账号: admin / admin123
        </div>
      </Card>
    </div>
  )
}
