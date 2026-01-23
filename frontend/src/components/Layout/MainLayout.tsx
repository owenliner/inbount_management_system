import { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Layout, Menu, Avatar, Dropdown, Breadcrumb } from 'antd'
import type { MenuProps } from 'antd'
import {
  HomeOutlined,
  DatabaseOutlined,
  AppstoreOutlined,
  ShoppingCartOutlined,
  NotificationOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons'
import { useAuthStore } from '@/store/authStore'

const { Header, Sider, Content } = Layout

const menuItems: MenuProps['items'] = [
  {
    key: '/dashboard',
    icon: <HomeOutlined />,
    label: '系统主页',
  },
  {
    key: 'warehouse-management',
    icon: <DatabaseOutlined />,
    label: '库房管理',
    children: [
      { key: '/warehouses', label: '库房信息' },
      { key: '/inbound', label: '入库管理' },
      { key: '/stock', label: '库房物品' },
      { key: '/stock/detail', label: '出入库明细' },
    ],
  },
  {
    key: 'basic-data',
    icon: <AppstoreOutlined />,
    label: '基础数据',
    children: [
      { key: '/consumable-types', label: '物品类型' },
      { key: '/units', label: '计量单位' },
    ],
  },
  {
    key: 'purchase-management',
    icon: <ShoppingCartOutlined />,
    label: '采购管理',
    children: [
      { key: '/purchase-requests', label: '采购申请' },
      { key: '/goods-requests', label: '物品审批' },
    ],
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
]

const breadcrumbNameMap: Record<string, string> = {
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
}

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthStore()

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    navigate(key)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ]

  // Generate breadcrumb items
  const pathSnippets = location.pathname.split('/').filter((i) => i)
  const breadcrumbItems = [
    {
      key: 'home',
      title: (
        <>
          <HomeOutlined />
          <span>主页</span>
        </>
      ),
      href: '/',
    },
    ...pathSnippets.map((_, index) => {
      const url = `/${pathSnippets.slice(0, index + 1).join('/')}`
      return {
        key: url,
        title: breadcrumbNameMap[url] || url,
      }
    }),
  ]

  // Find open keys based on current path
  const findOpenKeys = (path: string): string[] => {
    for (const item of menuItems || []) {
      if (item && 'children' in item && item.children) {
        for (const child of item.children) {
          if (child && 'key' in child && child.key === path) {
            return [item.key as string]
          }
        }
      }
    }
    return []
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={220}
        style={{
          background: 'linear-gradient(180deg, #1890ff 0%, #096dd9 100%)',
        }}
      >
        <div className="flex items-center justify-center h-16 text-white text-lg font-bold">
          {collapsed ? '仓储' : '仓储管理系统'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          defaultOpenKeys={findOpenKeys(location.pathname)}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ background: 'transparent', borderRight: 0 }}
        />
      </Sider>
      <Layout>
        <Header className="flex items-center justify-between bg-white px-4 shadow-sm">
          <div className="flex items-center">
            {collapsed ? (
              <MenuUnfoldOutlined
                className="text-lg cursor-pointer"
                onClick={() => setCollapsed(false)}
              />
            ) : (
              <MenuFoldOutlined
                className="text-lg cursor-pointer"
                onClick={() => setCollapsed(true)}
              />
            )}
          </div>
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <div className="flex items-center cursor-pointer">
              <Avatar icon={<UserOutlined />} src={user?.avatar} />
              <span className="ml-2">{user?.username}</span>
            </div>
          </Dropdown>
        </Header>
        <div className="px-4 py-2 bg-white border-b">
          <Breadcrumb items={breadcrumbItems} />
        </div>
        <Content className="m-4 p-4 bg-white rounded-lg min-h-[280px]">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}
