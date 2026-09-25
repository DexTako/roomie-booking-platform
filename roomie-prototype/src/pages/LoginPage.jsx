import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import ForgotPasswordModal from '../components/ForgotPasswordModal'

function LoginPage({ onBack, onSwitchToRegister, onShowToast }) {
  const { login } = useAuth()

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target

    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    setErrors(newErrors)

    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)

    setTimeout(() => {
      const result = login(formData.email, formData.password)

      if (result.success) {
        onShowToast?.(
          `Welcome back, ${result.user.name}!`,
          'success'
        )

        onBack?.()
      } else {
        setErrors({
          general: result.error
        })

        onShowToast?.(
          result.error,
          'error'
        )
      }

      setIsLoading(false)
    }, 500)
  }

  return (
    <div className="min-h-screen bg-slate-50">

      <div className="min-h-screen grid lg:grid-cols-2">

        {/* Left Side */}
        {/* ================= LEFT IMAGE ================= */}
<div className="hidden lg:block relative m-4 mr-0 rounded-3xl overflow-hidden">

  {/* Background Image */}
  <img
    src="/images/room1/signin-room.jpg"
    alt="Roomie interior"
    className="absolute inset-0 w-full h-full object-cover"
  />

  {/* Dark Overlay */}
  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/10" />


  {/* Content */}
  <div className="relative z-10 flex flex-col justify-between w-full h-full p-12 xl:p-16">

    {/* Brand */}
    <button
      type="button"
      onClick={onBack}
      className="flex items-center gap-3 w-fit text-white"
    >
      <div
        className="
          w-11
          h-11
          bg-white/15
          backdrop-blur-xl
          border
          border-white/20
          rounded-xl
          flex
          items-center
          justify-center
        "
      >
        <svg
          className="w-6 h-6 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      </div>

      <span className="text-xl font-bold tracking-tight">
        Roomie
      </span>
    </button>


    {/* Main Content */}
    <div className="max-w-lg">

      <span
        className="
          inline-flex
          items-center
          px-4
          py-2
          rounded-full
          border
          border-white/20
          bg-white/10
          backdrop-blur-md
          text-xs
          font-semibold
          tracking-wider
          text-white
          mb-6
        "
      >
        WELCOME BACK
      </span>


      <h2
        className="
          text-4xl
          xl:text-5xl
          font-bold
          leading-tight
          tracking-tight
          mb-6
          text-white
        "
      >
        Your perfect stay
        <span className="block">
          is waiting.
        </span>
      </h2>


      <p className="text-white/75 text-lg leading-relaxed">
        Sign in to continue exploring rooms, immersive 3D tours,
        and manage your Roomie bookings.
      </p>


      {/* Features */}
      <div className="grid grid-cols-2 gap-4 mt-10">

        {/* Verified Listings */}
        <div
          className="
            border
            border-white/20
            bg-white/10
            backdrop-blur-md
            rounded-2xl
            p-4
          "
        >
          <div
            className="
              w-9
              h-9
              rounded-lg
              bg-white/15
              flex
              items-center
              justify-center
              mb-3
            "
          >
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          <p className="text-sm font-semibold text-white">
            Verified Listings
          </p>

          <p className="text-xs text-white/60 mt-1">
            Trusted properties
          </p>
        </div>


        {/* 3D Tours */}
        <div
          className="
            border
            border-white/20
            bg-white/10
            backdrop-blur-md
            rounded-2xl
            p-4
          "
        >
          <div
            className="
              w-9
              h-9
              rounded-lg
              bg-white/15
              flex
              items-center
              justify-center
              mb-3
            "
          >
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1m-2 1l2 1m-2-1v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5"
              />
            </svg>
          </div>

          <p className="text-sm font-semibold text-white">
            3D Room Tours
          </p>

          <p className="text-xs text-white/60 mt-1">
            Explore before booking
          </p>
        </div>

      </div>
    </div>


    {/* Footer */}
    <p className="text-xs text-white/50">
      © 2026 Roomie. All rights reserved.
    </p>

  </div>

</div>

        {/* Right Side */}
        <div className="relative flex items-center justify-center px-4 sm:px-8 py-10 md:py-12">

          <div className="w-full max-w-md">

            {/* Back Button */}
            {onBack && (
              <button
                onClick={onBack}
                className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
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
            )}

            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center gap-3 mb-10">

              <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
              </div>

              <span className="text-xl font-bold text-gray-900">
                Roomie
              </span>

            </div>

            {/* Header */}
            <div className="mb-8">

              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
                Welcome back
              </h1>

              <p className="text-gray-500 mt-2">
                Sign in to your Roomie account to continue.
              </p>

            </div>

            {/* General Error */}
            {errors.general && (
              <div className="mb-6 flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">

                <div className="flex-shrink-0 mt-0.5">
                  <svg
                    className="w-5 h-5 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>

                <div>
                  <p className="text-sm font-semibold text-red-800">
                    Unable to sign in
                  </p>

                  <p className="text-sm text-red-700 mt-0.5">
                    {errors.general}
                  </p>
                </div>

              </div>
            )}

            {/* Login Form */}
            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Email Address
                </label>

                <div className="relative">

                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg
                      className={`w-5 h-5 ${
                        errors.email
                          ? 'text-red-400'
                          : 'text-gray-400'
                      }`}
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
                  </div>

                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className={`w-full pl-12 pr-4 py-3.5 bg-white border rounded-xl text-sm text-gray-900 placeholder-gray-400 outline-none transition-all ${
                      errors.email
                        ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
                        : 'border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10'
                    }`}
                  />

                </div>

                {errors.email && (
                  <p className="mt-2 text-xs font-medium text-red-600">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>

                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Password
                </label>

                <div className="relative">

                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg
                      className={`w-5 h-5 ${
                        errors.password
                          ? 'text-red-400'
                          : 'text-gray-400'
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.8}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4"
                      />
                    </svg>
                  </div>

                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className={`w-full pl-12 pr-12 py-3.5 bg-white border rounded-xl text-sm text-gray-900 placeholder-gray-400 outline-none transition-all ${
                      errors.password
                        ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
                        : 'border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10'
                    }`}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-700 transition-colors"
                  >
                    {showPassword ? (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />

                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </button>

                </div>

                {errors.password && (
                  <p className="mt-2 text-xs font-medium text-red-600">
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Options */}
              <div className="flex items-center justify-between">

                <div className="flex items-center">

                  <input
                    id="remember"
                    type="checkbox"
                    className="w-4 h-4 text-slate-900 border-gray-300 rounded focus:ring-slate-900"
                  />

                  <label
                    htmlFor="remember"
                    className="ml-2 text-sm text-gray-600"
                  >
                    Remember me
                  </label>

                </div>

                <button
                  type="button"
                  onClick={() => setShowForgotPasswordModal(true)}
                  className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Forgot password?
                </button>

              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex items-center justify-center py-3.5 px-4 rounded-xl text-sm font-semibold text-white transition-all duration-200 ${
                  isLoading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-slate-900 hover:bg-slate-800 shadow-sm hover:shadow-md active:scale-[0.99]'
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">

                    <svg
                      className="animate-spin h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />

                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>

                    Signing in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </button>

            </form>

            {/* Sign Up */}
            <div className="mt-7 text-center">

              <p className="text-sm text-gray-500">
                Don't have an account?{' '}

                <button
                  onClick={onSwitchToRegister}
                  className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Create an account
                </button>
              </p>

            </div>

            {/* Divider */}
            <div className="flex items-center gap-4 my-7">

              <div className="h-px bg-gray-200 flex-1"></div>

              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                Demo Access
              </span>

              <div className="h-px bg-gray-200 flex-1"></div>

            </div>

            {/* Demo Accounts */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5">

              <div className="flex items-start justify-between mb-4">

                <div>
                  <h3 className="text-sm font-bold text-gray-900">
                    Demo Accounts
                  </h3>

                  <p className="text-xs text-gray-500 mt-1">
                    Use any of these accounts to explore Roomie.
                  </p>
                </div>

                <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">

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
                      d="M12 11c0-1.105-.895-2-2-2s-2 .895-2 2 .895 2 2 2 2-.895 2-2zm0 0h4m-4 0v4m7-9V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2v-1"
                    />
                  </svg>

                </div>

              </div>

              <div className="space-y-2">

                <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50">

                  <div>
                    <p className="text-xs font-semibold text-gray-900">
                      Administrator
                    </p>

                    <p className="text-xs text-gray-500 mt-0.5">
                      admin@roomie.com
                    </p>
                  </div>

                  <span className="text-xs font-mono bg-white border border-gray-200 px-2 py-1 rounded-md text-gray-500">
                    admin123
                  </span>

                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50">

                  <div>
                    <p className="text-xs font-semibold text-gray-900">
                      Host
                    </p>

                    <p className="text-xs text-gray-500 mt-0.5">
                      host@roomie.com
                    </p>
                  </div>

                  <span className="text-xs font-mono bg-white border border-gray-200 px-2 py-1 rounded-md text-gray-500">
                    host123
                  </span>

                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50">

                  <div>
                    <p className="text-xs font-semibold text-gray-900">
                      Renter
                    </p>

                    <p className="text-xs text-gray-500 mt-0.5">
                      renter@roomie.com
                    </p>
                  </div>

                  <span className="text-xs font-mono bg-white border border-gray-200 px-2 py-1 rounded-md text-gray-500">
                    renter123
                  </span>

                </div>

              </div>
            </div>

            {/* Security Note */}
            <div className="mt-6 flex gap-2 justify-center items-start text-center">

              <svg
                className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 11V7a4 4 0 00-8 0v4m4 4v2m-5 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H3a2 2 0 00-2 2v6a2 2 0 002 2z"
                />
              </svg>

              <p className="text-xs text-gray-400">
                This is a demo app. Passwords are stored in localStorage
                and are not secure for production.
              </p>

            </div>

          </div>
        </div>

      </div>

      {/* Forgot Password Modal */}
      {showForgotPasswordModal && (
        <ForgotPasswordModal
          onClose={() => setShowForgotPasswordModal(false)}
          onShowToast={onShowToast}
        />
      )}
    </div>
  )
}

export default LoginPage