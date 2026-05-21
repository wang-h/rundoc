import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout, Input, Dropdown, Space, Typography } from 'antd';
import {
  SearchOutlined,
  GithubOutlined,
  MenuOutlined,
} from '@ant-design/icons';
import searchIndex from '@/content/search-index.json';
import { useLocale } from '@/locales/LocaleContext';
import { LanguageSwitch } from './LanguageSwitch';

const { Header: AntHeader } = Layout;
const { Text } = Typography;

interface HeaderProps {
  onMenuToggle: () => void;
}

interface SearchEntry {
  title: string;
  path: string;
  section: string;
  headings: string[];
}

export function Header({ onMenuToggle }: HeaderProps) {
  const { t } = useLocale();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(true);
        setTimeout(() => inputRef.current?.focus(), 0);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const results = useMemo(() => {
    if (query.trim().length < 2) return [];
    const lower = query.toLowerCase();
    return (searchIndex as SearchEntry[])
      .filter((item) => {
        const inTitle = item.title.toLowerCase().includes(lower);
        const inSection = item.section.toLowerCase().includes(lower);
        const inHeading = item.headings.some((h) => h.toLowerCase().includes(lower));
        return inTitle || inSection || inHeading;
      })
      .slice(0, 8);
  }, [query]);

  const searchDropdownItems = useMemo(() => {
    if (results.length === 0) {
      return [{ key: 'empty', label: t.header.searchNoResults, disabled: true }];
    }
    return results.map((item) => ({
      key: item.path,
      label: (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 500 }}>{item.title}</div>
            <Text type="secondary" style={{ fontSize: 12 }}>{item.section}</Text>
          </div>
        </div>
      ),
    }));
  }, [results, t.header.searchNoResults]);

  return (
    <AntHeader
      style={{
        background: '#fff',
        borderBottom: '1px solid #f0f0f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        height: 56,
        lineHeight: '56px',
      }}
    >
      <Space size="middle">
        <MenuOutlined
          style={{ fontSize: 18, cursor: 'pointer', display: 'none' }}
          className="header-mobile-menu-btn"
          onClick={onMenuToggle}
        />
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#0a0a0a' }}>
          <img
            src={`${import.meta.env.BASE_URL}favicon.svg`}
            alt=""
            width={28}
            height={28}
            draggable={false}
          />
          <strong style={{ fontSize: 16 }}>
            {t.common.brandName} {t.common.docsSuffix}
          </strong>
        </Link>
      </Space>

      <Dropdown
        menu={{
          items: searchDropdownItems,
          onClick: ({ key }) => {
            if (key !== 'empty') {
              navigate(key);
              setSearchOpen(false);
              setQuery('');
            }
          },
        }}
        open={searchOpen && query.trim().length >= 2}
        onOpenChange={(open) => {
          if (!open) setSearchOpen(false);
        }}
        trigger={['click']}
      >
        <Input
          ref={inputRef as any}
          prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
          suffix={<Text keyboard style={{ fontSize: 11, lineHeight: '18px' }}>⌘K</Text>}
          placeholder={t.header.searchPlaceholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (e.target.value.trim().length >= 2) setSearchOpen(true);
          }}
          onFocus={() => query.trim().length >= 2 && setSearchOpen(true)}
          style={{ width: 260 }}
          className="header-desktop-search"
          allowClear
        />
      </Dropdown>

      <Space size="middle">
        <LanguageSwitch />
        <Link to="/docs/ai/api-contract" style={{ color: '#525252' }}>
          {t.header.changelogLink}
        </Link>
        <a href="https://github.com/wang-h/rundoc" target="_blank" rel="noopener noreferrer" style={{ color: '#525252' }}>
          <GithubOutlined style={{ fontSize: 18 }} />
        </a>
      </Space>
    </AntHeader>
  );
}
