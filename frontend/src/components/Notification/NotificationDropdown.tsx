import { useState } from 'react'
import { Dropdown, Badge, List, Button, Empty, Spin } from 'antd'
import {
  BellOutlined,
  InfoCircleOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons'
import { useQuery } from '@tanstack/react-query'
import { bulletinApi, Bulletin } from '@/api/bulletin'

const getIconByIndex = (index: number) => {
  const icons = [
    { icon: <InfoCircleOutlined />, color: '#396AFF', bg: 'rgba(57, 106, 255, 0.1)' },
    { icon: <WarningOutlined />, color: '#FFBB38', bg: 'rgba(255, 187, 56, 0.1)' },
    { icon: <CheckCircleOutlined />, color: '#41D4A8', bg: 'rgba(65, 212, 168, 0.1)' },
    { icon: <CloseCircleOutlined />, color: '#FE5C73', bg: 'rgba(254, 92, 115, 0.1)' },
  ]
  return icons[index % icons.length]
}

interface NotificationDropdownProps {
  onViewAll?: () => void
}

export default function NotificationDropdown({ onViewAll }: NotificationDropdownProps) {
  const [open, setOpen] = useState(false)

  // Fetch active bulletins as notifications
  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await bulletinApi.getActive(5)
      return response.data as Bulletin[]
    },
  })

  // Mark notification read (local state for demo)
  const [readIds, setReadIds] = useState<Set<number>>(new Set())

  const handleMarkRead = (id: number) => {
    setReadIds((prev) => new Set([...prev, id]))
  }

  const handleMarkAllRead = () => {
    if (notifications) {
      setReadIds(new Set(notifications.map((n) => n.id)))
    }
  }

  const unreadCount = notifications
    ? notifications.filter((n) => !readIds.has(n.id)).length
    : 0

  const dropdownContent = (
    <div
      className="bg-white rounded-2xl shadow-lg"
      style={{
        width: 360,
        maxHeight: 480,
        overflow: 'hidden',
        boxShadow: '0px 10px 40px rgba(0, 0, 0, 0.1)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#E6EFF5]">
        <span className="text-[#232323] font-semibold text-[16px]">系统消息</span>
        {unreadCount > 0 && (
          <Button type="link" onClick={handleMarkAllRead} style={{ color: '#1814F3', padding: 0 }}>
            全部已读
          </Button>
        )}
      </div>

      {/* Notification List */}
      <div style={{ maxHeight: 360, overflowY: 'auto' }}>
        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <Spin />
          </div>
        ) : notifications && notifications.length > 0 ? (
          <List
            dataSource={notifications}
            renderItem={(item, index) => {
              const isRead = readIds.has(item.id)
              const iconConfig = getIconByIndex(index)
              return (
                <div
                  className={`px-5 py-4 border-b border-[#F2F4F7] cursor-pointer hover:bg-[#FAFBFC] transition-colors ${
                    !isRead ? 'bg-[#F8FAFF]' : ''
                  }`}
                  onClick={() => handleMarkRead(item.id)}
                >
                  <div className="flex gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: iconConfig.bg }}
                    >
                      <span style={{ color: iconConfig.color, fontSize: 18 }}>
                        {iconConfig.icon}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <span
                          className={`text-[14px] ${
                            isRead ? 'text-[#718EBF]' : 'text-[#232323] font-medium'
                          }`}
                        >
                          {item.title}
                        </span>
                        {!isRead && (
                          <span className="w-2 h-2 rounded-full bg-[#FE5C73] flex-shrink-0 mt-2" />
                        )}
                      </div>
                      <p className="text-[#718EBF] text-[12px] mt-1 line-clamp-2">
                        {item.content || '暂无详情'}
                      </p>
                      <span className="text-[#B1B1B1] text-[12px] mt-2 block">
                        {item.create_date || '-'}
                      </span>
                    </div>
                  </div>
                </div>
              )
            }}
          />
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={<span className="text-[#718EBF]">暂无消息</span>}
            className="py-10"
          />
        )}
      </div>

      {/* Footer */}
      {notifications && notifications.length > 0 && (
        <div className="px-5 py-3 border-t border-[#E6EFF5]">
          <Button
            type="link"
            block
            onClick={() => {
              setOpen(false)
              onViewAll?.()
            }}
            style={{ color: '#1814F3' }}
          >
            查看全部公告
          </Button>
        </div>
      )}
    </div>
  )

  return (
    <Dropdown
      dropdownRender={() => dropdownContent}
      trigger={['click']}
      open={open}
      onOpenChange={setOpen}
      placement="bottomRight"
    >
      <Badge count={unreadCount} size="small">
        <div className="w-[50px] h-[50px] rounded-full bg-[#F5F7FA] flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors">
          <BellOutlined style={{ fontSize: 22, color: '#FE5C73' }} />
        </div>
      </Badge>
    </Dropdown>
  )
}
