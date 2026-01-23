import { useState } from 'react'
import { Table, Button, Space, Input, Select, Card, Tag } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { useQuery } from '@tanstack/react-query'
import { stockApi, StockDetailItem } from '@/api/stock'
import { consumableTypeApi } from '@/api/consumableType'

export default function StockDetail() {
  const [searchName, setSearchName] = useState('')
  const [typeId, setTypeId] = useState<number | undefined>()
  const [isIn, setIsIn] = useState<number | undefined>()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const { data, isLoading } = useQuery({
    queryKey: ['stock-detail', page, pageSize, searchName, typeId, isIn],
    queryFn: async () => {
      const response = await stockApi.getDetail({
        page,
        size: pageSize,
        name: searchName || undefined,
        type_id: typeId,
        is_in: isIn,
      })
      return response.data
    },
  })

  const { data: types } = useQuery({
    queryKey: ['consumable-types-all'],
    queryFn: async () => {
      const response = await consumableTypeApi.getAll()
      return response.data
    },
  })

  const handleReset = () => {
    setSearchName('')
    setTypeId(undefined)
    setIsIn(undefined)
    setPage(1)
  }

  const columns = [
    { title: '物品名称', dataIndex: 'name', key: 'name' },
    { title: '型号', dataIndex: 'type', key: 'type' },
    {
      title: '物品类型',
      dataIndex: 'type_name',
      key: 'type_name',
      render: (text: string) => text && <Tag color="blue">{text}</Tag>,
    },
    {
      title: '数量',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number, record: StockDetailItem) => (
        <span className={record.is_in === 1 ? 'text-green-500' : 'text-red-500'}>
          {record.is_in === 1 ? '▲' : '▼'} {amount}
        </span>
      ),
    },
    {
      title: '物品状态',
      dataIndex: 'status_text',
      key: 'status_text',
      render: (text: string, record: StockDetailItem) => (
        <Tag color={record.is_in === 1 ? 'green' : 'red'}>{text}</Tag>
      ),
    },
    { title: '单位', dataIndex: 'unit', key: 'unit' },
    {
      title: '单价',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => `¥${price.toFixed(2)}`,
    },
    { title: '操作时间', dataIndex: 'create_date', key: 'create_date', width: 180 },
  ]

  return (
    <Card>
      <div className="mb-4 flex flex-wrap gap-4">
        <Input
          placeholder="物品名称"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          style={{ width: 200 }}
          prefix={<SearchOutlined />}
        />
        <Select
          placeholder="操作类型"
          value={isIn}
          onChange={setIsIn}
          allowClear
          style={{ width: 120 }}
          options={[
            { label: '入库', value: 1 },
            { label: '出库', value: 2 },
          ]}
        />
        <Select
          placeholder="物品类型"
          value={typeId}
          onChange={setTypeId}
          allowClear
          style={{ width: 150 }}
          options={types?.map((t) => ({ label: t.name, value: t.id }))}
        />
        <Space>
          <Button type="primary" onClick={() => setPage(1)}>
            查询
          </Button>
          <Button onClick={handleReset}>重置</Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={data?.records}
        rowKey="id"
        loading={isLoading}
        pagination={{
          current: page,
          pageSize,
          total: data?.total,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条记录`,
          onChange: (p, ps) => {
            setPage(p)
            setPageSize(ps)
          },
        }}
      />
    </Card>
  )
}
