import { useState } from 'react'
import { Table, Button, Space, Modal, Form, Input, message, Popconfirm, Card } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { unitApi, Unit, UnitCreateParams } from '@/api/unit'

export default function UnitList() {
  const [searchName, setSearchName] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null)
  const [form] = Form.useForm()
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['units', page, pageSize, searchName],
    queryFn: async () => {
      const response = await unitApi.getList({
        page,
        size: pageSize,
        name: searchName || undefined,
      })
      return response.data
    },
  })

  const createMutation = useMutation({
    mutationFn: (params: UnitCreateParams) => unitApi.create(params),
    onSuccess: () => {
      message.success('创建成功')
      setModalOpen(false)
      form.resetFields()
      queryClient.invalidateQueries({ queryKey: ['units'] })
    },
    onError: (error: Error) => {
      message.error(error.message)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, params }: { id: number; params: UnitCreateParams }) =>
      unitApi.update(id, params),
    onSuccess: () => {
      message.success('更新成功')
      setModalOpen(false)
      setEditingUnit(null)
      form.resetFields()
      queryClient.invalidateQueries({ queryKey: ['units'] })
    },
    onError: (error: Error) => {
      message.error(error.message)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => unitApi.delete(id),
    onSuccess: () => {
      message.success('删除成功')
      queryClient.invalidateQueries({ queryKey: ['units'] })
    },
    onError: (error: Error) => {
      message.error(error.message)
    },
  })

  const handleAdd = () => {
    setEditingUnit(null)
    form.resetFields()
    setModalOpen(true)
  }

  const handleEdit = (record: Unit) => {
    setEditingUnit(record)
    form.setFieldsValue(record)
    setModalOpen(true)
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      if (editingUnit) {
        updateMutation.mutate({ id: editingUnit.id, params: values })
      } else {
        createMutation.mutate(values)
      }
    } catch {
      // Form validation failed
    }
  }

  const columns = [
    { title: '单位名称', dataIndex: 'name', key: 'name' },
    { title: '备注', dataIndex: 'remark', key: 'remark', ellipsis: true },
    { title: '创建时间', dataIndex: 'create_date', key: 'create_date', width: 180 },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_: unknown, record: Unit) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm
            title="确定删除该单位吗？"
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
            placeholder="单位名称"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            style={{ width: 200 }}
            prefix={<SearchOutlined />}
          />
          <Button type="primary" onClick={() => setPage(1)}>查询</Button>
          <Button onClick={() => setSearchName('')}>重置</Button>
        </Space>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新增单位
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
          onChange: (p, ps) => { setPage(p); setPageSize(ps) },
        }}
      />

      <Modal
        title={editingUnit ? '编辑单位' : '新增单位'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => { setModalOpen(false); setEditingUnit(null); form.resetFields() }}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="单位名称" rules={[{ required: true, message: '请输入单位名称' }]}>
            <Input placeholder="请输入单位名称" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={3} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  )
}
