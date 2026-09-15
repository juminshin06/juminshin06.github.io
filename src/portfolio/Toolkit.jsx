import { Image as ImageIcon, PenTool } from 'lucide-react'
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
  { name: 'OpenAI API', icon: siOpenai, color: '#412991' },
]

export default function TechTools({ home = false }) {
  return <ul className={s.techTools}>
    {tools.map(tool => <li
      className={s.techTool}
      data-tech-tool="true"
      data-home-tech-tool={home ? 'true' : undefined}
      key={tool.name}
      style={{ '--tool-color': tool.color }}
    >
      {tool.lucide
        ? <tool.lucide aria-hidden="true" focusable="false" />
        : <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d={tool.icon.path} /></svg>}
      <span>{tool.name}</span>
    </li>)}
  </ul>
}
