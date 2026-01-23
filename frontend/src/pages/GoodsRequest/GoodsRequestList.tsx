import { useState } from 'react'
import { Table, Button, Space, Input, Select, Card, Tag, message, Popconfirm, Modal, Descriptions, Steps } from 'antd'
import { SearchOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient, ApiResponse, PaginatedData } from '@/api/client'

interface GoodsRequestItem {
  id: number
  name: string
  type: string | null
  amount: number
  stock_amount: number
  unit: string | null
  price: number
}

interface GoodsRequest {
  id: number
  num: string
  purchase_num: string | null
  user_id: number | null
  username: string | null
  content: string | null
  status: number
  status_text: string
  create_date: string | null
  approve_date: string | null
  items?: GoodsRequestItem[]
}

const goodsRequestApi = {
  getList: async (params: {
    page?: number
    size?: number
    num?: string
    status?: number
  }): Promise<ApiResponse<PaginatedData<GoodsRequest>>> => {
    const response = await apiClient.get<ApiResponse<PaginatedData<GoodsRequest>>>(
      '/goods-requests',
      { params }
    )
    return response.data
  },
  getById: async (id: number): Promise<ApiResponse<GoodsRequest>> => {
    const response = await apiClient.get<ApiResponse<GoodsRequest>>(`/goods-requests/${id}`)
    return response.data
  },
  delete: async (id: number): Promise<ApiResponse<null>> => {
    const response = await apiClient.delete<ApiResponse<null>>(`/goods-requests/${id}`)
    return response.data
  },
}

const statusMap: Record<number, { text: string; color: string }> = {
  0: { text: '已提交', color: 'blue' },
  1: { text: '正在审核', color: 'orange' },
  2: { text: '审核通过', color: 'green' },
  3: { text: '已驳回', color: 'red' },
}

export default function GoodsRequestList() {
  const [searchNum, setSearchNum] = useState('')
  const [status, setStatus] = useState<number | undefined>()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<GoodsRequest | null>(null)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['goods-requests', page, pageSize, searchNum, status],
    queryFn: async () => {
      const response = await goodsRequestApi.getList({
        page,
        size: pageSize,
        num: searchNum || undefined,
        status,
      })
      return response.data
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => goodsRequestApi.delete(id),
    onSuccess: () => {
      message.success('删除成功')
      queryClient.invalidateQueries({ queryKey: ['goods-requests'] })
    },
    onError: (error: Error) => {
      message.error(error.message)
    },
  })

  const handleViewDetail = async (record: GoodsRequest) => {
    try {
      const response = await goodsRequestApi.getById(record.id)
      setSelectedRequest(response.data)
      setDetailModalOpen(true)
    } catch {
      message.error('获取详情失败')
    }
  }

  const handleReset = () => {
    setSearchNum('')
    setStatus(undefined)
    setPage(1)
  }

  const columns = [
    { title: '申请单号', dataIndex: 'num', key: 'num', width: 180 },
    { title: '采购单', dataIndex: 'purchase_num', key: 'purchase_num' },
    { title: '申请人', dataIndex: 'username', key: 'username' },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (s: number) => {
        const info = statusMap[s] || { text: '未知', color: 'default' }
        return <Tag color={info.color}>{info.text}</Tag>
      },
    },
    { title: '申请时间', dataIndex: 'create_date', key: 'create_date', width: 180 },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_: unknown, record: GoodsRequest) => (
        <Space>
          <Button type="link" icon={<EyeOutlined />} onClick={() => handleViewDetail(record)}>
            详情
          </Button>
          <Popconfirm
            title="确定删除该申请吗？"
            onConfirm={() => deleteMutation.mutate(record.id)}
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  const getStepStatus = (s: number) => {
    if (s === 2) return 2 // Approved - all steps complete
    if (s === 1) return 1 // Reviewing - second step
    if (s === 3) return 1 // Rejected - stopped at review
    return 0 // Submitted - first step
  }

  return (
    <Card>
      <div className="mb-4 flex flex-wrap gap-4">
        <Input
          placeholder="申请单号"
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

      <Modal
        title="物品申请信息"
        open={detailModalOpen}
        onCancel={() => setDetailModalOpen(false)}
        footer={null}
        width={700}
      >
        {selectedRequest && (
          <>
            <Steps
              current={getStepStatus(selectedRequest.status)}
              status={selectedRequest.status === 3 ? 'error' : 'process'}
              className="mb-6"
              items={[
                { title: '已提交' },
                { title: '正在审核' },
                { title: '审核结果' },
              ]}
            />

            <Descriptions bordered column={2} size="small" className="mb-4" title="基础信息">
              <Descriptions.Item label="采购单">{selectedRequest.purchase_num || '-'}</Descriptions.Item>
              <Descriptions.Item label="申请人">{selectedRequest.username}</Descriptions.Item>
              <Descriptions.Item label="当前状态">{selectedRequest.status_text}</Descriptions.Item>
              <Descriptions.Item label="备注信息">{selectedRequest.content || '-'}</Descriptions.Item>
              <Descriptions.Item label="申请时间" span={2}>
                {selectedRequest.create_date}
              </Descriptions.Item>
            </Descriptions>

            <div className="font-bold mb-2">物品详情</div>
            <Table
              size="small"
              pagination={false}
              dataSource={selectedRequest.items}
              rowKey="id"
              columns={[
                { title: '物品名称', dataIndex: 'name', key: 'name' },
                { title: '型号', dataIndex: 'type', key: 'type' },
                { title: '数量', dataIndex: 'amount', key: 'amount' },
                { title: '库房数量', dataIndex: 'stock_amount', key: 'stock_amount' },
                { title: '单位', dataIndex: 'unit', key: 'unit' },
                { title: '单价', dataIndex: 'price', key: 'price', render: (p: number) => p?.toFixed(2) },
              ]}
            />
          </>
        )}
      </Modal>
    </Card>
  )
}
