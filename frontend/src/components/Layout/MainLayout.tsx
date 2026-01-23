import { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Layout, Menu, Avatar, Dropdown, Input } from 'antd'
import type { MenuProps } from 'antd'
import {
  HomeOutlined,
  DatabaseOutlined,
  AppstoreOutlined,
  ShoppingCartOutlined,
  NotificationOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  SearchOutlined,
} from '@ant-design/icons'
import { useAuthStore } from '@/store/authStore'
import NotificationDropdown from '@/components/Notification/NotificationDropdown'
import GlobalSearch from '@/components/Search/GlobalSearch'

const { Header, Sider, Content } = Layout

const menuItems: MenuProps['items'] = [
  {
    key: '/dashboard',
    icon: <HomeOutlined />,
    label: '系统主页',
  },
  {
    key: '/warehouses',
    icon: <DatabaseOutlined />,
    label: '库房信息',
  },
  {
    key: '/inbound',
    icon: <AppstoreOutlined />,
    label: '入库管理',
  },
  {
    key: '/stock',
    icon: <DatabaseOutlined />,
    label: '库房物品',
  },
  {
    key: '/stock/detail',
    icon: <AppstoreOutlined />,
    label: '出入库明细',
  },
  {
    key: '/consumable-types',
    icon: <AppstoreOutlined />,
    label: '物品类型',
  },
  {
    key: '/units',
    icon: <AppstoreOutlined />,
    label: '计量单位',
  },
  {
    key: '/purchase-requests',
    icon: <ShoppingCartOutlined />,
    label: '采购申请',
  },
  {
    key: '/goods-requests',
    icon: <ShoppingCartOutlined />,
    label: '物品审批',
  },
  {
    key: '/bulletins',
    icon: <NotificationOutlined />,
    label: '公告管理',
  },
  {
    key: '/users',
    icon: <UserOutlined />,
    label: '用户管理',
  },
  {
    key: 'setting',
    icon: <SettingOutlined />,
    label: '系统设置',
  },
]

// Get selected menu key based on current path (handles sub-routes)
function getSelectedKey(pathname: string): string {
  // Handle sub-routes
  if (pathname.startsWith('/inbound/')) return '/inbound'
  if (pathname.startsWith('/stock/') && pathname !== '/stock/detail') return '/stock'
  return pathname
}

export default function MainLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const [searchOpen, setSearchOpen] = useState(false)

  const selectedKey = getSelectedKey(location.pathname)

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    if (key === 'setting') {
      navigate('/settings')
    } else {
      navigate(key)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleUserMenuClick: MenuProps['onClick'] = ({ key }) => {
    if (key === 'profile') {
      navigate('/profile')
    } else if (key === 'settings') {
      navigate('/settings')
    }
  }

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人信息',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '设置',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ]

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Sidebar */}
      <Sider
        trigger={null}
        width={250}
        style={{
          background: '#fff',
          borderRight: '1px solid #E6EFF5',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 100,
        }}
      >
        {/* Logo */}
        <div
          className="flex items-center h-[100px] px-6 cursor-pointer"
          onClick={() => navigate('/dashboard')}
        >
          <div className="w-10 h-10 bg-[#396AFF] rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-xl">仓</span>
          </div>
          <span className="ml-3 text-[#343C6A] font-bold text-[22px] tracking-tight">
            仓储管理
          </span>
        </div>

        {/* Menu */}
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{
            border: 'none',
            padding: '0 12px',
          }}
          className="bankdash-menu"
        />
      </Sider>

      {/* Main Content Area */}
      <Layout style={{ marginLeft: 250 }}>
        {/* Header */}
        <Header
          style={{
            background: '#fff',
            padding: '0 40px',
            height: 100,
            lineHeight: '100px',
            borderBottom: '1px solid #E6EFF5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 99,
          }}
        >
          {/* Page Title */}
          <h1 className="text-secondary text-[28px] font-semibold m-0">
            {getPageTitle(location.pathname)}
          </h1>

          {/* Right Side Actions */}
          <div className="flex items-center gap-6">
            {/* Search */}
            <Input
              prefix={<SearchOutlined style={{ color: '#8BA3CB' }} />}
              placeholder="搜索..."
              readOnly
              onClick={() => setSearchOpen(true)}
              style={{
                width: 255,
                height: 50,
                borderRadius: 40,
                backgroundColor: '#F5F7FA',
                border: 'none',
                cursor: 'pointer',
              }}
            />

            {/* Settings */}
            <div
              className="w-[50px] h-[50px] rounded-full bg-[#F5F7FA] flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors"
              onClick={() => navigate('/settings')}
            >
              <SettingOutlined style={{ fontSize: 22, color: '#718EBF' }} />
            </div>

            {/* Notifications */}
            <NotificationDropdown onViewAll={() => navigate('/bulletins')} />

            {/* User Avatar */}
            <Dropdown menu={{ items: userMenuItems, onClick: handleUserMenuClick }} placement="bottomRight" trigger={['click']}>
              <div className="flex items-center cursor-pointer">
                <Avatar
                  size={60}
                  icon={<UserOutlined />}
                  src={user?.avatar}
                  style={{ border: '3px solid #F5F7FA' }}
                />
              </div>
            </Dropdown>
          </div>
        </Header>

        {/* Content */}
        <Content
          style={{
            margin: 0,
            padding: 30,
            minHeight: 'calc(100vh - 100px)',
            background: '#F5F7FA',
          }}
        >
          <Outlet />
        </Content>
      </Layout>

      {/* Global Search Modal */}
      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Custom Styles */}
      <style>{`
        .bankdash-menu .ant-menu-item {
          height: 50px;
          line-height: 50px;
          margin: 4px 0;
          padding-left: 20px !important;
          border-radius: 10px;
          color: #B1B1B1;
          font-weight: 500;
          font-size: 16px;
        }
        .bankdash-menu .ant-menu-item:hover {
          color: #343C6A;
          background: #F5F7FA;
        }
        .bankdash-menu .ant-menu-item-selected {
          color: #1814F3 !important;
          background: transparent !important;
          position: relative;
        }
        .bankdash-menu .ant-menu-item-selected::before {
          content: '';
          position: absolute;
          left: -24px;
          top: 50%;
          transform: translateY(-50%);
          width: 5px;
          height: 50px;
          background: #2D60FF;
          border-radius: 0 10px 10px 0;
        }
        .bankdash-menu .ant-menu-item-selected .anticon {
          color: #1814F3;
        }
        .bankdash-menu .ant-menu-item .anticon {
          font-size: 20px;
          margin-right: 14px;
        }
      `}</style>
    </Layout>
  )
}

function getPageTitle(pathname: string): string {
  const titles: Record<string, string> = {
    '/dashboard': '系统主页',
    '/warehouses': '库房信息',
    '/inbound': '入库管理',
    '/inbound/create': '新增入库',
    '/stock': '库房物品',
    '/stock/detail': '出入库明细',
    '/consumable-types': '物品类型',
    '/units': '计量单位',
    '/purchase-requests': '采购申请',
    '/goods-requests': '物品审批',
    '/bulletins': '公告管理',
    '/users': '用户管理',
    '/settings': '系统设置',
    '/profile': '个人信息',
  }
  return titles[pathname] || '仓储管理系统'
}
