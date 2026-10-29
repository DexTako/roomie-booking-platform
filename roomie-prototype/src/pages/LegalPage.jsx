import LegalDocument from '../components/LegalContent'

// Full page for the Terms of Service and the Privacy Policy
function LegalPage({ type = 'terms', onBack, onNavigate }) {
  const other = type === 'terms' ? 'privacy' : 'terms'
  const otherLabel = type === 'terms' ? 'Privacy Policy' : 'Terms of Service'

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <button
          onClick={onBack}
          className="mb-6 text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
        >
          ← Back to home
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-10">
          <LegalDocument type={type} />

          <div className="mt-10 pt-6 border-t border-gray-100 text-sm text-gray-600">
            Also read our{' '}
            <button
              type="button"
              onClick={() => onNavigate(other)}
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              {otherLabel}
            </button>
            .
          </div>
        </div>
      </div>
    </div>
  )
}

export default LegalPage
