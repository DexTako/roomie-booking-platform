import { useState, useEffect } from 'react'

// Round profile picture with an initial as fallback.
// The failed-state resets whenever `src` changes, so a bad link followed by a
// good link shows the new picture straight away.
function Avatar({ src, name, className = '', textClassName = 'text-base' }) {
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setFailed(false)
  }, [src])

  const showImage = src && !failed

  return (
    <div
      className={`rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 ${className}`}
    >
      {showImage ? (
        <img
          src={src}
          alt={name || 'Profile'}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <span className={`font-bold ${textClassName}`}>
          {name ? name.charAt(0).toUpperCase() : 'U'}
        </span>
      )}
    </div>
  )
}

export default Avatar
