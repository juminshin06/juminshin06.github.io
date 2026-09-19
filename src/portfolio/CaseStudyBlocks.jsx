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

export function ProblemStatement({ problem }) {
  if (!problem) return null
  const context = [
    ['People & context', problem.context],
    ['Observed friction', problem.friction],
    ['Why it mattered', problem.consequence],
  ].filter(([, value]) => value)

  return <section className={s.problemStatement} id="problem" data-existing-problem="true">
    <div className={s.problemHeading}>
      <span className={s.label}>Existing problem</span>
      <h2>{problem.statement}</h2>
    </div>
    <dl className={s.problemContext}>{context.map(([label, value]) => <div key={label}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>)}</dl>
  </section>
}

export function ProcessStage({ stage, index, children }) {
  const rows = [
    ['What I did', stage.activity],
    ['What changed', stage.insight],
    ['Design decision', stage.decision],
  ].filter(([, value]) => value)

  return <section className={s.processStage} id={stage.id} data-design-stage={stage.id}>
    <div className={s.processStageIndex} aria-hidden="true">{String(index + 1).padStart(2, '0')}</div>
    <div className={s.processStageNarrative}>
      <span className={s.processStageLabel}>{stage.label || stage.id}</span>
      <h2>{stage.title}</h2>
      <dl>{rows.map(([label, value]) => <div key={label}>
        <dt>{label}</dt>
        <dd>{value}</dd>
      </div>)}</dl>
    </div>
    {children}
  </section>
}

export function Resolution({ resolution, status }) {
  if (!resolution) return null
  const comparison = [
    ['Before', resolution.before],
    ['Design response', resolution.response],
    ['After', resolution.after],
  ].filter(([, value]) => value)

  return <section className={s.processResolution} id="resolution" data-process-resolution="true">
    <span className={s.label}>Resolution</span>
    <h2>How the design addressed the problem</h2>
    <dl className={s.processComparison}>{comparison.map(([label, value]) => <div key={label}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>)}</dl>
    <dl className={s.resolutionEvidence}>
      <div><dt>Evidence</dt><dd>{resolution.evidence || status}</dd></div>
      {resolution.reflection ? <div><dt>Reflection</dt><dd>{resolution.reflection}</dd></div> : null}
    </dl>
  </section>
}
