import s from './Portfolio.module.css'

const LOGO_SRC = '/assets/character/jumin-avatar.png'
const LOGO_CLOSED_SRC = '/assets/character/jumin-avatar-closed.png'

// The header mark: Jumin's character in a round frame, like the chat avatar. She closes her
// eyes while the logo is hovered or focused.
export default function LogoCharacter() {
  return <span className={s.logoCharacter} data-logo-character="still" aria-hidden="true">
    <img src={LOGO_SRC} width="48" height="48" alt="" decoding="async" />
    <img className={s.logoClosed} src={LOGO_CLOSED_SRC} width="48" height="48" alt="" decoding="async" />
  </span>
}
