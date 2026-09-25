function HowItWorksPage({ onBack }) {

  const steps = [
    {
      number: '01',
      title: 'Browse & Explore',
      description:
        'Explore available rooms and compare spaces based on price, capacity, amenities, and style to find the option that suits you.',
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      )
    },
    {
      number: '02',
      title: 'Experience in 3D',
      description:
        'Take a closer look at the room through an immersive 3D experience and understand the layout before making your decision.',
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      )
    },
    {
      number: '03',
      title: 'Book Your Stay',
      description:
        'Select your preferred dates, provide the required booking details, and submit your request directly through Roomie.',
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      )
    },
    {
      number: '04',
      title: 'Enjoy Your Stay',
      description:
        'Once your booking is confirmed, you can prepare for your stay and manage your booking details through your Roomie account.',
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M5 13l4 4L19 7"
          />
        </svg>
      )
    }
  ]


  const features = [
    {
      title: 'Immersive 3D Tours',
      description:
        'Explore room layouts virtually before deciding where you want to stay.',
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          />
        </svg>
      )
    },
    {
      title: 'Interactive Spaces',
      description:
        'Get a better understanding of the room, its layout, and available furnishings.',
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M4 18v-5a2 2 0 012-2h12a2 2 0 012 2v5M4 15h16M6 18v2m12-2v2M7 11V8a2 2 0 012-2h6a2 2 0 012 2v3"
          />
        </svg>
      )
    },
    {
      title: 'Simple Booking',
      description:
        'Choose your preferred room and complete your booking through a straightforward process.',
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"
          />
        </svg>
      )
    },
    {
      title: 'Verified Listings',
      description:
        'View room information and property details clearly before making a reservation.',
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
      )
    },
    {
      title: 'Transparent Details',
      description:
        'Review important room information, amenities, pricing, and availability in one place.',
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M9 12h6m-6 4h6M9 8h2m-5 13h12a2 2 0 002-2V5a2 2 0 00-2-2H6a2 2 0 00-2 2v14a2 2 0 002 2z"
          />
        </svg>
      )
    },
    {
      title: 'Roomie Support',
      description:
        'Get assistance when you have questions about rooms, bookings, or your account.',
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M18.364 5.636a9 9 0 11-12.728 0M12 3v9"
          />
        </svg>
      )
    }
  ]


  return (
    <div className="min-h-screen bg-[#f7f7f5]">


      {/* ================= HERO ================= */}
      <section
        className="
          relative
          min-h-[620px]
          md:min-h-[700px]
          flex
          items-center
          overflow-hidden
          text-white
        "
      >

        {/* Background Image */}
        <img
          src="/images/room1/hiw-room.jpg"
          alt="Roomie room experience"
          className="
            absolute
            inset-0
            w-full
            h-full
            object-cover
          "
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/45" />

        <div
          className="
            absolute
            inset-0
            bg-gradient-to-r
            from-black/75
            via-black/40
            to-transparent
          "
        />


        {/* Hero Content */}
        <div
          className="
            relative
            z-10
            max-w-7xl
            mx-auto
            w-full
            px-5
            sm:px-8
            lg:px-10
            pt-28
          "
        >

          <div className="max-w-3xl">

            <p
              className="
                text-xs
                sm:text-sm
                font-semibold
                tracking-[0.22em]
                uppercase
                text-white/70
                mb-6
              "
            >
              How Roomie Works
            </p>


            <h1
              className="
                text-5xl
                sm:text-6xl
                md:text-7xl
                lg:text-[82px]
                font-bold
                tracking-tight
                leading-[0.95]
                mb-7
              "
            >
              Your next stay,
              <span className="block">
                made simple.
              </span>
            </h1>


            <p
              className="
                text-base
                sm:text-lg
                md:text-xl
                text-white/75
                leading-relaxed
                max-w-xl
              "
            >
              From discovering the right room to exploring it in 3D
              and completing your booking, Roomie brings everything
              together in one straightforward experience.
            </p>


            <button
              type="button"
              onClick={onBack}
              className="
                mt-9
                inline-flex
                items-center
                gap-2
                px-7
                py-3.5
                bg-white
                text-gray-900
                rounded-full
                text-sm
                font-semibold
                hover:bg-gray-100
                hover:-translate-y-0.5
                hover:shadow-xl
                transition-all
                duration-300
              "
            >
              Explore Rooms

              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 12h14m-6-6l6 6-6 6"
                />
              </svg>
            </button>

          </div>

        </div>

      </section>



      {/* ================= INTRO ================= */}
      <section className="bg-white py-20 md:py-28">

        <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8">

          <div
            className="
              grid
              lg:grid-cols-[0.9fr_1.1fr]
              gap-10
              lg:gap-20
              items-end
            "
          >

            <div>

              <p
                className="
                  text-sm
                  font-semibold
                  text-blue-600
                  uppercase
                  tracking-[0.18em]
                  mb-4
                "
              >
                The Roomie Experience
              </p>

              <h2
                className="
                  text-4xl
                  md:text-5xl
                  font-bold
                  tracking-tight
                  text-gray-900
                  leading-tight
                "
              >
                From search to stay in four simple steps.
              </h2>

            </div>


            <div>

              <p
                className="
                  text-gray-500
                  text-base
                  md:text-lg
                  leading-relaxed
                "
              >
                Roomie is designed to make finding accommodation easier
                and more informative. Explore available spaces, understand
                what each room offers, and make your booking with greater
                confidence.
              </p>

            </div>

          </div>

        </div>

      </section>



      {/* ================= STEPS ================= */}
      <section className="bg-[#f7f7f5] py-20 md:py-28">

        <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8">


          <div className="grid md:grid-cols-2 gap-5 lg:gap-6">

            {steps.map((step, index) => (

              <div
                key={index}
                className="
                  group
                  bg-white
                  border
                  border-gray-200
                  rounded-2xl
                  p-7
                  sm:p-8
                  md:p-9
                  min-h-[310px]
                  flex
                  flex-col
                  justify-between
                  transition-all
                  duration-300
                  hover:-translate-y-1
                  hover:shadow-[0_18px_50px_rgba(0,0,0,0.07)]
                "
              >

                {/* Top */}
                <div className="flex items-start justify-between gap-5">

                  <div
                    className="
                      w-12
                      h-12
                      rounded-xl
                      bg-gray-900
                      text-white
                      flex
                      items-center
                      justify-center
                    "
                  >
                    {step.icon}
                  </div>


                  <span
                    className="
                      text-5xl
                      md:text-6xl
                      font-bold
                      text-gray-100
                      tracking-tight
                    "
                  >
                    {step.number}
                  </span>

                </div>


                {/* Text */}
                <div className="mt-14">

                  <p
                    className="
                      text-xs
                      uppercase
                      tracking-[0.18em]
                      font-semibold
                      text-blue-600
                      mb-3
                    "
                  >
                    Step {index + 1}
                  </p>

                  <h3
                    className="
                      text-2xl
                      font-bold
                      text-gray-900
                      tracking-tight
                      mb-3
                    "
                  >
                    {step.title}
                  </h3>

                  <p
                    className="
                      text-sm
                      md:text-base
                      text-gray-500
                      leading-relaxed
                    "
                  >
                    {step.description}
                  </p>

                </div>

              </div>

            ))}

          </div>

        </div>

      </section>



      {/* ================= 3D EXPERIENCE ================= */}
      <section className="bg-white py-20 md:py-28">

        <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8">


          <div
            className="
              grid
              lg:grid-cols-[1.05fr_0.95fr]
              min-h-[520px]
              rounded-3xl
              overflow-hidden
              bg-gray-950
              shadow-[0_20px_60px_rgba(0,0,0,0.12)]
            "
          >

            {/* Image */}
            <div className="relative min-h-[350px] lg:min-h-[520px]">

              <img
                src="/images/room1/3d-room.jpg"
                alt="Roomie 3D room tour"
                className="
                  absolute
                  inset-0
                  w-full
                  h-full
                  object-cover
                "
              />

              <div
                className="
                  absolute
                  inset-0
                  bg-gradient-to-t
                  from-black/45
                  via-transparent
                  to-transparent
                "
              />

            </div>


            {/* Content */}
            <div
              className="
                flex
                items-center
                px-8
                py-12
                sm:px-10
                lg:px-14
                lg:py-16
                text-white
              "
            >

              <div>

                <p
                  className="
                    text-xs
                    font-semibold
                    uppercase
                    tracking-[0.2em]
                    text-white/50
                    mb-5
                  "
                >
                  Explore Before You Book
                </p>


                <h2
                  className="
                    text-3xl
                    md:text-4xl
                    lg:text-5xl
                    font-bold
                    tracking-tight
                    leading-tight
                    mb-6
                  "
                >
                  See more than just photos.
                </h2>


                <p
                  className="
                    text-white/65
                    leading-relaxed
                    mb-8
                    max-w-md
                  "
                >
                  Roomie's 3D experience allows you to better understand
                  a space before booking. Explore the room layout and get
                  a clearer idea of what your stay could look like.
                </p>


                <div className="flex items-center gap-3">

                  <div
                    className="
                      w-10
                      h-10
                      rounded-full
                      border
                      border-white/20
                      flex
                      items-center
                      justify-center
                    "
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>

                  <p className="text-sm text-white/70">
                    Explore with more confidence
                  </p>

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>



      {/* ================= FEATURES ================= */}
      <section className="bg-[#f7f7f5] py-20 md:py-28">

        <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8">


          {/* Heading */}
          <div className="max-w-2xl mb-14">

            <p
              className="
                text-sm
                font-semibold
                text-blue-600
                uppercase
                tracking-[0.18em]
                mb-4
              "
            >
              Built Around Your Stay
            </p>


            <h2
              className="
                text-4xl
                md:text-5xl
                font-bold
                text-gray-900
                tracking-tight
              "
            >
              Everything you need in one place.
            </h2>


            <p
              className="
                text-gray-500
                mt-5
                leading-relaxed
                text-base
                md:text-lg
              "
            >
              Roomie combines room discovery, immersive experiences,
              and booking tools to make finding your next space easier.
            </p>

          </div>


          {/* Feature Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-gray-200 border border-gray-200">

            {features.map((feature, index) => (

              <div
                key={index}
                className="
                  group
                  bg-white
                  p-7
                  sm:p-8
                  min-h-[240px]
                  transition-colors
                  duration-300
                  hover:bg-gray-50
                "
              >

                <div
                  className="
                    w-11
                    h-11
                    rounded-xl
                    bg-gray-100
                    text-gray-700
                    flex
                    items-center
                    justify-center
                    mb-8
                    group-hover:bg-gray-900
                    group-hover:text-white
                    transition-all
                    duration-300
                  "
                >
                  {feature.icon}
                </div>


                <h3
                  className="
                    text-lg
                    font-bold
                    text-gray-900
                    mb-3
                  "
                >
                  {feature.title}
                </h3>


                <p
                  className="
                    text-sm
                    text-gray-500
                    leading-relaxed
                  "
                >
                  {feature.description}
                </p>

              </div>

            ))}

          </div>

        </div>

      </section>



      {/* ================= FINAL CTA ================= */}
      <section className="bg-white py-20 md:py-28">

        <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8">


          <div
            className="
              relative
              min-h-[460px]
              rounded-3xl
              overflow-hidden
              flex
              items-center
            "
          >

            {/* Image */}
            <img
              src="/images/room1/rooms.jpg"
              alt="Roomie bedroom"
              className="
                absolute
                inset-0
                w-full
                h-full
                object-cover
              "
            />


            {/* Overlay */}
            <div className="absolute inset-0 bg-black/50" />

            <div
              className="
                absolute
                inset-0
                bg-gradient-to-r
                from-black/75
                via-black/40
                to-transparent
              "
            />


            {/* Content */}
            <div
              className="
                relative
                z-10
                px-8
                sm:px-12
                md:px-16
                py-14
                text-white
                max-w-2xl
              "
            >

              <p
                className="
                  text-xs
                  font-semibold
                  uppercase
                  tracking-[0.2em]
                  text-white/60
                  mb-5
                "
              >
                Start Your Search
              </p>


              <h2
                className="
                  text-4xl
                  md:text-5xl
                  font-bold
                  tracking-tight
                  leading-tight
                  mb-5
                "
              >
                Find a space that feels right.
              </h2>


              <p
                className="
                  text-white/70
                  text-base
                  md:text-lg
                  leading-relaxed
                  mb-8
                "
              >
                Browse Roomie's available spaces, explore room details,
                and discover your next stay.
              </p>


              <button
                type="button"
                onClick={onBack}
                className="
                  inline-flex
                  items-center
                  gap-2
                  px-7
                  py-3.5
                  bg-white
                  text-gray-900
                  rounded-full
                  text-sm
                  font-semibold
                  hover:bg-gray-100
                  hover:-translate-y-0.5
                  hover:shadow-xl
                  transition-all
                  duration-300
                "
              >
                Browse Rooms

                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 12h14m-6-6l6 6-6 6"
                  />
                </svg>
              </button>

            </div>

          </div>

        </div>

      </section>



      {/* ================= FOOTER ================= */}
      <footer className="bg-white">

        <div
          className="
            max-w-6xl
            mx-auto
            px-5
            sm:px-6
            lg:px-8
            py-8
            border-t
            border-gray-200
            flex
            flex-col
            sm:flex-row
            items-start
            sm:items-center
            justify-between
            gap-4
          "
        >

          <div>

            <p className="text-lg font-bold text-gray-900">
              Roomie
            </p>

            <p className="text-sm text-gray-500 mt-1">
              A better way to discover your next stay.
            </p>

          </div>


          <p className="text-xs text-gray-400">
            © 2026 Roomie. All rights reserved.
          </p>

        </div>

      </footer>

    </div>
  )
}

export default HowItWorksPage