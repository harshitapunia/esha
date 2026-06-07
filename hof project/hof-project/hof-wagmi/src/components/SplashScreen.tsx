import './SplashScreen.css'

// High-resolution, vibrant concert & event images from Unsplash
const ROW_1 = [
  'https://images.unsplash.com/photo-1540039155732-d674d4e8fa6b?auto=format&fit=crop&w=800&q=80', // stadium crowd
  'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=800&q=80', // colorful laser show
  'https://images.unsplash.com/photo-1470229722913-7c092bb4ace4?auto=format&fit=crop&w=800&q=80', // concert lights
  'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?auto=format&fit=crop&w=800&q=80', // crowd hands up
  'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&fit=crop&w=800&q=80', // stage performance
  'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80', // DJ set neon
]

const ROW_2 = [
  'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=800&q=80', // arena show
  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=800&q=80', // festival crowd
  'https://images.unsplash.com/photo-1565035010268-a3816f98589a?auto=format&fit=crop&w=800&q=80', // colorful lights stage
  'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=800&q=80', // live performance
  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80', // microphone spotlight
  'https://images.unsplash.com/photo-1563841930606-67e2bce48b78?auto=format&fit=crop&w=800&q=80', // rave neon
]

const ROW_3 = [
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=80', // stadium night
  'https://images.unsplash.com/photo-1468359601543-843bfaef291a?auto=format&fit=crop&w=800&q=80', // crowd party
  'https://images.unsplash.com/photo-1574169208507-84376144848b?auto=format&fit=crop&w=800&q=80', // neon lights
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80', // confetti show
  'https://images.unsplash.com/photo-1547036967-23d11aacaee0?auto=format&fit=crop&w=800&q=80', // laser display
  'https://images.unsplash.com/photo-1519058082700-08a0b56da9b4?auto=format&fit=crop&w=800&q=80', // outdoor festival
]

const ROW_4 = [
  'https://images.unsplash.com/photo-1598387993441-a364f854ccea?auto=format&fit=crop&w=800&q=80', // festival fireworks
  'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&w=800&q=80', // crowd energy
  'https://images.unsplash.com/photo-1621259182978-fbf93132d53d?auto=format&fit=crop&w=800&q=80', // neon stage
  'https://images.unsplash.com/photo-1508997449629-303059a039c0?auto=format&fit=crop&w=800&q=80', // DJ performance
  'https://images.unsplash.com/photo-1522158637959-30385a09e0da?auto=format&fit=crop&w=800&q=80', // concert sea of people
  'https://images.unsplash.com/photo-1571266752462-7dd879b27780?auto=format&fit=crop&w=800&q=80', // colourful lights show
]

export function SplashScreen() {
  const imageRows = [ROW_1, ROW_2, ROW_3, ROW_4]

  return (
    <div className="splash-screen" aria-hidden="true">
      {/* Tilted infinite-scroll film reel */}
      <div className="splash-screen__reel">
        {imageRows.map((row, rowIndex) => (
          <div key={rowIndex} className={`splash-screen__track splash-screen__track--${rowIndex + 1}`}>
            <div className="splash-screen__strip">
              {/* Triple the images so the loop is seamless with no empty gaps */}
              {[...row, ...row, ...row].map((imageSrc, index) => (
                <div key={`${rowIndex}-${index}`} className="splash-screen__tile">
                  <img src={imageSrc} alt="Event scene" loading="eager" />
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Radial vignette — pulls focus to center */}
        <div className="splash-screen__vignette" />
      </div>

      {/* Sharp, centered ChainPass logo */}
      <div className="splash-screen__content">
        {/* Title row: shield icon + wordmark on one line */}
        <div className="splash-screen__title-row">
          {/* Shield outline icon — matches brand blue-purple */}
          <svg
            className="splash-screen__shield"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M12 2L3 6v6c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V6L12 2Z"
              stroke="#8BA4FF"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
          </svg>
          <h1 className="splash-screen__title">ChainPass</h1>
        </div>
        <p className="splash-screen__tagline">decentralised event conducting platform</p>
      </div>
    </div>
  )
}
