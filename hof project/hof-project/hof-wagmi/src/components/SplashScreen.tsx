import './SplashScreen.css'

export function SplashScreen() {
  return (
    <div className="splash-screen" aria-hidden="true">
      <div className="splash-screen__inner">
        <div className="splash-screen__text" aria-label="ChainPass">
          {'ChainPass'.split('').map((char, index) => (
            <span
              key={`${char}-${index}`}
              className="splash-letter"
              style={{ animationDelay: `${index * 0.08}s` }}
            >
              {char}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
