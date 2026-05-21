import { type ReactNode } from 'react';
import ReactDOM from 'react-dom/client';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import enUS from 'antd/locale/en_US';
import { App } from './app/App';
import { LocaleProvider, useLocale } from './locales/LocaleContext';

const antLocales = { 'zh-CN': zhCN, 'en-US': enUS } as const;

function AntdProvider({ children }: { children: ReactNode }) {
  const { locale } = useLocale();
  return (
    <ConfigProvider
      locale={antLocales[locale]}
      theme={{
        token: {
          colorPrimary: '#0a0a0a',
          colorInfo: '#0a0a0a',
          colorLink: '#0a0a0a',
          colorLinkHover: '#404040',
          colorLinkActive: '#000000',
          colorText: '#0a0a0a',
          colorTextSecondary: '#525252',
          colorTextTertiary: '#8c8c8c',
          colorBgContainer: '#ffffff',
          colorBgLayout: '#ffffff',
          colorBorder: '#f0f0f0',
          colorBorderSecondary: '#f0f0f0',
          borderRadius: 6,
          fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif",
          fontSize: 15,
          controlHeight: 36,
        },
        components: {
          Menu: {
            itemSelectedColor: '#0a0a0a',
            itemSelectedBg: '#f5f5f5',
            itemHoverColor: '#0a0a0a',
            itemHoverBg: '#fafafa',
            subMenuItemBg: 'transparent',
          },
          Anchor: {
            linkPaddingBlock: 4,
            linkPaddingInlineStart: 8,
          },
          Button: {
            defaultColor: '#0a0a0a',
            defaultBorderColor: '#d4d4d4',
          },
          Layout: {
            headerBg: '#ffffff',
            headerPadding: '0 24px',
            headerHeight: 56,
            siderBg: '#ffffff',
          },
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <LocaleProvider>
    <AntdProvider>
      <App />
    </AntdProvider>
  </LocaleProvider>
);
