import { useState } from 'react'

function ContactPage({ onBack, onShowToast }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    onShowToast(
      'Message sent successfully! We\'ll get back to you soon.',
      'success'
    )

    setFormData({
      name: '',
      email: '',
      subject: '',
      message: ''
    })
  }

  const contactMethods = [
    {
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      ),
      title: 'Email',
      value: 'support@roomie.com',
      description: 'Send us an email anytime'
    },
    {
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
          />
        </svg>
      ),
      title: 'Phone',
      value: '+1 (555) 123-4567',
      description: 'Mon-Fri from 8am to 6pm'
    },
    {
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
      title: 'Office',
      value: '123 Tech Street, San Francisco, CA 94103',
      description: 'Visit us in person'
    }
  ]

  const inputStyle =
    'w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 outline-none transition-all duration-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10'

  return (
    <div className="min-h-screen bg-[#f7f7f7]">

      {/* ================= HERO ================= */}
      <section className="relative min-h-[520px] md:min-h-[600px] overflow-hidden text-white">

        {/* Background Image */}
        <img
          src="/images/room1/faqs-room.jpg"
          alt="Roomie interior"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/45" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />

        <div
          className="
            relative
            z-10
            max-w-7xl
            mx-auto
            px-4
            sm:px-6
            lg:px-8
            min-h-[520px]
            md:min-h-[600px]
            flex
            flex-col
          "
        >

          {/* Top */}
          <div className="pt-6 md:pt-8">

            <button
              type="button"
              onClick={onBack}
              className="
                inline-flex
                items-center
                gap-2
                px-4
                py-2.5
                rounded-xl
                bg-white/10
                border
                border-white/20
                backdrop-blur-xl
                text-sm
                font-medium
                text-white
                hover:bg-white/20
                transition-all
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
                  d="M15 19l-7-7 7-7"
                />
              </svg>

              Back to Home
            </button>

          </div>


          {/* Hero Content */}
          <div className="flex-1 flex items-center">

            <div className="max-w-2xl pb-12">

              <span
                className="
                  inline-flex
                  items-center
                  px-4
                  py-2
                  rounded-full
                  bg-white/10
                  border
                  border-white/20
                  backdrop-blur-md
                  text-xs
                  font-semibold
                  tracking-widest
                  uppercase
                  mb-6
                "
              >
                Contact Roomie
              </span>


              <h1
                className="
                  text-5xl
                  sm:text-6xl
                  md:text-7xl
                  font-bold
                  tracking-tight
                  leading-[0.95]
                  mb-6
                "
              >
                Let's talk.
              </h1>


              <p
                className="
                  text-base
                  md:text-xl
                  text-white/80
                  leading-relaxed
                  max-w-xl
                "
              >
                Have a question about a room, booking, or your account?
                Our team is here to help.
              </p>

            </div>

          </div>
        </div>
      </section>


      {/* ================= MAIN CONTENT ================= */}
      <main
        className="
          max-w-6xl
          mx-auto
          px-4
          sm:px-6
          lg:px-8
          py-16
          md:py-24
        "
      >

        {/* Intro */}
        <div className="text-center max-w-2xl mx-auto mb-14">

          <p
            className="
              text-sm
              font-semibold
              text-blue-600
              uppercase
              tracking-widest
              mb-3
            "
          >
            We're here to help
          </p>

          <h2
            className="
              text-3xl
              md:text-5xl
              font-bold
              text-gray-900
              tracking-tight
            "
          >
            Get in touch with Roomie
          </h2>

          <p className="text-gray-500 mt-4 leading-relaxed">
            Send us a message or reach us through any of the options below.
          </p>

        </div>


        <div className="grid lg:grid-cols-5 gap-8">


          {/* ================= CONTACT FORM ================= */}
          <div className="lg:col-span-3">

            <div
              className="
                bg-white
                rounded-3xl
                shadow-xl
                shadow-black/5
                border
                border-gray-100
                overflow-hidden
              "
            >

              <div className="px-6 sm:px-8 py-7 border-b border-gray-100">

                <h2 className="text-2xl font-bold text-gray-900">
                  Send us a message
                </h2>

                <p className="text-sm text-gray-500 mt-2">
                  Fill out the form and we'll get back to you as soon as possible.
                </p>

              </div>


              <form
                onSubmit={handleSubmit}
                className="p-6 sm:p-8 space-y-6"
              >

                {/* Name */}
                <div>

                  <label
                    htmlFor="name"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Your Name
                  </label>

                  <input
                    id="name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className={inputStyle}
                    required
                  />

                </div>


                {/* Email */}
                <div>

                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Email Address
                  </label>

                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email address"
                    className={inputStyle}
                    required
                  />

                </div>


                {/* Subject */}
                <div>

                  <label
                    htmlFor="subject"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Subject
                  </label>

                  <input
                    id="subject"
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="How can we help?"
                    className={inputStyle}
                    required
                  />

                </div>


                {/* Message */}
                <div>

                  <label
                    htmlFor="message"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Message
                  </label>

                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={6}
                    placeholder="Tell us more about your question or concern..."
                    className={`${inputStyle} resize-none`}
                    required
                  />

                </div>


                {/* Submit */}
                <button
                  type="submit"
                  className="
                    w-full
                    flex
                    items-center
                    justify-center
                    gap-2
                    px-6
                    py-3.5
                    bg-blue-600
                    text-white
                    rounded-xl
                    hover:bg-blue-700
                    hover:-translate-y-0.5
                    hover:shadow-lg
                    active:scale-[0.99]
                    transition-all
                    duration-300
                    font-semibold
                    text-sm
                    shadow-md
                    shadow-blue-600/20
                  "
                >
                  Send Message

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


                <p className="text-center text-xs text-gray-400">
                  We'll only use your information to respond to your inquiry.
                </p>

              </form>

            </div>

          </div>


          {/* ================= RIGHT SIDE ================= */}
          <div className="lg:col-span-2 space-y-6">


            {/* CONTACT INFORMATION */}
            <div
              className="
                bg-white
                rounded-3xl
                border
                border-gray-100
                shadow-xl
                shadow-black/5
                overflow-hidden
              "
            >

              <div className="px-6 py-6 border-b border-gray-100">

                <h2 className="text-xl font-bold text-gray-900">
                  Contact Information
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Other ways you can reach our team.
                </p>

              </div>


              <div className="p-6 space-y-7">

                {contactMethods.map((method, index) => (

                  <div
                    key={index}
                    className="group flex gap-4"
                  >

                    <div
                      className="
                        flex-shrink-0
                        w-11
                        h-11
                        bg-blue-50
                        rounded-xl
                        flex
                        items-center
                        justify-center
                        text-blue-600
                        group-hover:bg-blue-600
                        group-hover:text-white
                        transition-all
                        duration-300
                      "
                    >
                      {method.icon}
                    </div>


                    <div className="min-w-0">

                      <h3 className="text-sm font-semibold text-gray-900">
                        {method.title}
                      </h3>

                      <p className="text-sm text-blue-600 font-medium mt-0.5 break-words">
                        {method.value}
                      </p>

                      <p className="text-xs text-gray-500 mt-1">
                        {method.description}
                      </p>

                    </div>

                  </div>

                ))}

              </div>

            </div>


            {/* ================= FAQ ================= */}
            <div
              className="
                relative
                overflow-hidden
                rounded-3xl
                min-h-[260px]
                shadow-xl
                shadow-black/10
              "
            >

              {/* FAQ Image */}
              <img
                src="/images/room1/rooms.jpg"
                alt="Roomie help"
                className="
                  absolute
                  inset-0
                  w-full
                  h-full
                  object-cover
                "
              />

              <div className="absolute inset-0 bg-black/60" />

              <div
                className="
                  relative
                  z-10
                  h-full
                  min-h-[260px]
                  flex
                  flex-col
                  justify-end
                  p-7
                  text-white
                "
              >

                <div
                  className="
                    w-10
                    h-10
                    rounded-xl
                    bg-white/15
                    backdrop-blur-md
                    border
                    border-white/20
                    flex
                    items-center
                    justify-center
                    mb-5
                  "
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.8}
                      d="M8.228 9a3.001 3.001 0 115.634 1.43c-.62.76-1.862 1.27-1.862 2.57m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>


                <h3 className="text-xl font-bold mb-2">
                  Frequently Asked Questions
                </h3>

                <p className="text-sm text-white/70 leading-relaxed mb-5">
                  Find quick answers to common questions about bookings,
                  payments, and more.
                </p>

                <button
                  type="button"
                  className="
                    group
                    inline-flex
                    items-center
                    gap-2
                    text-sm
                    text-white
                    font-semibold
                    w-fit
                    hover:text-blue-200
                    transition-colors
                  "
                >
                  View FAQ

                  <svg
                    className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>

                </button>

              </div>

            </div>


            {/* ================= SOCIAL MEDIA ================= */}
            <div
              className="
                bg-white
                border
                border-gray-100
                rounded-3xl
                shadow-xl
                shadow-black/5
                p-6
              "
            >

              <div className="mb-5">

                <h3 className="text-lg font-bold text-gray-900">
                  Follow Us
                </h3>

                <p className="text-sm text-gray-500 mt-1">
                  Stay connected with Roomie.
                </p>

              </div>


              <div className="flex gap-3">

                {[
                  'facebook',
                  'twitter',
                  'instagram',
                  'linkedin'
                ].map((social) => (

                  <button
                    key={social}
                    type="button"
                    title={social}
                    className="
                      w-10
                      h-10
                      border
                      border-gray-200
                      bg-white
                      rounded-xl
                      flex
                      items-center
                      justify-center
                      text-sm
                      font-bold
                      text-gray-600
                      hover:bg-blue-600
                      hover:border-blue-600
                      hover:text-white
                      hover:-translate-y-1
                      transition-all
                      duration-300
                    "
                  >
                    {social[0].toUpperCase()}
                  </button>

                ))}

              </div>

            </div>

          </div>

        </div>

      </main>

    </div>
  )
}

export default ContactPage