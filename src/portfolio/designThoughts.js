// Short UX design engineering beliefs. The guide NPC shares one on hover or focus, and the chat
// panel shows one under its greeting so touch visitors see them too. Keep them general principles.
export const designThoughts = [
  'Prototype the question, not just the answer.',
  'If nobody has tested it, it’s still a guess.',
  'Good UX is often just one fewer step.',
  'Design the empty state first.',
  'Accessibility is a feature, not a checklist.',
  'Ship the smallest thing that teaches you something.',
  'Every loading spinner is a design decision.',
  'Talk to five users before writing five hundred lines.',
  'Make the right action the easy action.',
  'Real content breaks pretty mockups. Use it early.',
  'Errors are part of the flow. Design them too.',
  'Motion should explain, not decorate.',
  'Code is the most honest prototype.',
  'AI should feel like a collaborator, not a black box.',
  'Trust lives in the details: copy, timing, feedback.',
  'Watch what people do, then ask why.',
  'Clarity beats cleverness.',
  'A design system is a promise of consistency.',
]

export const pickThought = (previous = '') => {
  const pool = designThoughts.filter(thought => thought !== previous)
  return pool[Math.floor(Math.random() * pool.length)]
}
