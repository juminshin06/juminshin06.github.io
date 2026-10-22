import { useEffect, useRef, useState } from 'react'
import { ArrowUp, ArrowUpRight, MessageCircle } from 'lucide-react'
import { fallbackIntent, intents, matchIntent, projectBySlug } from './agentIntents'
import { askJumin } from './ChatBot'
import { ProjectImage } from './Shell'
import s from './Portfolio.module.css'

const AVATAR_SRC = '/assets/3d/jumin-character-poster.webp'

const sleep = (ms, signal) => new Promise(resolve => {
  const timer = setTimeout(resolve, ms)
  signal?.addEventListener('abort', () => { clearTimeout(timer); resolve() }, { once: true })
})

// The hero as the chat's front door: suggested questions type themselves in and get answered
// from the portfolio data as a demo; a question the visitor types goes to the live chat.
export default function AgentHero() {
  const [query, setQuery] = useState('')
  const [phase, setPhase] = useState('idle') // idle | typing | thinking | answering | done
  const [auto, setAuto] = useState(false)
  const [intent, setIntent] = useState(null)
  const [answer, setAnswer] = useState('')
  const inputRef = useRef(null)
  const controller = useRef(null)
  const reduced = useRef(false)

  const cancel = () => { controller.current?.abort(); controller.current = null }

  const respond = async (next, signal) => {
    setIntent(next)
    setAnswer('')
    setPhase('thinking')
    await sleep(reduced.current ? 0 : 650, signal)
    if (signal?.aborted) return
    setPhase('answering')
    if (reduced.current) { setAnswer(next.lead); setPhase('done'); return }
    const words = next.lead.split(' ')
    for (let index = 1; index <= words.length; index += 1) {
      if (signal?.aborted) return
      setAnswer(words.slice(0, index).join(' '))
      await sleep(34, signal)
    }
    if (!signal?.aborted) setPhase('done')
  }

  const takeOver = () => { if (!auto && !controller.current) return; cancel(); setAuto(false); if (phase === 'typing') setPhase('idle') }

  const ask = async (next, text = next.prompt) => {
    cancel()
    setAuto(false)
    const current = new AbortController()
    controller.current = current
    setQuery(text)
    await respond(next, current.signal)
  }

  const submit = event => {
    event.preventDefault()
    const text = query.trim()
    if (!text) { inputRef.current?.focus(); return }
    cancel()
    setAuto(false)
    setPhase('idle')
    setIntent(null)
    askJumin(text)
    setQuery('')
  }

  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    reduced.current = motion.matches
    if (motion.matches) return
    const current = new AbortController()
    controller.current = current
    const { signal } = current
    setAuto(true)
    const run = async () => {
      await sleep(900, signal)
      for (let index = 0; !signal.aborted; index = (index + 1) % intents.length) {
        const next = intents[index]
        setPhase('typing')
        setIntent(null)
        setAnswer('')
        for (let length = 1; length <= next.prompt.length; length += 1) {
          if (signal.aborted) return
          setQuery(next.prompt.slice(0, length))
          await sleep(26 + Math.random() * 40, signal)
        }
        await sleep(700, signal)
        if (signal.aborted) return
        await respond(next, signal)
        await sleep(6500, signal)
        if (signal.aborted) return
        for (let length = next.prompt.length - 1; length >= 0; length -= 4) {
          if (signal.aborted) return
          setQuery(next.prompt.slice(0, Math.max(length, 0)))
          await sleep(12, signal)
        }
        setQuery('')
        await sleep(500, signal)
      }
    }
    run()
    return () => current.abort()
  }, [])

  const showAnswer = phase === 'thinking' || phase === 'answering' || phase === 'done'
  const results = intent?.projects.map(projectBySlug).filter(Boolean) || []
  const followUp = intent && intent !== fallbackIntent ? intent.prompt : ''

  return <div className={s.agent} data-agent-hero="true" data-phase={phase} data-auto={auto ? 'true' : 'false'}>
    <form className={s.agentForm} onSubmit={submit} role="search" aria-label="Ask about Jumin’s work">
      <span className={s.agentSpark} aria-hidden="true">✦</span>
      <div className={s.agentField}>
        <label className="sr-only" htmlFor="agent-input">Ask about Jumin’s work</label>
        <input
          id="agent-input"
          ref={inputRef}
          value={query}
          onChange={event => { takeOver(); setQuery(event.target.value) }}
          onFocus={takeOver}
          placeholder="Ask me anything about my work…"
          autoComplete="off"
          spellCheck={false}
          enterKeyHint="send"
        />
        {auto && <span className={s.agentGhost} aria-hidden="true"><span>{query}{phase === 'typing' && <i className={s.agentCaret} />}</span></span>}
      </div>
      <button type="submit" className={s.agentSend} aria-label="Ask"><ArrowUp size={18} aria-hidden="true" /></button>
    </form>
    <div className={s.agentChips} aria-label="Suggested questions">
      {intents.map(item => <button key={item.id} type="button" className={s.agentChip} aria-pressed={intent?.id === item.id} onClick={() => ask(item)}>{item.chip}</button>)}
    </div>
    <div className={s.agentAnswer} aria-live="polite" hidden={!showAnswer}>
      <span className={s.agentAvatar} aria-hidden="true"><img src={AVATAR_SRC} alt="" width="36" height="45" decoding="async" /></span>
      <div className={s.agentBody}>
        <span className={s.agentLabel}>Jumin · {phase === 'thinking' ? 'thinking' : 'answer'}</span>
        {phase === 'thinking'
          ? <span className={s.agentThinking}><i /><i /><i /></span>
          : <p className={s.agentText}>{answer}{phase === 'answering' && <i className={s.agentCaret} aria-hidden="true" />}</p>}
        {phase === 'done' && results.length > 0 && <ul className={s.agentResults}>
          {results.map(project => <li key={project.slug}>
            <a href={`/work/${project.slug}/`} data-cursor="Open">
              <ProjectImage src={project.cover?.primary || project.image} alt="" sizes="64px" />
              <span><strong>{project.title}</strong><small>{project.organization} · {project.year}</small></span>
              <ArrowUpRight size={16} aria-hidden="true" />
            </a>
          </li>)}
        </ul>}
        {phase === 'done' && intent?.links && <div className={s.agentLinks}>
          {intent.links.map(link => <a key={link.href} href={link.href} {...(link.external ? { target: '_blank', rel: 'noreferrer' } : {})}><ArrowUpRight size={14} aria-hidden="true" />{link.label}</a>)}
        </div>}
        {phase === 'done' && !auto && followUp && <button type="button" className={s.agentMore} onClick={() => askJumin(followUp)}>
          <MessageCircle size={15} aria-hidden="true" />Ask me more in chat
        </button>}
      </div>
    </div>
  </div>
}
