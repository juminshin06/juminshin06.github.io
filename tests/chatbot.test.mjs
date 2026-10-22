import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createServer } from 'vite'

test('chatbot knowledge leads with the knowledge base and resume and never includes the phone number', async () => {
  const { knowledge } = await import('../chatbot-api/knowledge.js')
  assert.ok(knowledge.startsWith('# Jumin Shin — Portfolio Chatbot Knowledge Base'))
  assert.match(knowledge, /# Current resume \(2026\)/)
  assert.match(knowledge, /Do not pretend to be Jumin herself/)
  assert.doesNotMatch(knowledge, /\(\d{3}\)\s*\d{3}-\d{4}|556-5439/)
  const resume = readFileSync(new URL('../src/data/chat/resume.json', import.meta.url), 'utf8')
  assert.doesNotMatch(resume, /556-5439/)
})

test('offline answers speak as the assistant, respect privacy and link real pages', async () => {
  const server = await createServer({ server: { middlewareMode: true, ws: false }, appType: 'custom', logLevel: 'error' })
  try {
    const { localBrainAnswer } = await server.ssrLoadModule('/src/portfolio/localBrain.js')
    const { routes } = await server.ssrLoadModule('/src/data/portfolio.js')
    const known = new Set([...routes, '/assets/JuminShin_Resume.pdf'])
    const questions = [
      'What is Jumin’s biggest strength?', 'What kind of designer is Jumin?', 'Does Jumin code?',
      'Does she have real user research experience?', 'Does Jumin have AI experience?',
      'Which projects fit a Design Engineer role?', 'We are a healthcare company, what is relevant?',
      'automotive UX work?', 'How does she approach research?', 'how does she work with developers?',
      'what is her email?', 'tell me about the Honda project', '강점이 뭐야?', 'do you like pizza?',
    ]
    for (const question of questions) {
      const answer = localBrainAnswer(question)
      assert.ok(answer.length > 40, `${question}: empty answer`)
      assert.doesNotMatch(answer, /\b(I’m|I am|my work|My edge|email me)\b/i, `${question}: speaks as Jumin`)
      for (const [, href] of answer.matchAll(/\]\((\/[^)\s]*)\)/g)) assert.ok(known.has(href), `${question}: broken link ${href}`)
    }
    assert.match(localBrainAnswer('What is Jumin’s biggest strength?'), /^Jumin’s strongest differentiator is her ability to work between design and technology/)
    for (const question of ['Does she need visa sponsorship?', 'what is her phone number?', 'where does she live exactly, home address?']) {
      const answer = localBrainAnswer(question)
      assert.match(answer, /personal information/, `${question}: should decline`)
      assert.doesNotMatch(answer, /\d{3}-\d{4}/)
    }
    assert.match(localBrainAnswer('what is her email?'), /mailto:juminshi@usc\.edu/)
    assert.match(localBrainAnswer('We are a healthcare company, what is relevant?'), /\/work\/ethicon-care\//)
    assert.match(localBrainAnswer('do you like pizza?'), /isn’t included in the portfolio information I have/)
    assert.doesNotMatch(localBrainAnswer('Does Jumin code?'), /expert TypeScript|full-time software engineer/i)
  } finally { await server.close() }
})
