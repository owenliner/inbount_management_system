import { useState } from 'react'
import { Table, Button, Space, Modal, Form, Input, message, Popconfirm, Card } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { warehouseApi, Warehouse, WarehouseCreateParams } from '@/api/warehouse'

export default function WarehouseList() {
  const [searchName, setSearchName] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null)
  const [form] = Form.useForm()
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['warehouses', page, pageSize, searchName],
    queryFn: async () => {
      const response = await warehouseApi.getList({
        page,
        size: pageSize,
        name: searchName || undefined,
      })
      return response.data
    },
  })

  const createMutation = useMutation({
    mutationFn: (params: WarehouseCreateParams) => warehouseApi.create(params),
    onSuccess: () => {
      message.success('创建成功')
      setModalOpen(false)
      form.resetFields()
      queryClient.invalidateQueries({ queryKey: ['warehouses'] })
    },
    onError: (error: Error) => {
      message.error(error.message)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, params }: { id: number; params: WarehouseCreateParams }) =>
      warehouseApi.update(id, params),
    onSuccess: () => {
      message.success('更新成功')
      setModalOpen(false)
      setEditingWarehouse(null)
      form.resetFields()
      queryClient.invalidateQueries({ queryKey: ['warehouses'] })
    },
    onError: (error: Error) => {
      message.error(error.message)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => warehouseApi.delete(id),
    onSuccess: () => {
      message.success('删除成功')
      queryClient.invalidateQueries({ queryKey: ['warehouses'] })
    },
    onError: (error: Error) => {
      message.error(error.message)
    },
  })

  const handleAdd = () => {
    setEditingWarehouse(null)
    form.resetFields()
    setModalOpen(true)
  }

  const handleEdit = (record: Warehouse) => {
    setEditingWarehouse(record)
    form.setFieldsValue(record)
    setModalOpen(true)
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      if (editingWarehouse) {
        updateMutation.mutate({ id: editingWarehouse.id, params: values })
      } else {
        createMutation.mutate(values)
      }
    } catch {
      // Form validation failed
    }
  }

  const columns = [
    { title: '库房编号', dataIndex: 'code', key: 'code', width: 150 },
    { title: '库房名称', dataIndex: 'name', key: 'name' },
    { title: '负责人', dataIndex: 'principal', key: 'principal' },
    { title: '联系方式', dataIndex: 'contact', key: 'contact' },
    { title: '地址', dataIndex: 'address', key: 'address' },
    { title: '创建时间', dataIndex: 'create_date', key: 'create_date', width: 180 },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_: unknown, record: Warehouse) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定删除该库房吗？"
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
            placeholder="库房名称"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            style={{ width: 200 }}
            prefix={<SearchOutlined />}
          />
          <Button type="primary" onClick={() => setPage(1)}>
            查询
          </Button>
          <Button onClick={() => setSearchName('')}>重置</Button>
        </Space>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新增库房
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
        title={editingWarehouse ? '编辑库房' : '新增库房'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => {
          setModalOpen(false)
          setEditingWarehouse(null)
          form.resetFields()
        }}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="库房名称"
            rules={[{ required: true, message: '请输入库房名称' }]}
          >
            <Input placeholder="请输入库房名称" />
          </Form.Item>
          <Form.Item name="principal" label="负责人">
            <Input placeholder="请输入负责人" />
          </Form.Item>
          <Form.Item name="contact" label="联系方式">
            <Input placeholder="请输入联系方式" />
          </Form.Item>
          <Form.Item name="address" label="地址">
            <Input placeholder="请输入地址" />
          </Form.Item>
          <Form.Item name="content" label="备注">
            <Input.TextArea rows={3} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  )
}
