import { useState } from 'react'
import { Card, Form, Switch, Select, InputNumber, Button, message, Divider, Radio } from 'antd'
import {
  BellOutlined,
  SecurityScanOutlined,
  LayoutOutlined,
  DatabaseOutlined,
} from '@ant-design/icons'

interface SystemSettings {
  // Notification settings
  enableNotifications: boolean
  notificationSound: boolean
  emailNotifications: boolean

  // Display settings
  theme: 'light' | 'dark' | 'auto'
  language: 'zh-CN' | 'en-US'
  pageSize: number

  // Stock settings
  lowStockWarning: number
  autoRefreshInterval: number
}

export default function SettingsPage() {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  // Get settings from localStorage or use defaults
  const getInitialSettings = (): SystemSettings => {
    const saved = localStorage.getItem('system-settings')
    if (saved) {
      return JSON.parse(saved)
    }
    return {
      enableNotifications: true,
      notificationSound: true,
      emailNotifications: false,
      theme: 'light',
      language: 'zh-CN',
      pageSize: 10,
      lowStockWarning: 10,
      autoRefreshInterval: 30,
    }
  }

  const handleSave = async (values: SystemSettings) => {
    setLoading(true)
    try {
      // Save to localStorage
      localStorage.setItem('system-settings', JSON.stringify(values))
      message.success('设置已保存')
    } catch {
      message.error('保存失败')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    const defaultSettings: SystemSettings = {
      enableNotifications: true,
      notificationSound: true,
      emailNotifications: false,
      theme: 'light',
      language: 'zh-CN',
      pageSize: 10,
      lowStockWarning: 10,
      autoRefreshInterval: 30,
    }
    form.setFieldsValue(defaultSettings)
    localStorage.setItem('system-settings', JSON.stringify(defaultSettings))
    message.success('已恢复默认设置')
  }

  return (
    <div className="space-y-6">
      <Form
        form={form}
        layout="vertical"
        initialValues={getInitialSettings()}
        onFinish={handleSave}
      >
        {/* Notification Settings */}
        <Card
          className="rounded-[25px] border-0 mb-6"
          style={{ boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.02)' }}
          title={
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'rgba(57, 106, 255, 0.1)' }}
              >
                <BellOutlined style={{ color: '#396AFF', fontSize: 18 }} />
              </div>
              <span className="text-[#333B69] text-[18px] font-semibold">通知设置</span>
            </div>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Form.Item
              name="enableNotifications"
              label={<span className="text-[#232323]">启用系统通知</span>}
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
            <Form.Item
              name="notificationSound"
              label={<span className="text-[#232323]">通知提示音</span>}
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
            <Form.Item
              name="emailNotifications"
              label={<span className="text-[#232323]">邮件通知</span>}
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </div>
        </Card>

        {/* Display Settings */}
        <Card
          className="rounded-[25px] border-0 mb-6"
          style={{ boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.02)' }}
          title={
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'rgba(22, 219, 204, 0.1)' }}
              >
                <LayoutOutlined style={{ color: '#16DBCC', fontSize: 18 }} />
              </div>
              <span className="text-[#333B69] text-[18px] font-semibold">显示设置</span>
            </div>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Form.Item
              name="theme"
              label={<span className="text-[#232323]">主题模式</span>}
            >
              <Radio.Group>
                <Radio value="light">浅色</Radio>
                <Radio value="dark">深色</Radio>
                <Radio value="auto">跟随系统</Radio>
              </Radio.Group>
            </Form.Item>
            <Form.Item
              name="language"
              label={<span className="text-[#232323]">系统语言</span>}
            >
              <Select style={{ width: 200 }}>
                <Select.Option value="zh-CN">简体中文</Select.Option>
                <Select.Option value="en-US">English</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="pageSize"
              label={<span className="text-[#232323]">每页显示条数</span>}
            >
              <Select style={{ width: 200 }}>
                <Select.Option value={10}>10 条/页</Select.Option>
                <Select.Option value={20}>20 条/页</Select.Option>
                <Select.Option value={50}>50 条/页</Select.Option>
                <Select.Option value={100}>100 条/页</Select.Option>
              </Select>
            </Form.Item>
          </div>
        </Card>

        {/* Stock Settings */}
        <Card
          className="rounded-[25px] border-0 mb-6"
          style={{ boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.02)' }}
          title={
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'rgba(255, 187, 56, 0.1)' }}
              >
                <DatabaseOutlined style={{ color: '#FFBB38', fontSize: 18 }} />
              </div>
              <span className="text-[#333B69] text-[18px] font-semibold">库存设置</span>
            </div>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Form.Item
              name="lowStockWarning"
              label={<span className="text-[#232323]">库存预警阈值</span>}
              tooltip="当库存低于此数量时显示预警"
            >
              <InputNumber
                min={1}
                max={1000}
                style={{ width: 200 }}
                addonAfter="件"
              />
            </Form.Item>
            <Form.Item
              name="autoRefreshInterval"
              label={<span className="text-[#232323]">数据刷新间隔</span>}
              tooltip="仪表盘数据自动刷新间隔"
            >
              <InputNumber
                min={10}
                max={300}
                style={{ width: 200 }}
                addonAfter="秒"
              />
            </Form.Item>
          </div>
        </Card>

        {/* Security Settings */}
        <Card
          className="rounded-[25px] border-0 mb-6"
          style={{ boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.02)' }}
          title={
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'rgba(254, 92, 115, 0.1)' }}
              >
                <SecurityScanOutlined style={{ color: '#FE5C73', fontSize: 18 }} />
              </div>
              <span className="text-[#333B69] text-[18px] font-semibold">安全设置</span>
            </div>
          }
        >
          <div className="text-[#718EBF] mb-4">
            如需修改密码或其他安全设置，请前往个人信息页面。
          </div>
        </Card>

        <Divider />

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <Button
            onClick={handleReset}
            style={{
              height: 45,
              borderRadius: 12,
              border: '1px solid #E6EFF5',
              paddingInline: 24,
            }}
          >
            恢复默认
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            style={{
              height: 45,
              borderRadius: 12,
              backgroundColor: '#1814F3',
              border: 'none',
              paddingInline: 32,
            }}
          >
            保存设置
          </Button>
        </div>
      </Form>
    </div>
  )
}
