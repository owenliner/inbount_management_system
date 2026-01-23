import { useState } from 'react'
import { Table, Button, Space, Input, Select, Card, Tag } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { useQuery } from '@tanstack/react-query'
import { stockApi } from '@/api/stock'
import { warehouseApi } from '@/api/warehouse'
import { consumableTypeApi } from '@/api/consumableType'

export default function StockList() {
  const [searchName, setSearchName] = useState('')
  const [typeId, setTypeId] = useState<number | undefined>()
  const [stockId, setStockId] = useState<number | undefined>()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const { data, isLoading } = useQuery({
    queryKey: ['stocks', page, pageSize, searchName, typeId, stockId],
    queryFn: async () => {
      const response = await stockApi.getList({
        page,
        size: pageSize,
        name: searchName || undefined,
        type_id: typeId,
        stock_id: stockId,
      })
      return response.data
    },
  })

  const { data: warehouses } = useQuery({
    queryKey: ['warehouses-all'],
    queryFn: async () => {
      const response = await warehouseApi.getAll()
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
    setStockId(undefined)
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
      render: (amount: number) => (
        <span className={amount < 10 ? 'text-red-500 font-bold' : ''}>
          {amount}
        </span>
      ),
    },
    { title: '单位', dataIndex: 'unit', key: 'unit' },
    {
      title: '单价',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => `¥${price.toFixed(2)}`,
    },
    { title: '所属库房', dataIndex: 'storehouse_name', key: 'storehouse_name' },
    { title: '入库时间', dataIndex: 'create_date', key: 'create_date', width: 180 },
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
          placeholder="物品类型"
          value={typeId}
          onChange={setTypeId}
          allowClear
          style={{ width: 150 }}
          options={types?.map((t) => ({ label: t.name, value: t.id }))}
        />
        <Select
          placeholder="所属库房"
          value={stockId}
          onChange={setStockId}
          allowClear
          style={{ width: 150 }}
          options={warehouses?.map((w) => ({ label: w.name, value: w.id }))}
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
