import { useCallback, useEffect, useState } from 'react'
import { hiringSearch, parseHiringView } from './hiring'

const DEFAULT_VIEW = { role: 'all', recruiter: false }

// Role and recruiter mode live in the URL so a tailored link (?role=ux&mode=recruiter) can be
// shared. The prerendered page always starts in the default view; the URL is read after
// hydration, and back/forward keep the view in step.
export default function useHiringView() {
  const [view, setView] = useState(DEFAULT_VIEW)

  useEffect(() => {
    const sync = () => setView(parseHiringView(window.location.search))
    sync()
    window.addEventListener('popstate', sync)
    return () => window.removeEventListener('popstate', sync)
  }, [])

  const update = useCallback(patch => {
    setView(current => {
      const next = { ...current, ...patch }
      const { pathname, hash } = window.location
      window.history.replaceState(window.history.state, '', `${pathname}${hiringSearch(window.location.search, next)}${hash}`)
      return next
    })
  }, [])

  return {
    role: view.role,
    recruiter: view.recruiter,
    setRole: useCallback(role => update({ role }), [update]),
    setRecruiter: useCallback(recruiter => update({ recruiter }), [update]),
  }
}
