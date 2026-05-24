import { useEffect, useState } from 'react'
import { HashRouter, Routes, Route, useParams } from 'react-router-dom'
import { App as AntApp } from 'antd'
import { DocLayout } from '@/layouts/DocLayout'
import { HomePage } from '@/pages/HomePage'
import { DocPage } from '@/pages/DocPage'
import { ProjectListPage } from '@/pages/ProjectListPage'
import { ProjectDetailPage } from '@/pages/ProjectDetailPage'
import { DocViewPage } from '@/pages/DocViewPage'
import { DocEditPage } from '@/pages/DocEditPage'
import { docsContent } from '@/content/docs-content'
import { interpolate } from '@/locales/interpolate'
import { useLocale } from '@/locales/LocaleContext'
import { Header } from '@/components/Header'
import { LanguageSwitch } from '@/components/LanguageSwitch'
import '@/styles/global.css'

interface AuthUser {
  sub: string; name?: string; email?: string; role?: string
  identity_type?: string; org_id?: string
  badges?: { label: string; color: string }[]
  is_admin?: boolean
}

function DocRoute() {
  const { t } = useLocale()
  const { '*': section } = useParams()
  const path = section ? `docs/${section}` : 'docs/overview'
  const missingBody = interpolate(t.app.notFoundBody, { path })
  const rawContent = (docsContent as Record<string, string>)[path] || `# ${t.app.notFoundH1}\n\n${missingBody}`
  return <DocPage rawContent={rawContent} />
}

export function App() {
  const { t } = useLocale()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    document.title = t.meta.htmlTitle
  }, [t])

  useEffect(() => {
    fetch('/api/me', { credentials: 'include' })
      .then((r) => r.ok ? r.json() : null)
      .then((u) => { setUser(u); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-white"><div className="text-neutral-400 text-sm">Loading...</div></div>
  }

  if (!user) {
    window.location.href = '/auth/login'
    return null
  }

  return (
    <AntApp>
      <HashRouter>
        {/* Auth bar */}
        <div className="flex items-center justify-between px-4 h-8 bg-neutral-950 text-neutral-400 text-xs">
          <div className="flex items-center gap-4">
            <span className="text-neutral-500">RunDoc</span>
            <span className="text-neutral-600">|</span>
            {user.name && <span className="text-neutral-300">{user.name}</span>}
            {user.badges?.[0] && (
              <span className="px-1.5 py-0.5 rounded text-[10px]" style={{ backgroundColor: user.badges[0].color + '30', color: user.badges[0].color }}>
                {user.badges[0].label}
              </span>
            )}
            {user.org_id && <span className="text-neutral-600">{user.org_id}</span>}
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitch />
            <button onClick={() => { window.location.href = '/auth/logout' }} className="hover:text-red-400 transition-colors">
              Logout
            </button>
          </div>
        </div>
        <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/docs/*" element={<DocLayout><DocRoute /></DocLayout>} />
          <Route path="/projects" element={<ProjectListPage />} />
          <Route path="/projects/:projectId" element={<ProjectDetailPage />} />
          <Route path="/projects/:projectId/docs/:docId" element={<DocViewPage />} />
          <Route path="/projects/:projectId/docs/:docId/edit" element={<DocEditPage />} />
        </Routes>
      </HashRouter>
    </AntApp>
  )
}
