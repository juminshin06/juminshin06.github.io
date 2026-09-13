import s from './Portfolio.module.css'

export function NarrativeCopy({ lead, body, className = '' }) {
  if (!lead && !body) return null
  return <p className={className} data-narrative-copy="true">
    {lead ? <strong>{lead}</strong> : null}
    {lead && body ? ' ' : null}
    {body ? <span>{body}</span> : null}
  </p>
}

export function NarrativeHeading({ children, accent }) {
  return <h2>{children}{accent ? <> <span className={s.narrativeAccent}>{accent}</span></> : null}</h2>
}

export function DesignDecision({ comparison }) {
  if (!comparison) return null
  return <dl className={s.designDecision} data-design-decision="true">
    <div><dt>Problem</dt><dd>{comparison.observation}</dd></div>
    <div><dt>Design response</dt><dd>{comparison.response}</dd></div>
  </dl>
}

export function SectionDetails({ items = [] }) {
  if (!items.length) return null
  return <dl className={s.sectionDetails} data-detail-list="true">
    {items.map(item => <div key={item.label}>
      <dt>{item.label}</dt>
      <dd>{item.body}</dd>
    </div>)}
  </dl>
}

export function SectionFlow({ flow }) {
  if (!flow?.steps?.length) return null
  return <figure className={s.sectionFlow} data-section-flow="true">
    <span>{flow.label}</span>
    <ol>{flow.steps.map(step => <li key={step.label}>
      <strong>{step.label}</strong>
      <p>{step.detail}</p>
    </li>)}</ol>
    <figcaption>{flow.caption}</figcaption>
  </figure>
}
