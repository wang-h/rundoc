import { useState, useEffect, type ReactNode } from 'react';
import { Layout } from 'antd';
import { useLocation } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';

const { Content } = Layout;

interface DocLayoutProps {
  children: ReactNode;
}

export function DocLayout({ children }: DocLayoutProps) {
  const [collapsed, setCollapsed] = useState(true);
  const location = useLocation();

  useEffect(() => {
    setCollapsed(true);
  }, [location.pathname]);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header onMenuToggle={() => setCollapsed((v) => !v)} />
      <Layout>
        <Sidebar collapsed={collapsed} onCollapse={setCollapsed} />
        <Layout style={{ padding: '24px 32px 72px', background: '#fff' }}>
          <Content style={{ maxWidth: 1200, margin: '0 auto', width: '100%' }}>
            {children}
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
}
