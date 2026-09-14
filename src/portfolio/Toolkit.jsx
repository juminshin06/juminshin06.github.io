import { siBlender, siFigma, siJavascript, siPython, siReact, siUnity, siUnrealengine } from 'simple-icons'
import s from './Portfolio.module.css'

const tools = [
  { name: 'Figma', icon: siFigma, color: '#f24e1e' },
  { name: 'React', icon: siReact, color: '#149eca' },
  { name: 'JavaScript', icon: siJavascript, color: '#b89600' },
  { name: 'Python', icon: siPython, color: '#3776ab' },
  { name: 'Blender', icon: siBlender, color: '#e87d0d' },
  { name: 'Unity', icon: siUnity, color: '#111111' },
  { name: 'Unreal Engine', icon: siUnrealengine, color: '#0e1128' },
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
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d={tool.icon.path} /></svg>
      <span>{tool.name}</span>
    </li>)}
  </ul>
}
