import { useSyncExternalStore } from 'react'

// One guide, three places it can live:
// - 'hero': the hero's prompt is on screen and the chat is closed, so the full-body NPC stands
//   beside the prompt and the corner chat button hides.
// - 'dock': the prompt has scrolled away (or this page has none), so the NPC rides along inside
//   the corner "Ask about Jumin" button.
// - 'chat': the panel is open; neither the NPC nor the button shows, only the panel's avatar.
// The mode is mirrored on <html data-guide> so CSS can fade the right entry point in and out.
const state = { promptVisible: false, chatOpen: false }
const listeners = new Set()

export const guideMode = ({ promptVisible, chatOpen } = state) => (chatOpen ? 'chat' : promptVisible ? 'hero' : 'dock')

export function syncGuide() {
  if (typeof document !== 'undefined') document.documentElement.dataset.guide = guideMode()
  listeners.forEach(listener => listener())
}

export function setGuide(patch) {
  const next = { ...state, ...patch }
  if (next.promptVisible === state.promptVisible && next.chatOpen === state.chatOpen) return
  Object.assign(state, next)
  syncGuide()
}

const subscribe = listener => { listeners.add(listener); return () => listeners.delete(listener) }

export function useGuideMode() {
  return useSyncExternalStore(subscribe, () => guideMode(), () => 'dock')
}
