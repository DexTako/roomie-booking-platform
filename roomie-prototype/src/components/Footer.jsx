import SocialLinks from './SocialLinks'

// One footer for every page, so it always looks the same and the year is never out of date.
function Footer({ onNavigateToHome, onNavigateToHowItWorks, onNavigateToContact }) {
  const year = new Date().getFullYear()

  const linkClass = 'text-sm text-gray-400 hover:text-white transition-colors text-left'

  return (
    <footer className="mt-16 bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-10 grid gap-8 md:grid-cols-3">
        <div>
          <p className="text-xl font-bold">Roomie</p>
          <p className="text-sm text-gray-400 mt-2 max-w-xs">
            Immersive room booking. Explore rooms in 3D, then book your stay.
          </p>
        </div>

        <nav className="flex flex-col gap-2" aria-label="Footer">
          <p className="text-sm font-semibold text-gray-200 mb-1">Explore</p>
          <button type="button" onClick={onNavigateToHome} className={linkClass}>Browse rooms</button>
          <button type="button" onClick={onNavigateToHowItWorks} className={linkClass}>How it works</button>
          <button type="button" onClick={onNavigateToContact} className={linkClass}>Contact &amp; FAQ</button>
        </nav>

        <div>
          <p className="text-sm font-semibold text-gray-200 mb-3">Follow us</p>
          <SocialLinks variant="dark" />
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 py-4 text-center text-xs text-gray-500">
          © {year} Roomie. All rights reserved.
        </div>
      </div>
    </footer>
  )
}

export default Footer
