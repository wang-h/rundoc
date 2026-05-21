import { useLocation, useNavigate } from 'react-router-dom';
import { Layout, Menu } from 'antd';
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

export function Sidebar({ collapsed, onCollapse }: SidebarProps) {
  const { t } = useLocale();
  const navConfig = buildNavConfig(t);
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={onCollapse}
      breakpoint="lg"
      collapsedWidth={0}
      trigger={null}
      width={260}
      style={{
        background: '#fff',
        borderRight: '1px solid #f0f0f0',
        overflow: 'auto',
        height: 'calc(100vh - 56px)',
        position: 'sticky',
        top: 56,
        left: 0,
      }}
    >
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        defaultOpenKeys={navConfig.map((s) => `section-${s.title}`)}
        items={buildMenuItems(navConfig)}
        onClick={({ key }) => {
          if (key.startsWith('/docs/')) {
            navigate(key);
            onCollapse(true);
          }
        }}
        style={{ borderRight: 0, height: '100%' }}
      />
    </Sider>
  );
}
