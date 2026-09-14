import { useEffect, useRef } from 'react'
import { pageMetadata, resolvePage } from './data/portfolio'
import { Header, Footer } from './portfolio/Shell'
import Home from './portfolio/Home'
import CaseStudy from './portfolio/CaseStudy'
import { About, Research, Archive, Life, NotFound } from './portfolio/Pages'
import usePageMotion from './portfolio/usePageMotion'

export default function App({ path = '/' }) {
  const page = resolvePage(path)
  const main = useRef(null)
  usePageMotion(main, path)
  useEffect(() => {
    const meta = pageMetadata(path)
    document.title = meta.title
    document.querySelector('meta[name="description"]')?.setAttribute('content', meta.description)
  }, [path])
  const views = { home: Home, about: About, research: Research, archive: Archive, life: Life, 'not-found': NotFound }
  const View = views[page.type]
  return <>
    <a className="skip-link" href="#main">Skip to content</a>
    <Header active={page.type} />
    <main ref={main} id="main" tabIndex={-1}>
      {page.type === 'project' ? <CaseStudy project={page.project} /> : <View />}
    </main>
    <Footer />
  </>
}
