import { Bot, Cable, Image as ImageIcon, MessageSquareText, Network, PenTool } from 'lucide-react'
import {
  siBlender,
  siClaude,
  siCplusplus,
  siFfmpeg,
  siFigma,
  siFramer,
  siGit,
  siGooglegemini,
  siHtml5,
  siJavascript,
  siMiro,
  siNodedotjs,
  siOpenai,
  siPython,
  siReact,
  siTypescript,
  siUnity,
  siUnrealengine,
} from 'simple-icons'
import s from './Portfolio.module.css'

const tools = [
  { name: 'Figma', icon: siFigma, color: '#f24e1e' },
  { name: 'Photoshop', lucide: ImageIcon, color: '#31a8ff' },
  { name: 'Illustrator', lucide: PenTool, color: '#ff9a00' },
  { name: 'Miro', icon: siMiro, color: '#050038' },
  { name: 'Framer', icon: siFramer, color: '#0055ff' },
  { name: 'React', icon: siReact, color: '#149eca' },
  { name: 'JavaScript', icon: siJavascript, color: '#b89600' },
  { name: 'TypeScript', icon: siTypescript, color: '#3178c6' },
  { name: 'HTML / CSS', icon: siHtml5, color: '#e34f26' },
  { name: 'Python', icon: siPython, color: '#3776ab' },
  { name: 'Node.js', icon: siNodedotjs, color: '#5fa04e' },
  { name: 'C++', icon: siCplusplus, color: '#00599c' },
  { name: 'Git', icon: siGit, color: '#f05032' },
  { name: 'FFmpeg', icon: siFfmpeg, color: '#007808' },
  { name: 'Blender', icon: siBlender, color: '#e87d0d' },
  { name: 'Unity', icon: siUnity, color: '#111111' },
  { name: 'Unreal Engine', icon: siUnrealengine, color: '#0e1128' },
  { name: 'Claude', icon: siClaude, color: '#d97757' },
  { name: 'Gemini', icon: siGooglegemini, color: '#8e75b2' },
  { name: 'OpenAI', icon: siOpenai, color: '#412991' },
  { name: 'Agentic AI', lucide: Bot, color: '#0f766e' },
  { name: 'MCP', lucide: Cable, color: '#7c3aed' },
  { name: 'Multi-agent', lucide: Network, color: '#2563eb' },
  { name: 'Prompt Design', lucide: MessageSquareText, color: '#c2410c' },
]

export const FEED_EVENT = 'jumin:feed'

// Each tool is a button: clicking drops a crumb in that tool's color onto the footer line, where
// the pixel critters come to eat it (see Critters).
const feed = (tool, event) => {
  const box = event.currentTarget.querySelector('svg').getBoundingClientRect()
  window.dispatchEvent(new CustomEvent(FEED_EVENT, { detail: { name: tool.name, color: tool.color, x: box.left + box.width / 2, y: box.top + box.height / 2 } }))
}

export default function TechTools({ home = false }) {
  return <ul className={s.techTools}>
    {tools.map(tool => <li key={tool.name} className={s.techToolItem}>
      <button
        type="button"
        className={s.techTool}
        data-tech-tool="true"
        data-home-tech-tool={home ? 'true' : undefined}
        style={{ '--tool-color': tool.color }}
        aria-label={`${tool.name}: drop a crumb for the critters`}
        onClick={event => feed(tool, event)}
      >
        {tool.lucide
          ? <tool.lucide aria-hidden="true" focusable="false" />
          : <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d={tool.icon.path} /></svg>}
        <span>{tool.name}</span>
      </button>
    </li>)}
  </ul>
}
