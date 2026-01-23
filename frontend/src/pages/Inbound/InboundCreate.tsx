import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Card,
  Form,
  Input,
  Select,
  Button,
  Table,
  InputNumber,
  message,
  Divider,
} from 'antd'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons'
import { useQuery, useMutation } from '@tanstack/react-query'
import { warehouseApi } from '@/api/warehouse'
import { consumableTypeApi } from '@/api/consumableType'
import { unitApi } from '@/api/unit'
import { inboundApi, InboundCreateParams, InboundCreateItem } from '@/api/inbound'

interface ItemRow extends InboundCreateItem {
  key: string
}

export default function InboundCreate() {
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [items, setItems] = useState<ItemRow[]>([
    { key: '1', name: '', type: '', type_id: undefined, amount: 1, unit: '', price: 0 },
  ])

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

  const { data: units } = useQuery({
    queryKey: ['units-all'],
    queryFn: async () => {
      const response = await unitApi.getAll()
      return response.data
    },
  })

  const createMutation = useMutation({
    mutationFn: (params: InboundCreateParams) => inboundApi.create(params),
    onSuccess: (response) => {
      message.success(`入库成功，单号: ${response.data.num}`)
      navigate('/inbound')
    },
    onError: (error: Error) => {
      message.error(error.message)
    },
  })

  const handleAddItem = () => {
    const newItem: ItemRow = {
      key: Date.now().toString(),
      name: '',
      type: '',
      type_id: undefined,
      amount: 1,
      unit: '',
      price: 0,
    }
    setItems([...items, newItem])
  }

  const handleRemoveItem = (key: string) => {
    if (items.length === 1) {
      message.warning('至少需要一个物品')
      return
    }
    setItems(items.filter((item) => item.key !== key))
  }

  const handleItemChange = (key: string, field: keyof ItemRow, value: unknown) => {
    setItems(
      items.map((item) => (item.key === key ? { ...item, [field]: value } : item))
    )
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()

      // Validate items
      const validItems = items.filter((item) => item.name && item.amount > 0)
      if (validItems.length === 0) {
        message.error('请至少添加一个有效的物品')
        return
      }

      const params: InboundCreateParams = {
        stock_id: values.stock_id,
        custodian: values.custodian,
        put_user: values.put_user,
        content: values.content,
        items: validItems.map(({ key, ...item }) => item),
      }

      createMutation.mutate(params)
    } catch {
      // Form validation failed
    }
  }

  const columns = [
    {
      title: '物品名称',
      dataIndex: 'name',
      key: 'name',
      render: (_: unknown, record: ItemRow) => (
        <Input
          value={record.name}
          onChange={(e) => handleItemChange(record.key, 'name', e.target.value)}
          placeholder="物品名称"
        />
      ),
    },
    {
      title: '型号',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (_: unknown, record: ItemRow) => (
        <Input
          value={record.type}
          onChange={(e) => handleItemChange(record.key, 'type', e.target.value)}
          placeholder="型号"
        />
      ),
    },
    {
      title: '所属类型',
      dataIndex: 'type_id',
      key: 'type_id',
      width: 150,
      render: (_: unknown, record: ItemRow) => (
        <Select
          value={record.type_id}
          onChange={(value) => handleItemChange(record.key, 'type_id', value)}
          placeholder="选择类型"
          allowClear
          style={{ width: '100%' }}
          options={types?.map((t) => ({ label: t.name, value: t.id }))}
        />
      ),
    },
    {
      title: '数量',
      dataIndex: 'amount',
      key: 'amount',
      width: 100,
      render: (_: unknown, record: ItemRow) => (
        <InputNumber
          value={record.amount}
          onChange={(value) => handleItemChange(record.key, 'amount', value || 0)}
          min={1}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: '单位',
      dataIndex: 'unit',
      key: 'unit',
      width: 120,
      render: (_: unknown, record: ItemRow) => (
        <Select
          value={record.unit}
          onChange={(value) => handleItemChange(record.key, 'unit', value)}
          placeholder="单位"
          allowClear
          style={{ width: '100%' }}
          options={units?.map((u) => ({ label: u.name, value: u.name }))}
        />
      ),
    },
    {
      title: '单价',
      dataIndex: 'price',
      key: 'price',
      width: 120,
      render: (_: unknown, record: ItemRow) => (
        <InputNumber
          value={record.price}
          onChange={(value) => handleItemChange(record.key, 'price', value || 0)}
          min={0}
          precision={2}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (_: unknown, record: ItemRow) => (
        <Button
          type="link"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveItem(record.key)}
        />
      ),
    },
  ]

  const totalPrice = items.reduce((sum, item) => sum + (item.amount || 0) * (item.price || 0), 0)

  return (
    <Card title="采购单入库">
      <Form form={form} layout="vertical" style={{ maxWidth: 800 }}>
        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            name="stock_id"
            label="入库仓库"
            rules={[{ required: true, message: '请选择入库仓库' }]}
          >
            <Select
              placeholder="选择仓库"
              options={warehouses?.map((w) => ({ label: w.name, value: w.id }))}
            />
          </Form.Item>
          <Form.Item
            name="custodian"
            label="保管人"
            rules={[{ required: true, message: '请输入保管人' }]}
          >
            <Input placeholder="保管人" />
          </Form.Item>
          <Form.Item
            name="put_user"
            label="入库人"
            rules={[{ required: true, message: '请输入入库人' }]}
          >
            <Input placeholder="入库人" />
          </Form.Item>
          <Form.Item name="content" label="备注消息">
            <Input.TextArea rows={2} placeholder="备注" />
          </Form.Item>
        </div>
      </Form>

      <Divider />

      <div className="mb-4 flex justify-between items-center">
        <span className="text-lg font-bold">物品明细</span>
        <span className="text-lg">
          总金额: <span className="text-red-500">¥{totalPrice.toFixed(2)}</span>
        </span>
      </div>

      <Table
        columns={columns}
        dataSource={items}
        rowKey="key"
        pagination={false}
        size="small"
      />

      <Button
        type="dashed"
        onClick={handleAddItem}
        block
        icon={<PlusOutlined />}
        className="mt-4"
      >
        新增物品
      </Button>

      <div className="mt-6 flex justify-end gap-2">
        <Button onClick={() => navigate('/inbound')}>取消</Button>
        <Button type="primary" onClick={handleSubmit} loading={createMutation.isPending}>
          提交
        </Button>
      </div>
    </Card>
  )
}
