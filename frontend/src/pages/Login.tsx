import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Form, Input, Button, message, Checkbox } from 'antd'
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
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center p-12"
        style={{
          background: 'linear-gradient(135deg, #1814F3 0%, #396AFF 100%)',
        }}
      >
        <div className="max-w-md text-center">
          <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-8">
            <span className="text-white text-4xl font-bold">仓</span>
          </div>
          <h1 className="text-white text-4xl font-bold mb-4">仓储管理系统</h1>
          <p className="text-white/80 text-lg leading-relaxed">
            现代化的仓储管理解决方案，帮助您高效管理库存、跟踪出入库记录、优化采购流程
          </p>
          <div className="mt-12 flex justify-center gap-8">
            <div className="text-center">
              <div className="text-white text-3xl font-bold">1000+</div>
              <div className="text-white/60 text-sm mt-1">企业用户</div>
            </div>
            <div className="text-center">
              <div className="text-white text-3xl font-bold">99.9%</div>
              <div className="text-white/60 text-sm mt-1">系统可用性</div>
            </div>
            <div className="text-center">
              <div className="text-white text-3xl font-bold">24/7</div>
              <div className="text-white/60 text-sm mt-1">技术支持</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 bg-[#F5F7FA]">
        <div className="w-full max-w-[400px]">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center mb-8">
            <div className="w-12 h-12 bg-[#1814F3] rounded-xl flex items-center justify-center">
              <span className="text-white text-2xl font-bold">仓</span>
            </div>
            <span className="ml-3 text-[#343C6A] text-2xl font-bold">仓储管理</span>
          </div>

          {/* Form Card */}
          <div
            className="bg-white rounded-[25px] p-8"
            style={{ boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)' }}
          >
            <div className="mb-8">
              <h2 className="text-[#343C6A] text-[28px] font-semibold mb-2">欢迎登录</h2>
              <p className="text-[#718EBF] text-[16px]">请输入您的账号信息</p>
            </div>

            <Form
              name="login"
              initialValues={{ remember: true }}
              onFinish={handleLogin}
              size="large"
              layout="vertical"
            >
              <Form.Item
                name="username"
                label={<span className="text-[#232323] font-medium">用户名</span>}
                rules={[{ required: true, message: '请输入用户名' }]}
              >
                <Input
                  prefix={<UserOutlined style={{ color: '#718EBF' }} />}
                  placeholder="请输入用户名"
                  style={{
                    height: 50,
                    borderRadius: 15,
                    backgroundColor: '#F5F7FA',
                    border: '1px solid #E6EFF5',
                  }}
                />
              </Form.Item>

              <Form.Item
                name="password"
                label={<span className="text-[#232323] font-medium">密码</span>}
                rules={[{ required: true, message: '请输入密码' }]}
              >
                <Input.Password
                  prefix={<LockOutlined style={{ color: '#718EBF' }} />}
                  placeholder="请输入密码"
                  style={{
                    height: 50,
                    borderRadius: 15,
                    backgroundColor: '#F5F7FA',
                    border: '1px solid #E6EFF5',
                  }}
                />
              </Form.Item>

              <Form.Item>
                <div className="flex justify-between items-center">
                  <Form.Item name="remember" valuePropName="checked" noStyle>
                    <Checkbox>
                      <span className="text-[#718EBF]">记住我</span>
                    </Checkbox>
                  </Form.Item>
                  <a className="text-[#1814F3] hover:text-[#396AFF]">忘记密码？</a>
                </div>
              </Form.Item>

              <Form.Item className="mb-0">
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  block
                  style={{
                    height: 50,
                    borderRadius: 15,
                    fontSize: 16,
                    fontWeight: 500,
                    background: '#1814F3',
                  }}
                >
                  登 录
                </Button>
              </Form.Item>
            </Form>

            <div className="mt-6 text-center text-[#718EBF] text-sm">
              默认账号: admin / admin123
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center text-[#718EBF] text-sm">
            © 2024 仓储管理系统. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  )
}
