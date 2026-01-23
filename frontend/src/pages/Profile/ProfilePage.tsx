import { useState } from 'react'
import { Card, Form, Input, Button, Avatar, Upload, message, Divider, Modal, Tag } from 'antd'
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  LockOutlined,
  CameraOutlined,
  EditOutlined,
} from '@ant-design/icons'
import { useAuthStore } from '@/store/authStore'
import { userApi } from '@/api/user'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export default function ProfilePage() {
  const [form] = Form.useForm()
  const [passwordForm] = Form.useForm()
  const [isEditing, setIsEditing] = useState(false)
  const [passwordModalOpen, setPasswordModalOpen] = useState(false)
  const { user, setAuth, token, roles } = useAuthStore()
  const queryClient = useQueryClient()

  // Fetch user profile
  const { data: profileData, isLoading } = useQuery({
    queryKey: ['profile', user?.user_id],
    queryFn: async () => {
      if (!user?.user_id) return null
      const response = await userApi.getProfile(user.user_id)
      return response.data
    },
    enabled: !!user?.user_id,
  })

  // Update profile mutation
  const updateMutation = useMutation({
    mutationFn: async (values: { email?: string; mobile?: string; description?: string }) => {
      if (!user?.user_id) throw new Error('User not found')
      return userApi.updateProfile(user.user_id, values)
    },
    onSuccess: () => {
      message.success('个人信息已更新')
      setIsEditing(false)
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      // Update auth store
      if (user && token) {
        const updatedUser = {
          ...user,
          email: form.getFieldValue('email'),
          mobile: form.getFieldValue('mobile'),
        }
        setAuth(token, updatedUser, roles)
      }
    },
    onError: () => {
      message.error('更新失败，请重试')
    },
  })

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (values: { old_password: string; new_password: string }) => {
      if (!user?.user_id) throw new Error('User not found')
      return userApi.changePassword(user.user_id, values)
    },
    onSuccess: () => {
      message.success('密码已修改')
      setPasswordModalOpen(false)
      passwordForm.resetFields()
    },
    onError: () => {
      message.error('密码修改失败，请检查原密码是否正确')
    },
  })

  const handleSave = async () => {
    try {
      const values = await form.validateFields()
      updateMutation.mutate(values)
    } catch {
      // Validation failed
    }
  }

  const handleCancel = () => {
    form.setFieldsValue({
      email: profileData?.email || '',
      mobile: profileData?.mobile || '',
      description: profileData?.description || '',
    })
    setIsEditing(false)
  }

  const handlePasswordSubmit = async () => {
    try {
      const values = await passwordForm.validateFields()
      changePasswordMutation.mutate(values)
    } catch {
      // Validation failed
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[400px]">
        <span className="text-[#718EBF]">加载中...</span>
      </div>
    )
  }

  const profile = profileData || user

  return (
    <div className="space-y-6">
      {/* Profile Header Card */}
      <Card
        className="rounded-[25px] border-0"
        style={{ boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.02)' }}
      >
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Avatar */}
          <div className="relative">
            <Avatar
              size={120}
              icon={<UserOutlined />}
              src={profile?.avatar}
              style={{ backgroundColor: '#1814F3' }}
            />
            <Upload
              showUploadList={false}
              beforeUpload={() => {
                message.info('头像上传功能开发中')
                return false
              }}
            >
              <div
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#1814F3] flex items-center justify-center cursor-pointer hover:bg-[#396AFF] transition-colors"
                style={{ border: '2px solid #fff' }}
              >
                <CameraOutlined style={{ color: '#fff', fontSize: 14 }} />
              </div>
            </Upload>
          </div>

          {/* User Info */}
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-[#232323] text-[28px] font-semibold mb-2">
              {profile?.username || '-'}
            </h2>
            <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-3">
              {roles?.map((role) => (
                <Tag
                  key={role}
                  style={{
                    backgroundColor: 'rgba(57, 106, 255, 0.1)',
                    color: '#396AFF',
                    border: 'none',
                    borderRadius: 6,
                    padding: '2px 12px',
                  }}
                >
                  {role}
                </Tag>
              ))}
            </div>
            <p className="text-[#718EBF] text-[14px]">
              {profileData?.description || '这个人很懒，什么都没写~'}
            </p>
          </div>

          {/* Edit Button */}
          {!isEditing && (
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => setIsEditing(true)}
              style={{
                height: 45,
                borderRadius: 12,
                backgroundColor: '#1814F3',
                border: 'none',
                paddingInline: 24,
              }}
            >
              编辑资料
            </Button>
          )}
        </div>
      </Card>

      {/* Profile Form */}
      <Card
        className="rounded-[25px] border-0"
        style={{ boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.02)' }}
        title={<span className="text-[#333B69] text-[18px] font-semibold">基本信息</span>}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            username: profile?.username || '',
            email: profile?.email || '',
            mobile: profile?.mobile || '',
            description: profileData?.description || '',
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Form.Item
              name="username"
              label={<span className="text-[#232323]">用户名</span>}
            >
              <Input
                prefix={<UserOutlined style={{ color: '#718EBF' }} />}
                disabled
                style={{
                  height: 50,
                  borderRadius: 15,
                  backgroundColor: '#F5F7FA',
                }}
              />
            </Form.Item>

            <Form.Item
              name="email"
              label={<span className="text-[#232323]">邮箱</span>}
              rules={[{ type: 'email', message: '请输入有效的邮箱地址' }]}
            >
              <Input
                prefix={<MailOutlined style={{ color: '#718EBF' }} />}
                disabled={!isEditing}
                placeholder="请输入邮箱"
                style={{
                  height: 50,
                  borderRadius: 15,
                  backgroundColor: isEditing ? '#fff' : '#F5F7FA',
                }}
              />
            </Form.Item>

            <Form.Item
              name="mobile"
              label={<span className="text-[#232323]">手机号</span>}
              rules={[{ pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号' }]}
            >
              <Input
                prefix={<PhoneOutlined style={{ color: '#718EBF' }} />}
                disabled={!isEditing}
                placeholder="请输入手机号"
                style={{
                  height: 50,
                  borderRadius: 15,
                  backgroundColor: isEditing ? '#fff' : '#F5F7FA',
                }}
              />
            </Form.Item>

            <Form.Item
              name="description"
              label={<span className="text-[#232323]">个人简介</span>}
            >
              <Input.TextArea
                disabled={!isEditing}
                placeholder="介绍一下自己吧"
                rows={3}
                style={{
                  borderRadius: 15,
                  backgroundColor: isEditing ? '#fff' : '#F5F7FA',
                }}
              />
            </Form.Item>
          </div>

          {isEditing && (
            <div className="flex justify-end gap-4 mt-4">
              <Button
                onClick={handleCancel}
                style={{
                  height: 45,
                  borderRadius: 12,
                  border: '1px solid #E6EFF5',
                  paddingInline: 24,
                }}
              >
                取消
              </Button>
              <Button
                type="primary"
                onClick={handleSave}
                loading={updateMutation.isPending}
                style={{
                  height: 45,
                  borderRadius: 12,
                  backgroundColor: '#1814F3',
                  border: 'none',
                  paddingInline: 32,
                }}
              >
                保存
              </Button>
            </div>
          )}
        </Form>
      </Card>

      {/* Security Card */}
      <Card
        className="rounded-[25px] border-0"
        style={{ boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.02)' }}
        title={<span className="text-[#333B69] text-[18px] font-semibold">安全设置</span>}
      >
        <div className="flex items-center justify-between p-4 rounded-xl bg-[#F5F7FA]">
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'rgba(254, 92, 115, 0.1)' }}
            >
              <LockOutlined style={{ color: '#FE5C73', fontSize: 20 }} />
            </div>
            <div>
              <div className="text-[#232323] font-medium">登录密码</div>
              <div className="text-[#718EBF] text-sm">建议定期更换密码以保障账户安全</div>
            </div>
          </div>
          <Button
            onClick={() => setPasswordModalOpen(true)}
            style={{
              height: 40,
              borderRadius: 10,
              border: '1px solid #1814F3',
              color: '#1814F3',
            }}
          >
            修改密码
          </Button>
        </div>

        <Divider />

        <div className="text-[#718EBF] text-sm">
          <p>账户创建时间: {profileData?.create_time || '-'}</p>
        </div>
      </Card>

      {/* Change Password Modal */}
      <Modal
        title={<span className="text-[#232323] font-semibold">修改密码</span>}
        open={passwordModalOpen}
        onCancel={() => {
          setPasswordModalOpen(false)
          passwordForm.resetFields()
        }}
        footer={null}
        width={400}
      >
        <Form form={passwordForm} layout="vertical" className="mt-6">
          <Form.Item
            name="old_password"
            label="当前密码"
            rules={[{ required: true, message: '请输入当前密码' }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#718EBF' }} />}
              placeholder="请输入当前密码"
              style={{ height: 45, borderRadius: 12 }}
            />
          </Form.Item>

          <Form.Item
            name="new_password"
            label="新密码"
            rules={[
              { required: true, message: '请输入新密码' },
              { min: 6, message: '密码至少6个字符' },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#718EBF' }} />}
              placeholder="请输入新密码"
              style={{ height: 45, borderRadius: 12 }}
            />
          </Form.Item>

          <Form.Item
            name="confirm_password"
            label="确认新密码"
            dependencies={['new_password']}
            rules={[
              { required: true, message: '请确认新密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('new_password') === value) {
                    return Promise.resolve()
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'))
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#718EBF' }} />}
              placeholder="请再次输入新密码"
              style={{ height: 45, borderRadius: 12 }}
            />
          </Form.Item>

          <div className="flex justify-end gap-4 mt-6">
            <Button
              onClick={() => {
                setPasswordModalOpen(false)
                passwordForm.resetFields()
              }}
            >
              取消
            </Button>
            <Button
              type="primary"
              onClick={handlePasswordSubmit}
              loading={changePasswordMutation.isPending}
              style={{ backgroundColor: '#1814F3' }}
            >
              确认修改
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  )
}
