import { useState } from 'react'
import { Table, Button, Space, Modal, Form, Input, message, Popconfirm, Card, Tag } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { bulletinApi, Bulletin, BulletinCreateParams } from '@/api/bulletin'

export default function BulletinList() {
  const [searchTitle, setSearchTitle] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingBulletin, setEditingBulletin] = useState<Bulletin | null>(null)
  const [form] = Form.useForm()
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['bulletins', page, pageSize, searchTitle],
    queryFn: async () => {
      const response = await bulletinApi.getList({
        page,
        size: pageSize,
        title: searchTitle || undefined,
      })
      return response.data
    },
  })

  const createMutation = useMutation({
    mutationFn: (params: BulletinCreateParams) => bulletinApi.create(params),
    onSuccess: () => {
      message.success('创建成功')
      setModalOpen(false)
      form.resetFields()
      queryClient.invalidateQueries({ queryKey: ['bulletins'] })
    },
    onError: (error: Error) => {
      message.error(error.message)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, params }: { id: number; params: BulletinCreateParams }) =>
      bulletinApi.update(id, params),
    onSuccess: () => {
      message.success('更新成功')
      setModalOpen(false)
      setEditingBulletin(null)
      form.resetFields()
      queryClient.invalidateQueries({ queryKey: ['bulletins'] })
    },
    onError: (error: Error) => {
      message.error(error.message)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => bulletinApi.delete(id),
    onSuccess: () => {
      message.success('删除成功')
      queryClient.invalidateQueries({ queryKey: ['bulletins'] })
    },
    onError: (error: Error) => {
      message.error(error.message)
    },
  })

  const handleAdd = () => {
    setEditingBulletin(null)
    form.resetFields()
    setModalOpen(true)
  }

  const handleEdit = (record: Bulletin) => {
    setEditingBulletin(record)
    form.setFieldsValue(record)
    setModalOpen(true)
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      if (editingBulletin) {
        updateMutation.mutate({ id: editingBulletin.id, params: values })
      } else {
        createMutation.mutate(values)
      }
    } catch {
      // Form validation failed
    }
  }

  const columns = [
    { title: '标题', dataIndex: 'title', key: 'title' },
    { title: '作者', dataIndex: 'author', key: 'author', width: 120 },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: number) => (
        <Tag color={status === 1 ? 'green' : 'red'}>
          {status === 1 ? '启用' : '禁用'}
        </Tag>
      ),
    },
    { title: '创建时间', dataIndex: 'create_date', key: 'create_date', width: 180 },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_: unknown, record: Bulletin) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm
            title="确定删除该公告吗？"
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
            placeholder="公告标题"
            value={searchTitle}
            onChange={(e) => setSearchTitle(e.target.value)}
            style={{ width: 200 }}
            prefix={<SearchOutlined />}
          />
          <Button type="primary" onClick={() => setPage(1)}>查询</Button>
          <Button onClick={() => setSearchTitle('')}>重置</Button>
        </Space>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新增公告
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
        title={editingBulletin ? '编辑公告' : '新增公告'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => { setModalOpen(false); setEditingBulletin(null); form.resetFields() }}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="标题" rules={[{ required: true, message: '请输入标题' }]}>
            <Input placeholder="请输入公告标题" />
          </Form.Item>
          <Form.Item name="author" label="作者">
            <Input placeholder="请输入作者" />
          </Form.Item>
          <Form.Item name="content" label="内容">
            <Input.TextArea rows={6} placeholder="请输入公告内容" />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  )
}
