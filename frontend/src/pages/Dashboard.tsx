import { Row, Col, Card, List, Spin } from 'antd'
import {
  CalendarOutlined,
  DollarOutlined,
  WarningOutlined,
  InboxOutlined,
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
import { dashboardApi } from '@/api/dashboard'
import { bulletinApi } from '@/api/bulletin'

// Color palette from BankDash
const COLORS = {
  blue: '#396AFF',
  cyan: '#16DBCC',
  orange: '#FFBB38',
  pink: '#FF82AC',
  green: '#41D4A8',
  red: '#FE5C73',
}

const PIE_COLORS = [COLORS.blue, COLORS.cyan, COLORS.orange, COLORS.pink, COLORS.green]

// Stat Card Component matching BankDash design
interface StatCardProps {
  icon: React.ReactNode
  iconBg: string
  iconColor: string
  label: string
  value: string | number
}

function StatCard({ icon, iconBg, iconColor, label, value }: StatCardProps) {
  return (
    <div
      className="bg-white rounded-[25px] p-6 h-[120px] flex items-center gap-5"
      style={{ boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.02)' }}
    >
      <div
        className="w-[70px] h-[70px] rounded-full flex items-center justify-center"
        style={{ backgroundColor: iconBg }}
      >
        <span style={{ color: iconColor, fontSize: 28 }}>{icon}</span>
      </div>
      <div className="flex flex-col">
        <span className="text-[#718EBF] text-[16px]">{label}</span>
        <span className="text-[#232323] text-[22px] font-semibold mt-1">{value}</span>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { data: boardData, isLoading: boardLoading } = useQuery({
    queryKey: ['dashboard', 'board'],
    queryFn: async () => {
      const response = await dashboardApi.getBoard()
      return response.data
    },
  })

  const { data: bulletinsData } = useQuery({
    queryKey: ['bulletins', 'active'],
    queryFn: async () => {
      const response = await bulletinApi.getActive(5)
      return response.data
    },
  })

  if (boardLoading) {
    return (
      <div className="flex justify-center items-center h-[400px]">
        <Spin size="large" />
      </div>
    )
  }

  const overview = boardData?.overview || {
    inbound_count: 0,
    month_inbound_count: 0,
    total_consumption: 0,
  }

  const dailyInbound = boardData?.daily_inbound || []
  const dailyOutbound = boardData?.daily_outbound || []
  const inboundByType = boardData?.inbound_by_type || []
  const lowStock = boardData?.low_stock || []
  const bulletins = bulletinsData || []

  // Combine daily data for chart
  const chartData = dailyInbound.map((item: { date: string; amount: number }, index: number) => ({
    date: item.date,
    入库: item.amount,
    出库: dailyOutbound[index]?.amount || 0,
  }))

  return (
    <div className="space-y-7">
      {/* Stat Cards Row */}
      <Row gutter={[30, 30]}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            icon={<InboxOutlined />}
            iconBg="rgba(57, 106, 255, 0.1)"
            iconColor={COLORS.blue}
            label="累计入库"
            value={`${overview.inbound_count} 次`}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            icon={<CalendarOutlined />}
            iconBg="rgba(22, 219, 204, 0.1)"
            iconColor={COLORS.cyan}
            label="本月入库"
            value={`${overview.month_inbound_count} 次`}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            icon={<DollarOutlined />}
            iconBg="rgba(255, 187, 56, 0.1)"
            iconColor={COLORS.orange}
            label="累计消耗金额"
            value={`¥${overview.total_consumption?.toLocaleString() || 0}`}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            icon={<WarningOutlined />}
            iconBg="rgba(254, 92, 115, 0.1)"
            iconColor={COLORS.red}
            label="库存预警"
            value={`${lowStock.length} 项`}
          />
        </Col>
      </Row>

      {/* Charts Row */}
      <Row gutter={[30, 30]}>
        {/* Line Chart */}
        <Col xs={24} lg={16}>
          <Card
            className="rounded-[25px] border-0"
            style={{ boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.02)' }}
            styles={{
              header: { borderBottom: 'none', paddingBottom: 0 },
              body: { paddingTop: 10 },
            }}
            title={<span className="text-[#333B69] text-[22px] font-semibold">出入库趋势</span>}
          >
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E6EFF5" vertical={false} />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#718EBF', fontSize: 14 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#718EBF', fontSize: 14 }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 10,
                    border: 'none',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  }}
                />
                <Legend
                  iconType="circle"
                  wrapperStyle={{ paddingTop: 20 }}
                />
                <Line
                  type="monotone"
                  dataKey="入库"
                  stroke={COLORS.blue}
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 6, fill: COLORS.blue }}
                />
                <Line
                  type="monotone"
                  dataKey="出库"
                  stroke={COLORS.cyan}
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 6, fill: COLORS.cyan }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Pie Chart */}
        <Col xs={24} lg={8}>
          <Card
            className="rounded-[25px] border-0"
            style={{ boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.02)' }}
            styles={{
              header: { borderBottom: 'none', paddingBottom: 0 },
              body: { paddingTop: 10 },
            }}
            title={<span className="text-[#333B69] text-[22px] font-semibold">入库分类</span>}
          >
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={inboundByType.length > 0 ? inboundByType : [{ name: '暂无数据', value: 1 }]}
                  cx="50%"
                  cy="45%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  nameKey="name"
                >
                  {(inboundByType.length > 0 ? inboundByType : [{ name: '暂无数据', value: 1 }]).map(
                    (_: unknown, index: number) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    )
                  )}
                </Pie>
                <Legend
                  iconType="circle"
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                  formatter={(value) => <span style={{ color: '#718EBF', fontSize: 13 }}>{value}</span>}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 10,
                    border: 'none',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Bottom Row */}
      <Row gutter={[30, 30]}>
        {/* Bulletins */}
        <Col xs={24} lg={12}>
          <Card
            className="rounded-[25px] border-0"
            style={{ boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.02)' }}
            styles={{
              header: { borderBottom: 'none', paddingBottom: 0 },
              body: { paddingTop: 10 },
            }}
            title={<span className="text-[#333B69] text-[22px] font-semibold">系统公告</span>}
          >
            <List
              dataSource={bulletins}
              locale={{ emptyText: '暂无公告' }}
              renderItem={(item: { id: number; title: string; create_date: string | null }) => (
                <List.Item
                  className="border-b border-[#E6EFF5] last:border-0 py-4"
                  style={{ borderBottom: '1px solid #E6EFF5' }}
                >
                  <List.Item.Meta
                    title={
                      <span className="text-[#232323] text-[16px] font-medium">{item.title}</span>
                    }
                    description={
                      <span className="text-[#718EBF] text-[14px]">{item.create_date || '-'}</span>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* Low Stock Warning */}
        <Col xs={24} lg={12}>
          <Card
            className="rounded-[25px] border-0"
            style={{ boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.02)' }}
            styles={{
              header: { borderBottom: 'none', paddingBottom: 0 },
              body: { paddingTop: 10 },
            }}
            title={<span className="text-[#333B69] text-[22px] font-semibold">库存预警</span>}
          >
            <List
              dataSource={lowStock}
              locale={{ emptyText: '暂无预警项目' }}
              renderItem={(item: { id: number; name: string; amount: number; unit: string | null }) => (
                <List.Item
                  className="border-b border-[#E6EFF5] last:border-0 py-4"
                  style={{ borderBottom: '1px solid #E6EFF5' }}
                >
                  <List.Item.Meta
                    avatar={
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: 'rgba(254, 92, 115, 0.1)' }}
                      >
                        <WarningOutlined style={{ color: COLORS.red, fontSize: 18 }} />
                      </div>
                    }
                    title={
                      <span className="text-[#232323] text-[16px] font-medium">{item.name}</span>
                    }
                    description={
                      <span className="text-[#FE5C73] text-[14px] font-medium">
                        剩余: {item.amount} {item.unit}
                      </span>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}
