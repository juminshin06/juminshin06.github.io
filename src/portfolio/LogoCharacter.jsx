import s from './Portfolio.module.css'

const LOGO_SRC = '/assets/character/jumin-avatar.png'

// The header mark: Jumin's character in a round frame, like the chat avatar.
export default function LogoCharacter() {
  return <span className={s.logoCharacter} data-logo-character="still" aria-hidden="true">
    <img src={LOGO_SRC} width="48" height="48" alt="" decoding="async" />
  </span>
}
