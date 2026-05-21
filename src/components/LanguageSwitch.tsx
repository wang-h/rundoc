import { Dropdown, Space } from 'antd';
import { GlobalOutlined, CheckOutlined } from '@ant-design/icons';
import { useLocale, type Locale } from '@/locales/LocaleContext';

const options: Locale[] = ['zh-CN', 'en-US'];

const localeLabels: Record<Locale, string> = {
  'zh-CN': '中文',
  'en-US': 'English',
};

export function LanguageSwitch() {
  const { t, locale, canSwitch, setLocale } = useLocale();

  if (!canSwitch) return null;

  return (
    <Dropdown
      menu={{
        items: options.map((option) => ({
          key: option,
          label: localeLabels[option],
          icon: locale === option ? <CheckOutlined /> : null,
        })),
        onClick: ({ key }) => setLocale(key as Locale),
        selectedKeys: [locale],
      }}
      trigger={['click']}
    >
      <Space style={{ cursor: 'pointer' }}>
        <GlobalOutlined />
        <span>{locale === 'zh-CN' ? t.header.languageZh : t.header.languageEn}</span>
      </Space>
    </Dropdown>
  );
}
