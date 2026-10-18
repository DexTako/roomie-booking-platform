// Turns the "share" links people paste into direct image URLs, and
// checks that a URL really loads as an image before we save it.

export const normalizeImageUrl = (input) => {
  const raw = (input || '').trim()
  if (!raw) return ''

  let url
  try {
    url = new URL(raw)
  } catch {
    return raw // let the validator report it
  }
  const host = url.hostname.replace(/^www\./, '')

  // Google Drive share link -> direct image
  if (host === 'drive.google.com') {
    const match = url.pathname.match(/\/file\/d\/([^/]+)/) || null
    const id = match ? match[1] : url.searchParams.get('id')
    if (id) return `https://lh3.googleusercontent.com/d/${id}`
  }

  // Dropbox share link -> raw file
  if (host.endsWith('dropbox.com')) {
    url.searchParams.delete('dl')
    url.searchParams.set('raw', '1')
    return url.toString()
  }

  // Imgur page link (imgur.com/abc123) -> direct i.imgur.com image
  if (host === 'imgur.com' && /^\/[A-Za-z0-9]+$/.test(url.pathname)) {
    return `https://i.imgur.com${url.pathname}.jpg`
  }

  return url.toString()
}

// Resolves true if the browser can load the URL as an image
export const canLoadImage = (src, timeoutMs = 8000) =>
  new Promise((resolve) => {
    if (!src) return resolve(false)
    const img = new Image()
    const timer = setTimeout(() => resolve(false), timeoutMs)
    img.referrerPolicy = 'no-referrer'
    img.onload = () => {
      clearTimeout(timer)
      resolve(true)
    }
    img.onerror = () => {
      clearTimeout(timer)
      resolve(false)
    }
    img.src = src
  })
