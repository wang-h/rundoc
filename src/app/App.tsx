import { HashRouter, Routes, Route, useParams } from 'react-router-dom';
import { DocLayout } from '@/layouts/DocLayout';
import { HomePage } from '@/pages/HomePage';
import { DocPage } from '@/pages/DocPage';
import { docsContent } from '@/content/docs-content';
import { interpolate } from '@/locales/interpolate';
import { useLocale } from '@/locales/LocaleContext';
import '@/styles/global.css';

function DocRoute() {
  const { t } = useLocale();
  const { '*': section } = useParams();
  const path = section ? `docs/${section}` : 'docs/overview';
  const missingBody = interpolate(t.app.notFoundBody, { path });
  const rawContent = (docsContent as Record<string, string>)[path] || `# ${t.app.notFoundH1}\n\n${missingBody}`;
  return <DocPage rawContent={rawContent} />;
}

export function App() {
  const { t } = useLocale();
  document.title = t.meta.htmlTitle;

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/docs/*" element={<DocLayout><DocRoute /></DocLayout>} />
      </Routes>
    </HashRouter>
  );
}
