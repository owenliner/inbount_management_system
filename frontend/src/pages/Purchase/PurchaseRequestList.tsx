import { useState } from 'react'
import { Table, Button, Space, Input, Select, Card, Tag, message, Popconfirm } from 'antd'
import { SearchOutlined, DeleteOutlined } from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient, ApiResponse, PaginatedData } from '@/api/client'

interface PurchaseRequest {
  id: number
  num: string
  user_id: number | null
  username: string | null
  content: string | null
  status: number
  total_price: number
  create_date: string | null
  approve_date: string | null
}

const purchaseRequestApi = {
  getList: async (params: {
    page?: number
    size?: number
    num?: string
    status?: number
  }): Promise<ApiResponse<PaginatedData<PurchaseRequest>>> => {
    const response = await apiClient.get<ApiResponse<PaginatedData<PurchaseRequest>>>(
      '/purchase-requests',
      { params }
    )
    return response.data
  },
  delete: async (id: number): Promise<ApiResponse<null>> => {
    const response = await apiClient.delete<ApiResponse<null>>(`/purchase-requests/${id}`)
    return response.data
  },
}

const statusMap: Record<number, { text: string; color: string }> = {
  0: { text: '待审核', color: 'orange' },
  1: { text: '已通过', color: 'green' },
  2: { text: '已拒绝', color: 'red' },
  3: { text: '已完成', color: 'blue' },
}

export default function PurchaseRequestList() {
  const [searchNum, setSearchNum] = useState('')
  const [status, setStatus] = useState<number | undefined>()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['purchase-requests', page, pageSize, searchNum, status],
    queryFn: async () => {
      const response = await purchaseRequestApi.getList({
        page,
        size: pageSize,
        num: searchNum || undefined,
        status,
      })
      return response.data
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => purchaseRequestApi.delete(id),
    onSuccess: () => {
      message.success('删除成功')
      queryClient.invalidateQueries({ queryKey: ['purchase-requests'] })
    },
    onError: (error: Error) => {
      message.error(error.message)
    },
  })

  const handleReset = () => {
    setSearchNum('')
    setStatus(undefined)
    setPage(1)
  }

  const columns = [
    { title: '采购单号', dataIndex: 'num', key: 'num', width: 180 },
    { title: '申请人', dataIndex: 'username', key: 'username' },
    {
      title: '总金额',
      dataIndex: 'total_price',
      key: 'total_price',
      render: (price: number) => `¥${price.toFixed(2)}`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (s: number) => {
        const info = statusMap[s] || { text: '未知', color: 'default' }
        return <Tag color={info.color}>{info.text}</Tag>
      },
    },
    { title: '备注', dataIndex: 'content', key: 'content', ellipsis: true },
    { title: '申请时间', dataIndex: 'create_date', key: 'create_date', width: 180 },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (_: unknown, record: PurchaseRequest) => (
        <Popconfirm
          title="确定删除该采购申请吗？"
          onConfirm={() => deleteMutation.mutate(record.id)}
        >
          <Button type="link" danger icon={<DeleteOutlined />}>
            删除
          </Button>
        </Popconfirm>
      ),
    },
  ]

  return (
    <Card>
      <div className="mb-4 flex flex-wrap gap-4">
        <Input
          placeholder="采购单号"
          value={searchNum}
          onChange={(e) => setSearchNum(e.target.value)}
          style={{ width: 180 }}
          prefix={<SearchOutlined />}
        />
        <Select
          placeholder="状态"
          value={status}
          onChange={setStatus}
          allowClear
          style={{ width: 120 }}
          options={Object.entries(statusMap).map(([k, v]) => ({
            label: v.text,
            value: Number(k),
          }))}
        />
        <Space>
          <Button type="primary" onClick={() => setPage(1)}>查询</Button>
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
          onChange: (p, ps) => { setPage(p); setPageSize(ps) },
        }}
      />
    </Card>
  )
}
