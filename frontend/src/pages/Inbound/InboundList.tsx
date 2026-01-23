import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Table, Button, Space, Input, Card, Popconfirm, message, Modal, Descriptions, List } from 'antd'
import { PlusOutlined, SearchOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { inboundApi, InboundRecord, InboundDetail } from '@/api/inbound'

export default function InboundList() {
  const navigate = useNavigate()
  const [searchNum, setSearchNum] = useState('')
  const [searchCustodian, setSearchCustodian] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [selectedInbound, setSelectedInbound] = useState<InboundDetail | null>(null)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['inbounds', page, pageSize, searchNum, searchCustodian],
    queryFn: async () => {
      const response = await inboundApi.getList({
        page,
        size: pageSize,
        num: searchNum || undefined,
        custodian: searchCustodian || undefined,
      })
      return response.data
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => inboundApi.delete(id),
    onSuccess: () => {
      message.success('删除成功')
      queryClient.invalidateQueries({ queryKey: ['inbounds'] })
    },
    onError: (error: Error) => {
      message.error(error.message)
    },
  })

  const handleViewDetail = async (record: InboundRecord) => {
    try {
      const response = await inboundApi.getById(record.id)
      setSelectedInbound(response.data)
      setDetailModalOpen(true)
    } catch (error) {
      message.error('获取详情失败')
    }
  }

  const handleReset = () => {
    setSearchNum('')
    setSearchCustodian('')
    setPage(1)
  }

  const columns = [
    { title: '入库单号', dataIndex: 'num', key: 'num', width: 180 },
    {
      title: '入库金额',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => `¥${price.toFixed(2)}`,
    },
    { title: '保管人', dataIndex: 'custodian', key: 'custodian' },
    { title: '入库人', dataIndex: 'put_user', key: 'put_user' },
    { title: '备注', dataIndex: 'content', key: 'content', ellipsis: true },
    { title: '入库时间', dataIndex: 'create_date', key: 'create_date', width: 180 },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_: unknown, record: InboundRecord) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            详情
          </Button>
          <Popconfirm
            title="确定删除该入库记录吗？"
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

  return (
    <Card>
      <div className="mb-4 flex justify-between">
        <Space>
          <Input
            placeholder="入库单号"
            value={searchNum}
            onChange={(e) => setSearchNum(e.target.value)}
            style={{ width: 180 }}
            prefix={<SearchOutlined />}
          />
          <Input
            placeholder="保管人"
            value={searchCustodian}
            onChange={(e) => setSearchCustodian(e.target.value)}
            style={{ width: 150 }}
          />
          <Button type="primary" onClick={() => setPage(1)}>
            查询
          </Button>
          <Button onClick={handleReset}>重置</Button>
        </Space>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate('/inbound/create')}
        >
          新增入库
        </Button>
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

      <Modal
        title="入库详情"
        open={detailModalOpen}
        onCancel={() => setDetailModalOpen(false)}
        footer={null}
        width={700}
      >
        {selectedInbound && (
          <>
            <Descriptions bordered column={2} size="small" className="mb-4">
              <Descriptions.Item label="入库单号">{selectedInbound.num}</Descriptions.Item>
              <Descriptions.Item label="入库金额">
                ¥{selectedInbound.price.toFixed(2)}
              </Descriptions.Item>
              <Descriptions.Item label="保管人">{selectedInbound.custodian}</Descriptions.Item>
              <Descriptions.Item label="入库人">{selectedInbound.put_user}</Descriptions.Item>
              <Descriptions.Item label="入库时间" span={2}>
                {selectedInbound.create_date}
              </Descriptions.Item>
              <Descriptions.Item label="备注" span={2}>
                {selectedInbound.content || '-'}
              </Descriptions.Item>
            </Descriptions>

            <div className="font-bold mb-2">物品明细</div>
            <List
              size="small"
              bordered
              dataSource={selectedInbound.items}
              renderItem={(item) => (
                <List.Item>
                  <div className="flex justify-between w-full">
                    <span>{item.name}</span>
                    <span>{item.type}</span>
                    <span>数量: {item.amount}</span>
                    <span>单价: ¥{item.price.toFixed(2)}</span>
                  </div>
                </List.Item>
              )}
            />
          </>
        )}
      </Modal>
    </Card>
  )
}
