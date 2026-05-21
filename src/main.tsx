import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import enUS from 'antd/locale/en_US';
import { App } from './app/App';
import { LocaleProvider, useLocale } from './locales/LocaleContext';

const antLocales = { 'zh-CN': zhCN, 'en-US': enUS } as const;

function AntdProvider({ children }: { children: React.ReactNode }) {
  const { locale } = useLocale();
  return (
    <ConfigProvider
      locale={antLocales[locale]}
      theme={{
        token: {
          colorPrimary: '#0a0a0a',
          borderRadius: 6,
          fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif",
          fontSize: 15,
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <LocaleProvider>
      <AntdProvider>
        <App />
      </AntdProvider>
    </LocaleProvider>
  </React.StrictMode>
);
