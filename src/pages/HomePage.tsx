import { Link } from 'react-router-dom';
import {
  Layout,
  Typography,
  Button,
  Card,
  Space,
  Row,
  Col,
  Divider,
} from 'antd';
import {
  ArrowUpOutlined,
  FileTextOutlined,
  BookOutlined,
  BulbOutlined,
  CodeOutlined,
  CompassOutlined,
  GithubOutlined,
  InboxOutlined,
  DatabaseOutlined,
  RocketOutlined,
  SendOutlined,
  StarOutlined,
  TagsOutlined,
  TeamOutlined,
  ThunderboltOutlined,
  EyeOutlined,
  ApartmentOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';
import { LanguageSwitch } from '@/components/LanguageSwitch';
import { buildNavConfig } from '@/utils/nav-config';
import { useLocale } from '@/locales/LocaleContext';

const { Header, Content } = Layout;
const { Title, Paragraph, Text } = Typography;

const sectionTitleIcon: Record<string, React.ReactNode> = {
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

const audiencePathIcon: Record<string, React.ReactNode> = {
  '/docs/guide/writing-docs': <ApartmentOutlined style={{ fontSize: 24 }} />,
  '/docs/architecture': <CodeOutlined style={{ fontSize: 24 }} />,
  '/docs/ai/api-contract': <BulbOutlined style={{ fontSize: 24 }} />,
  '/docs/overview': <CompassOutlined style={{ fontSize: 24 }} />,
};

const capabilityIcons: React.ReactNode[] = [
  <InboxOutlined key="inbox" />,
  <EyeOutlined key="eye" />,
  <TagsOutlined key="tags" />,
  <ArrowUpOutlined key="trending" />,
  <SendOutlined key="send" />,
];

export function HomePage() {
  const { t } = useLocale();
  const navConfig = buildNavConfig(t);
  const { home: h, homeAudiences, homeCapabilities, common } = t;

  return (
    <Layout style={{ minHeight: '100vh', background: '#fff' }}>
      <Header
        style={{
          background: '#fff',
          borderBottom: '1px solid #f0f0f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 32px',
          height: 56,
          lineHeight: '56px',
        }}
      >
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#0a0a0a' }}>
          <img
            src={`${import.meta.env.BASE_URL}favicon.svg`}
            alt=""
            width={28}
            height={28}
            draggable={false}
          />
          <strong style={{ fontSize: 16 }}>
            {common.brandName} {common.docsSuffix}
          </strong>
        </Link>
        <Space size="middle" className="home-page-nav-desktop">
          <Link to="/docs/overview" style={{ color: '#525252' }}><BookOutlined /> {h.navOverview}</Link>
          <Link to="/docs/quick-start" style={{ color: '#525252' }}><ThunderboltOutlined /> {h.navQuickStart}</Link>
          <Link to="/docs/ai/api-contract" style={{ color: '#525252' }}><CodeOutlined /> {h.navDevelopers}</Link>
          <a href="https://github.com/wang-h/rundoc" target="_blank" rel="noopener noreferrer" style={{ color: '#525252' }}>
            <GithubOutlined /> {h.navSource}
          </a>
          <LanguageSwitch />
        </Space>
      </Header>

      <Content style={{ maxWidth: 1200, margin: '0 auto', padding: '64px 24px', width: '100%' }}>
        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: 72 }}>
          <Space style={{ marginBottom: 16 }}>
            <StarOutlined />
            <Text type="secondary">{h.heroEyebrow}</Text>
          </Space>
          <Title level={1} style={{ fontSize: 36, lineHeight: 1.3, marginBottom: 20 }}>
            {h.heroTitle}
          </Title>
          <Paragraph
            style={{ fontSize: 16, color: '#595959', maxWidth: 720, margin: '0 auto 32px' }}
          >
            {h.heroLead}
          </Paragraph>
          <Space size="middle" wrap>
            <Link to="/docs/quick-start">
              <Button type="primary" size="large" icon={<RocketOutlined />}>
                {h.actionPrimary}
              </Button>
            </Link>
            <Link to="/docs/overview">
              <Button size="large" icon={<BookOutlined />}>
                {h.actionSecondary}
              </Button>
            </Link>
          </Space>
        </div>

        <Divider style={{ margin: '0 0 64px' }} />

        {/* Panels */}
        <Row gutter={[24, 24]} style={{ marginBottom: 64 }}>
          <Col xs={24} lg={12}>
            <Card
              title={
                <Space>
                  <AppstoreOutlined />
                  <span>{h.panelCapabilities}</span>
                </Space>
              }
              style={{ height: '100%' }}
              styles={{ body: { padding: '16px 24px' } }}
            >
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {homeCapabilities.map((item, i) => (
                  <li
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 10,
                      padding: '8px 0',
                      borderBottom: i < homeCapabilities.length - 1 ? '1px solid #f5f5f5' : 'none',
                    }}
                  >
                    <span style={{ color: '#8c8c8c', marginTop: 2 }}>
                      {capabilityIcons[i] ?? <FileTextOutlined />}
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card
              title={
                <Space>
                  <TeamOutlined />
                  <span>{h.panelStart}</span>
                </Space>
              }
              style={{ height: '100%' }}
              styles={{ body: { padding: '16px 24px' } }}
            >
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                {homeAudiences.map((item) => (
                  <Link key={item.path} to={item.path} style={{ color: 'inherit' }}>
                    <Card
                      hoverable
                      size="small"
                      style={{ border: '1px solid #f0f0f0' }}
                    >
                      <div style={{ display: 'flex', gap: 12 }}>
                        <div style={{ color: '#0a0a0a', minWidth: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {audiencePathIcon[item.path] ?? <FileTextOutlined style={{ fontSize: 24 }} />}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <strong>{item.title}</strong>
                            <ArrowUpOutlined style={{ color: '#bfbfbf' }} />
                          </div>
                          <Paragraph
                            style={{ margin: '4px 0 0', color: '#8c8c8c', fontSize: 13, lineHeight: 1.5 }}
                            ellipsis={{ rows: 2 }}
                          >
                            {item.description}
                          </Paragraph>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </Space>
            </Card>
          </Col>
        </Row>

        {/* Section blocks */}
        {navConfig
          .filter((section) => section.title !== h.excludeNavSection)
          .map((section) => (
            <div key={section.title} style={{ marginBottom: 48 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <span style={{ color: '#8c8c8c' }}>
                  {sectionTitleIcon[section.title] ?? <FileTextOutlined />}
                </span>
                <Title level={4} style={{ margin: 0 }}>{section.title}</Title>
              </div>
              <Row gutter={[16, 16]}>
                {section.items.map((item) => (
                  <Col key={item.path} xs={12} sm={8} md={6}>
                    <Link to={item.path} style={{ color: 'inherit' }}>
                      <Card hoverable size="small" style={{ textAlign: 'center' }}>
                        <div style={{ fontWeight: 500 }}>{item.title}</div>
                        <Text type="secondary" style={{ fontSize: 12 }}>{item.label}</Text>
                      </Card>
                    </Link>
                  </Col>
                ))}
              </Row>
            </div>
          ))}
      </Content>
    </Layout>
  );
}
