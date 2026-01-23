import { useState } from 'react'
import { Row, Col, Card, Statistic, List, Typography, Spin, Pagination } from 'antd'
import {
  ImportOutlined,
  CalendarOutlined,
  DollarOutlined,
  WarningOutlined,
} from '@ant-design/icons'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import { useQuery } from '@tanstack/react-query'
import { dashboardApi, StockBoard } from '@/api/dashboard'
import { bulletinApi, Bulletin } from '@/api/bulletin'
import { useAuthStore } from '@/store/authStore'
import dayjs from 'dayjs'

const { Title, Paragraph } = Typography

const COLORS = ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1']

export default function Dashboard() {
  const { user } = useAuthStore()
  const [bulletinPage, setBulletinPage] = useState(1)

  const { data: boardData, isLoading: boardLoading } = useQuery({
    queryKey: ['dashboard-board'],
    queryFn: async () => {
      const response = await dashboardApi.getBoard()
      return response.data
    },
  })

  const { data: bulletins, isLoading: bulletinLoading } = useQuery({
    queryKey: ['bulletins-active'],
    queryFn: async () => {
      const response = await bulletinApi.getActive(10)
      return response.data
    },
  })

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return '上午好'
    if (hour < 18) return '下午好'
    return '晚上好'
  }

  if (boardLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spin size="large" />
      </div>
    )
  }

  const { overview, daily_inbound, daily_outbound, inbound_by_type, outbound_by_type, low_stock } =
    boardData || ({} as StockBoard)

  return (
    <div className="space-y-4">
      {/* Welcome Section */}
      <Card>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white text-2xl mr-4">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            <div>
              <Title level={4} className="mb-0">
                {getGreeting()}，{user?.username}
              </Title>
              <Paragraph className="text-gray-500 mb-0">超级管理员</Paragraph>
              <Paragraph className="text-gray-400 text-sm mb-0">
                上次登录时间：{dayjs().format('YYYY-MM-DD HH:mm:ss')}
              </Paragraph>
            </div>
          </div>
          <Row gutter={32}>
            <Col>
              <Statistic
                title="入库次数"
                value={overview?.inbound_count || 0}
                valueStyle={{ color: '#1890ff' }}
              />
            </Col>
            <Col>
              <Statistic
                title="本月次数"
                value={overview?.month_inbound_count || 0}
                valueStyle={{ color: '#1890ff' }}
              />
            </Col>
            <Col>
              <Statistic
                title="总消耗金额"
                value={overview?.total_consumption || 0}
                precision={2}
                valueStyle={{ color: '#52c41a' }}
              />
            </Col>
          </Row>
        </div>
      </Card>

      {/* Stats Cards */}
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic
              title="入库次数"
              value={overview?.inbound_count || 0}
              prefix={<ImportOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="本月入库"
              value={overview?.month_inbound_count || 0}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="总消耗金额"
              value={overview?.total_consumption || 0}
              precision={2}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="库存预警"
              value={low_stock?.length || 0}
              prefix={<WarningOutlined />}
              valueStyle={{ color: low_stock?.length ? '#f5222d' : '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Charts and Bulletins */}
      <Row gutter={16}>
        <Col span={16}>
          {/* Bulletins */}
          <Card title="公告信息" className="mb-4">
            <List
              loading={bulletinLoading}
              dataSource={bulletins?.slice((bulletinPage - 1) * 2, bulletinPage * 2)}
              renderItem={(item: Bulletin) => (
                <List.Item>
                  <List.Item.Meta
                    title={<a className="text-primary">{item.title}</a>}
                    description={
                      <div>
                        <Paragraph ellipsis={{ rows: 2 }} className="text-gray-500 mb-1">
                          {item.content}
                        </Paragraph>
                        <span className="text-gray-400 text-xs">
                          <CalendarOutlined className="mr-1" />
                          {item.create_date}
                        </span>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
            {bulletins && bulletins.length > 2 && (
              <div className="text-right mt-2">
                <Pagination
                  size="small"
                  current={bulletinPage}
                  total={bulletins.length}
                  pageSize={2}
                  onChange={setBulletinPage}
                />
              </div>
            )}
          </Card>

          {/* Type Statistics */}
          <Row gutter={16}>
            <Col span={12}>
              <Card title="入库类型统计">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={inbound_by_type || []}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={60}
                      label
                    >
                      {(inbound_by_type || []).map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </Col>
            <Col span={12}>
              <Card title="出库类型统计">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={outbound_by_type || []}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={60}
                      label
                    >
                      {(outbound_by_type || []).map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          </Row>
        </Col>

        {/* Daily Charts */}
        <Col span={8}>
          <Card title="入库统计" className="mb-4">
            <ResponsiveContainer width="100%" height={150}>
              <LineChart data={daily_inbound || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Line type="monotone" dataKey="amount" stroke="#1890ff" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card title="出库统计">
            <ResponsiveContainer width="100%" height={150}>
              <LineChart data={daily_outbound || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Line type="monotone" dataKey="amount" stroke="#52c41a" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
