import { useState } from 'react'
import { Table, Button, Space, Input, Select, Tag } from 'antd'
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons'
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
    {
      title: <span className="text-[#718EBF] font-medium">序号</span>,
      key: 'index',
      width: 70,
      render: (_: unknown, __: unknown, index: number) => (
        <span className="text-[#232323]">{String(index + 1).padStart(2, '0')}.</span>
      ),
    },
    {
      title: <span className="text-[#718EBF] font-medium">物品名称</span>,
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <span className="text-[#232323] font-medium">{text}</span>,
    },
    {
      title: <span className="text-[#718EBF] font-medium">型号规格</span>,
      dataIndex: 'type',
      key: 'type',
      render: (text: string) => <span className="text-[#232323]">{text || '-'}</span>,
    },
    {
      title: <span className="text-[#718EBF] font-medium">物品类型</span>,
      dataIndex: 'type_name',
      key: 'type_name',
      render: (text: string) =>
        text ? (
          <Tag
            style={{
              backgroundColor: 'rgba(57, 106, 255, 0.1)',
              color: '#396AFF',
              border: 'none',
              borderRadius: 6,
              padding: '2px 10px',
            }}
          >
            {text}
          </Tag>
        ) : (
          '-'
        ),
    },
    {
      title: <span className="text-[#718EBF] font-medium">库存数量</span>,
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number, record: { unit: string | null }) => (
        <span className={amount < 10 ? 'text-[#FE5C73] font-semibold' : 'text-[#232323]'}>
          {amount} {record.unit}
        </span>
      ),
    },
    {
      title: <span className="text-[#718EBF] font-medium">单价</span>,
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => <span className="text-[#232323]">¥{price?.toFixed(2) || '0.00'}</span>,
    },
    {
      title: <span className="text-[#718EBF] font-medium">所属库房</span>,
      dataIndex: 'storehouse_name',
      key: 'storehouse_name',
      render: (text: string) => <span className="text-[#232323]">{text}</span>,
    },
    {
      title: <span className="text-[#718EBF] font-medium">入库时间</span>,
      dataIndex: 'create_date',
      key: 'create_date',
      width: 180,
      render: (text: string) => <span className="text-[#718EBF]">{text}</span>,
    },
  ]

  return (
    <div
      className="bg-white rounded-[25px] p-6"
      style={{ boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.02)' }}
    >
      {/* Filter Section */}
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <Input
          placeholder="搜索物品名称..."
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          style={{
            width: 220,
            height: 45,
            borderRadius: 12,
            backgroundColor: '#F5F7FA',
            border: '1px solid #E6EFF5',
          }}
          prefix={<SearchOutlined style={{ color: '#8BA3CB' }} />}
        />
        <Select
          placeholder="物品类型"
          value={typeId}
          onChange={setTypeId}
          allowClear
          style={{ width: 160, height: 45 }}
          options={types?.map((t) => ({ label: t.name, value: t.id }))}
        />
        <Select
          placeholder="所属库房"
          value={stockId}
          onChange={setStockId}
          allowClear
          style={{ width: 160, height: 45 }}
          options={warehouses?.map((w) => ({ label: w.name, value: w.id }))}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => setPage(1)}
            style={{
              height: 45,
              borderRadius: 12,
              backgroundColor: '#1814F3',
              border: 'none',
              paddingInline: 24,
            }}
          >
            查询
          </Button>
          <Button
            onClick={handleReset}
            icon={<ReloadOutlined />}
            style={{
              height: 45,
              borderRadius: 12,
              border: '1px solid #E6EFF5',
              paddingInline: 24,
            }}
          >
            重置
          </Button>
        </Space>
      </div>

      {/* Table */}
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
          showTotal: (total) => (
            <span className="text-[#718EBF]">共 {total} 条记录</span>
          ),
          onChange: (p, ps) => {
            setPage(p)
            setPageSize(ps)
          },
        }}
        className="bankdash-table"
      />

      <style>{`
        .bankdash-table .ant-table {
          background: transparent;
        }
        .bankdash-table .ant-table-thead > tr > th {
          background: transparent !important;
          border-bottom: 1px solid #E6EFF5;
          padding: 16px 12px;
        }
        .bankdash-table .ant-table-tbody > tr > td {
          border-bottom: 1px solid #F2F4F7;
          padding: 18px 12px;
        }
        .bankdash-table .ant-table-tbody > tr:hover > td {
          background: #FAFBFC !important;
        }
        .bankdash-table .ant-table-tbody > tr:last-child > td {
          border-bottom: 1px solid #E6EFF5;
        }
        .bankdash-table .ant-pagination {
          margin-top: 20px;
        }
        .bankdash-table .ant-select-selector {
          border-radius: 12px !important;
          border-color: #E6EFF5 !important;
        }
      `}</style>
    </div>
  )
}
