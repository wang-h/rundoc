import { useMemo } from 'react';
import { Anchor, Typography } from 'antd';
import { slug } from 'github-slugger';
import { useLocale } from '@/locales/LocaleContext';

const { Title } = Typography;

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TOCProps {
  content: string;
}

function extractHeadings(markdown: string): TocItem[] {
  const headings: TocItem[] = [];
  const lines = markdown.split('\n');

  for (const line of lines) {
    const match = /^(##|###)\s+(.+)$/.exec(line.trim());
    if (!match) continue;
    const level = match[1].length;
    const text = match[2].trim();
    headings.push({ id: slug(text), text, level });
  }

  return headings;
}

function buildAnchorItems(headings: TocItem[]) {
  return headings.map((h) => ({
    key: h.id,
    href: `#${h.id}`,
    title: h.text,
  }));
}

export function TOC({ content }: TOCProps) {
  const { t } = useLocale();
  const headings = useMemo(() => extractHeadings(content), [content]);

  if (!headings.length) return null;

  return (
    <div style={{ position: 'sticky', top: 80 }}>
      <Title level={5} style={{ marginBottom: 12, color: '#8c8c8c', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {t.toc.eyebrow}
      </Title>
      <Anchor
        offsetTop={80}
        items={buildAnchorItems(headings)}
        style={{ maxWidth: 200 }}
      />
    </div>
  );
}
