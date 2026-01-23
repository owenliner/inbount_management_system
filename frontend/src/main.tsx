import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import App from './App'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

// BankDash Theme Configuration
const bankDashTheme = {
  token: {
    // Primary Colors
    colorPrimary: '#1814F3',
    colorPrimaryHover: '#396AFF',
    colorPrimaryActive: '#1209AB',

    // Text Colors
    colorText: '#232323',
    colorTextSecondary: '#718EBF',
    colorTextTertiary: '#B1B1B1',

    // Background Colors
    colorBgContainer: '#FFFFFF',
    colorBgLayout: '#F5F7FA',
    colorBgElevated: '#FFFFFF',

    // Border Colors
    colorBorder: '#E6EFF5',
    colorBorderSecondary: '#F2F4F7',

    // Border Radius
    borderRadius: 10,
    borderRadiusLG: 15,
    borderRadiusSM: 8,

    // Font
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    fontSize: 14,

    // Control Heights
    controlHeight: 40,
    controlHeightLG: 50,
    controlHeightSM: 32,

    // Shadows
    boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
    boxShadowSecondary: '0px 4px 20px rgba(0, 0, 0, 0.02)',
  },
  components: {
    Button: {
      borderRadius: 12,
      controlHeight: 40,
      controlHeightLG: 50,
      primaryShadow: 'none',
    },
    Input: {
      borderRadius: 12,
      controlHeight: 45,
    },
    Select: {
      borderRadius: 12,
      controlHeight: 45,
    },
    Card: {
      borderRadius: 25,
      boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.02)',
    },
    Table: {
      headerBg: 'transparent',
      headerColor: '#718EBF',
      borderColor: '#E6EFF5',
      rowHoverBg: '#FAFBFC',
    },
    Menu: {
      itemBg: 'transparent',
      itemSelectedBg: 'transparent',
      itemSelectedColor: '#1814F3',
      itemColor: '#B1B1B1',
      itemHoverColor: '#343C6A',
      itemHoverBg: '#F5F7FA',
    },
    Modal: {
      borderRadiusLG: 25,
    },
    Message: {
      borderRadiusLG: 12,
    },
  },
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ConfigProvider locale={zhCN} theme={bankDashTheme}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ConfigProvider>
    </QueryClientProvider>
  </React.StrictMode>,
)
