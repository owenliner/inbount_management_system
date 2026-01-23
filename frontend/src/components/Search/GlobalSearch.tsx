import { useState, useEffect, useCallback } from 'react'
import { Modal, Input, List, Empty, Spin, Tag } from 'antd'
import {
  SearchOutlined,
  DatabaseOutlined,
  InboxOutlined,
  AppstoreOutlined,
  ShoppingCartOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { stockApi } from '@/api/stock'
import { warehouseApi } from '@/api/warehouse'
import debounce from 'lodash/debounce'

interface SearchResult {
  id: number
  title: string
  description: string
  type: 'stock' | 'warehouse' | 'inbound' | 'user'
  path: string
}

const getTypeConfig = (type: SearchResult['type']) => {
  const configs = {
    stock: {
      icon: <DatabaseOutlined />,
      color: '#396AFF',
      bg: 'rgba(57, 106, 255, 0.1)',
      label: '库存',
    },
    warehouse: {
      icon: <InboxOutlined />,
      color: '#16DBCC',
      bg: 'rgba(22, 219, 204, 0.1)',
      label: '库房',
    },
    inbound: {
      icon: <AppstoreOutlined />,
      color: '#FFBB38',
      bg: 'rgba(255, 187, 56, 0.1)',
      label: '入库',
    },
    user: {
      icon: <UserOutlined />,
      color: '#FF82AC',
      bg: 'rgba(255, 130, 172, 0.1)',
      label: '用户',
    },
  }
  return configs[type]
}

interface GlobalSearchProps {
  open: boolean
  onClose: () => void
}

export default function GlobalSearch({ open, onClose }: GlobalSearchProps) {
  const [keyword, setKeyword] = useState('')
  const [debouncedKeyword, setDebouncedKeyword] = useState('')
  const navigate = useNavigate()

  // Debounced search
  const debouncedSetKeyword = useCallback(
    debounce((value: string) => {
      setDebouncedKeyword(value)
    }, 300),
    []
  )

  useEffect(() => {
    debouncedSetKeyword(keyword)
    return () => {
      debouncedSetKeyword.cancel()
    }
  }, [keyword, debouncedSetKeyword])

  // Search stocks
  const { data: stockResults, isLoading: stockLoading } = useQuery({
    queryKey: ['search-stocks', debouncedKeyword],
    queryFn: async () => {
      if (!debouncedKeyword) return []
      const response = await stockApi.getList({ page: 1, size: 5, name: debouncedKeyword })
      return (response.data?.records || []).map((item) => ({
        id: item.id,
        title: item.name,
        description: `${item.type_name || '未分类'} · ${item.storehouse_name || ''}`,
        type: 'stock' as const,
        path: '/stock',
      }))
    },
    enabled: !!debouncedKeyword && open,
  })

  // Search warehouses
  const { data: warehouseResults, isLoading: warehouseLoading } = useQuery({
    queryKey: ['search-warehouses', debouncedKeyword],
    queryFn: async () => {
      if (!debouncedKeyword) return []
      const response = await warehouseApi.getList({ page: 1, size: 5, name: debouncedKeyword })
      return (response.data?.records || []).map((item) => ({
        id: item.id,
        title: item.name,
        description: item.address || '暂无地址',
        type: 'warehouse' as const,
        path: '/warehouses',
      }))
    },
    enabled: !!debouncedKeyword && open,
  })

  const isLoading = stockLoading || warehouseLoading
  const allResults: SearchResult[] = [...(stockResults || []), ...(warehouseResults || [])]

  const handleSelect = (result: SearchResult) => {
    navigate(result.path)
    onClose()
    setKeyword('')
    setDebouncedKeyword('')
  }

  const handleClose = () => {
    onClose()
    setKeyword('')
    setDebouncedKeyword('')
  }

  // Quick navigation items
  const quickNav = [
    { title: '库房物品', path: '/stock', icon: <DatabaseOutlined /> },
    { title: '入库管理', path: '/inbound', icon: <AppstoreOutlined /> },
    { title: '库房信息', path: '/warehouses', icon: <InboxOutlined /> },
    { title: '采购申请', path: '/purchase-requests', icon: <ShoppingCartOutlined /> },
  ]

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      footer={null}
      width={600}
      closable={false}
      styles={{
        body: { padding: 0 },
        content: { borderRadius: 20, overflow: 'hidden' },
      }}
    >
      {/* Search Input */}
      <div className="p-5 border-b border-[#E6EFF5]">
        <Input
          autoFocus
          size="large"
          placeholder="搜索库存、库房、入库记录..."
          prefix={<SearchOutlined style={{ color: '#8BA3CB', fontSize: 20 }} />}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          style={{
            height: 55,
            borderRadius: 15,
            backgroundColor: '#F5F7FA',
            border: 'none',
            fontSize: 16,
          }}
        />
      </div>

      {/* Search Results or Quick Nav */}
      <div style={{ maxHeight: 400, overflowY: 'auto' }}>
        {debouncedKeyword ? (
          <div className="p-4">
            <div className="text-[#718EBF] text-[13px] mb-3 px-2">搜索结果</div>
            {isLoading ? (
              <div className="flex justify-center items-center py-10">
                <Spin />
              </div>
            ) : allResults.length > 0 ? (
              <List
                dataSource={allResults}
                renderItem={(item) => {
                  const config = getTypeConfig(item.type)
                  return (
                    <div
                      className="flex items-center gap-4 p-3 rounded-xl cursor-pointer hover:bg-[#F5F7FA] transition-colors"
                      onClick={() => handleSelect(item)}
                    >
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: config.bg }}
                      >
                        <span style={{ color: config.color, fontSize: 18 }}>{config.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[#232323] font-medium truncate">{item.title}</div>
                        <div className="text-[#718EBF] text-[13px] truncate">{item.description}</div>
                      </div>
                      <Tag
                        style={{
                          backgroundColor: config.bg,
                          color: config.color,
                          border: 'none',
                          borderRadius: 6,
                        }}
                      >
                        {config.label}
                      </Tag>
                    </div>
                  )
                }}
              />
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={<span className="text-[#718EBF]">未找到相关结果</span>}
                className="py-10"
              />
            )}
          </div>
        ) : (
          <div className="p-4">
            <div className="text-[#718EBF] text-[13px] mb-3 px-2">快速导航</div>
            <div className="grid grid-cols-2 gap-3">
              {quickNav.map((item) => (
                <div
                  key={item.path}
                  className="flex items-center gap-3 p-4 rounded-xl cursor-pointer hover:bg-[#F5F7FA] transition-colors border border-[#E6EFF5]"
                  onClick={() => {
                    navigate(item.path)
                    handleClose()
                  }}
                >
                  <span style={{ color: '#396AFF', fontSize: 20 }}>{item.icon}</span>
                  <span className="text-[#232323] font-medium">{item.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-[#E6EFF5] bg-[#FAFBFC]">
        <div className="flex items-center justify-between text-[#B1B1B1] text-[12px]">
          <span>
            <kbd className="px-2 py-1 rounded bg-white border border-[#E6EFF5] mr-1">↵</kbd>
            选择
          </span>
          <span>
            <kbd className="px-2 py-1 rounded bg-white border border-[#E6EFF5] mr-1">ESC</kbd>
            关闭
          </span>
        </div>
      </div>
    </Modal>
  )
}
