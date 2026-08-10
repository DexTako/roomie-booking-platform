function HowItWorksPage({ onBack }) {
  const steps = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      title: "Browse & Explore",
      description: "Search through our collection of immersive 3D rooms. Filter by price, capacity, and amenities to find your perfect match."
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: "Experience in 3D",
      description: "Step into rooms virtually with our interactive 3D viewer. Walk through spaces, interact with furniture, and get a real feel before booking."
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      title: "Book Instantly",
      description: "Choose your dates, enter guest details, and submit your booking request. Hosts review and approve within 24 hours."
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
      title: "Enjoy Your Stay",
      description: "Check in seamlessly, enjoy your room, and leave a review to help future renters. Build your reputation in our community."
    }
  ]

  const features = [
    {
      title: "Immersive 3D Tours",
      description: "Walk through rooms in first-person view, just like being there in person",
      icon: "🎮"
    },
    {
      title: "Interactive Furniture",
      description: "Move and rearrange furniture to visualize your perfect setup",
      icon: "🪑"
    },
    {
      title: "Instant Booking",
      description: "Quick and secure booking process with transparent pricing",
      icon: "⚡"
    },
    {
      title: "Verified Reviews",
      description: "Read authentic reviews from real renters to make informed decisions",
      icon: "⭐"
    },
    {
      title: "Secure Payments",
      description: "Safe and encrypted payment processing for peace of mind",
      icon: "🔒"
    },
    {
      title: "24/7 Support",
      description: "Our team is always here to help with any questions or issues",
      icon: "💬"
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <button
            onClick={onBack}
            className="mb-6 p-2 hover:bg-white/20 rounded-lg transition-colors inline-flex"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">How Roomie Works</h1>
          <p className="text-xl text-blue-100">Your journey to the perfect room in 4 simple steps</p>
        </div>
      </div>

      {/* Steps Section */}
      <div className="container mx-auto px-4 max-w-5xl py-16">
        <div className="space-y-12">
          {steps.map((step, index) => (
            <div key={index} className="flex gap-6 items-start">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white shadow-lg">
                  {step.icon}
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-sm font-bold text-blue-600">STEP {index + 1}</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600 text-lg leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">Why Choose Roomie?</h2>
          <p className="text-center text-gray-600 mb-12 text-lg">
            We combine cutting-edge technology with exceptional service
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Find Your Perfect Room?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of satisfied renters who found their ideal space with Roomie
          </p>
          <button
            onClick={onBack}
            className="px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors font-semibold text-lg"
          >
            Start Exploring Rooms
          </button>
        </div>
      </div>
    </div>
  )
}

export default HowItWorksPage
