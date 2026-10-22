import { useEffect, useRef } from 'react'
import { ROLES } from './hiring'
import s from './Portfolio.module.css'

// "Explore by role": reorders the work by relevance rather than hiding projects.
export default function RoleFilter({ role, onChange, id = 'role-filter' }) {
  const optionsRef = useRef(null)
  const mounted = useRef(false)

  // On narrow screens the options scroll sideways; keep the active one in view without moving the
  // page. The first placement (a role from the URL) jumps; later changes glide.
  useEffect(() => {
    const behavior = mounted.current ? 'smooth' : 'instant'
    mounted.current = true
    const options = optionsRef.current
    const active = options?.querySelector('[aria-pressed="true"]')
    if (!options || !active || options.scrollWidth <= options.clientWidth) return
    const box = options.getBoundingClientRect()
    const pill = active.getBoundingClientRect()
    const left = options.scrollLeft + (pill.left - box.left) - (box.width - pill.width) / 2
    options.scrollTo({ left: Math.max(0, left), behavior })
  }, [role])

  return <div className={s.roleFilter} role="group" aria-labelledby={`${id}-label`} data-role-filter="true">
    <span className={s.roleFilterLabel} id={`${id}-label`}>Explore by role</span>
    <div className={s.roleFilterOptions} ref={optionsRef}>
      {ROLES.map(option => <button
        key={option.id}
        type="button"
        className={s.roleFilterOption}
        aria-pressed={role === option.id}
        data-role-option={option.id}
        onClick={() => onChange(option.id)}
      >{option.label}</button>)}
    </div>
  </div>
}
