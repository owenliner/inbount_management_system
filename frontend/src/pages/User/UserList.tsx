import { useState } from 'react'
import { Table, Button, Space, Input, Card, Tag, message, Popconfirm } from 'antd'
import { SearchOutlined, DeleteOutlined } from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient, ApiResponse, PaginatedData } from '@/api/client'

interface User {
  user_id: number
  username: string
  email: string | null
  mobile: string | null
  status: string
  ssex: string | null
  avatar: string | null
  create_time: string | null
  roles: string[]
}

const userApi = {
  getList: async (params: {
    page?: number
    size?: number
    username?: string
    status?: string
  }): Promise<ApiResponse<PaginatedData<User>>> => {
    const response = await apiClient.get<ApiResponse<PaginatedData<User>>>('/users', { params })
    return response.data
  },
  delete: async (id: number): Promise<ApiResponse<null>> => {
    const response = await apiClient.delete<ApiResponse<null>>(`/users/${id}`)
    return response.data
  },
}

export default function UserList() {
  const [searchUsername, setSearchUsername] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['users', page, pageSize, searchUsername],
    queryFn: async () => {
      const response = await userApi.getList({
        page,
        size: pageSize,
        username: searchUsername || undefined,
      })
      return response.data
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => userApi.delete(id),
    onSuccess: () => {
      message.success('删除成功')
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
    onError: (error: Error) => {
      message.error(error.message)
    },
  })

  const handleReset = () => {
    setSearchUsername('')
    setPage(1)
  }

  const columns = [
    { title: '用户名', dataIndex: 'username', key: 'username' },
    { title: '邮箱', dataIndex: 'email', key: 'email' },
    { title: '手机号', dataIndex: 'mobile', key: 'mobile' },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === '1' ? 'green' : 'red'}>
          {status === '1' ? '正常' : '锁定'}
        </Tag>
      ),
    },
    {
      title: '角色',
      dataIndex: 'roles',
      key: 'roles',
      render: (roles: string[]) => (
        <Space>
          {roles?.map((role) => (
            <Tag key={role} color="blue">{role}</Tag>
          ))}
        </Space>
      ),
    },
    { title: '创建时间', dataIndex: 'create_time', key: 'create_time', width: 180 },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (_: unknown, record: User) => (
        <Popconfirm
          title="确定删除该用户吗？"
          onConfirm={() => deleteMutation.mutate(record.user_id)}
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
          placeholder="用户名"
          value={searchUsername}
          onChange={(e) => setSearchUsername(e.target.value)}
          style={{ width: 200 }}
          prefix={<SearchOutlined />}
        />
        <Space>
          <Button type="primary" onClick={() => setPage(1)}>查询</Button>
          <Button onClick={handleReset}>重置</Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={data?.records}
        rowKey="user_id"
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
