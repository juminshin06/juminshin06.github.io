import { useEffect } from 'react'

export default function usePageMotion(root, path) {
  useEffect(() => {
    if (!root.current || !window.IntersectionObserver || !Element.prototype.animate) return
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const animations = new Set()
    const cancelAnimations = () => {
      if (preference.matches) animations.forEach(animation => animation.cancel())
    }
    const observer = new IntersectionObserver(entries => {
      for (const { target, isIntersecting } of entries) {
        if (!isIntersecting) continue
        observer.unobserve(target)
        if (preference.matches || target.contains(document.activeElement)) continue
        // Content stays visible without JavaScript; animate only on first entry.
        const animation = target.animate([
          { opacity: 0, transform: 'translateY(20px)' },
          { opacity: 1, transform: 'translateY(0)' },
        ], { duration: 560, easing: 'cubic-bezier(0.2, 0.65, 0.3, 1)' })
        animations.add(animation)
        animation.onfinish = animation.oncancel = () => animations.delete(animation)
      }
    }, { threshold: 0.06 })
    root.current.querySelectorAll('[data-reveal]').forEach(element => observer.observe(element))
    preference.addEventListener('change', cancelAnimations)
    return () => {
      observer.disconnect()
      preference.removeEventListener('change', cancelAnimations)
      animations.forEach(animation => animation.cancel())
    }
  }, [root, path])
}
