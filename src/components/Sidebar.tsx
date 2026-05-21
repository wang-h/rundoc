import { useLocation, useNavigate } from 'react-router-dom';
import { Layout, Menu, Drawer } from 'antd';
import {
  CompassOutlined,
  EyeOutlined,
  BookOutlined,
  BulbOutlined,
  DatabaseOutlined,
} from '@ant-design/icons';
import { buildNavConfig } from '@/utils/nav-config';
import { useLocale } from '@/locales/LocaleContext';
import type { NavSection } from '@/utils/types';

const { Sider } = Layout;

const sectionIcons: Record<string, React.ReactNode> = {
  '开始': <CompassOutlined />,
  'Start': <CompassOutlined />,
  '项目观察': <EyeOutlined />,
  'Project Watch': <EyeOutlined />,
  '使用指南': <BookOutlined />,
  'Guides': <BookOutlined />,
  'AI 原生': <BulbOutlined />,
  'AI-native': <BulbOutlined />,
  '参考': <DatabaseOutlined />,
  'Reference': <DatabaseOutlined />,
};

interface SidebarProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
}

function buildMenuItems(navConfig: NavSection[]) {
  return navConfig.map((section) => ({
    key: `section-${section.title}`,
    icon: sectionIcons[section.title],
    label: section.title,
    children: section.items
      .filter((item) => item.path !== '/')
      .map((item) => ({
        key: item.path,
        label: item.title,
      })),
  }));
}

function SidebarMenu({ navConfig, onSelect }: { navConfig: NavSection[]; onSelect: (key: string) => void }) {
  const location = useLocation();
  return (
    <Menu
      mode="inline"
      selectedKeys={[location.pathname]}
      defaultOpenKeys={navConfig.map((s) => `section-${s.title}`)}
      items={buildMenuItems(navConfig)}
      onClick={({ key }) => {
        if (key.startsWith('/docs/')) {
          onSelect(key);
        }
      }}
      style={{ borderRight: 0, height: '100%' }}
    />
  );
}

export function Sidebar({ collapsed, onCollapse }: SidebarProps) {
  const { t } = useLocale();
  const navConfig = buildNavConfig(t);
  const navigate = useNavigate();

  const handleSelect = (key: string) => {
    navigate(key);
    onCollapse(true);
  };

  return (
    <>
      {/* Desktop: fixed Sider, always visible */}
      <Sider
        width={260}
        trigger={null}
        breakpoint="lg"
        collapsedWidth={0}
        style={{
          background: '#fff',
          borderRight: '1px solid #f0f0f0',
          overflow: 'auto',
          height: 'calc(100vh - 56px)',
          position: 'sticky',
          top: 56,
          left: 0,
        }}
        className="sidebar-desktop"
      >
        <SidebarMenu navConfig={navConfig} onSelect={handleSelect} />
      </Sider>

      {/* Mobile: Drawer overlay */}
      <Drawer
        placement="left"
        open={!collapsed}
        onClose={() => onCollapse(true)}
        width={280}
        title={null}
        closable={false}
        styles={{
          body: { padding: 0 },
          header: { display: 'none' },
        }}
        className="sidebar-mobile"
      >
        <SidebarMenu navConfig={navConfig} onSelect={handleSelect} />
      </Drawer>
    </>
  );
}
