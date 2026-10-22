import { localAnswer } from './agentIntents'

export const chatApiUrl = import.meta.env.VITE_CHAT_API_URL || ''
// The function sends one zero-width "ready" character first so headers arrive at once.
const READY = '​'
// If nothing readable arrives by then (slow free tier, cold start), answer from the local index.
const FIRST_TEXT_MS = 18000

// Streams an answer from the hosted model; resolves to { text, source }. When the API is
// unset or fails before any text arrives, answers from the built-in portfolio index instead.
export async function streamAnswer(messages, { onDelta, signal } = {}) {
  const question = messages[messages.length - 1]?.content || ''
  if (!chatApiUrl) return { text: localAnswer(question), source: 'local' }

  let text = ''
  const request = new AbortController()
  const forward = () => request.abort()
  signal?.addEventListener('abort', forward, { once: true })
  const deadline = setTimeout(() => { if (!text.trim()) request.abort() }, FIRST_TEXT_MS)
  try {
    const response = await fetch(chatApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: messages.map(({ role, content }) => ({ role, content })) }),
      signal: request.signal,
    })
    if (!response.ok || !response.body) throw new Error(`chat api ${response.status}`)
    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      text += decoder.decode(value, { stream: true })
      if (text.startsWith(READY)) text = text.slice(READY.length)
      const marker = text.indexOf('\n\n[chat-error]')
      if (marker >= 0) { text = text.slice(0, marker); throw new Error('chat stream error') }
      if (text.trim()) onDelta?.(text)
    }
    if (!text.trim()) throw new Error('empty answer')
    return { text, source: 'model' }
  } catch (error) {
    if (signal?.aborted) throw error
    if (text.trim()) return { text, source: 'model' }
    return { text: localAnswer(question), source: 'local' }
  } finally {
    clearTimeout(deadline)
    signal?.removeEventListener('abort', forward)
  }
}
