import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

function RegisterPage({ onBack, onSwitchToLogin, onShowToast }) {
  const { register } = useAuth()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'renter'
  })

  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

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

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters'
    }

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

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)

    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)

    setTimeout(() => {
      const result = register({
        name: formData.name.trim(),
        email: formData.email,
        password: formData.password,
        role: formData.role
      })

      if (result.success) {
        onShowToast?.(
          `Welcome to Roomie, ${result.user.name}!`,
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
    <div className="min-h-screen bg-[#f7f7f7]">

      <div className="min-h-screen grid lg:grid-cols-[46%_54%]">

        {/* ================= LEFT IMAGE ================= */}
        <div className="hidden lg:block relative m-4 mr-0 rounded-3xl overflow-hidden">

          <img
            src="/images/room1/signup-room.jpg"
            alt="Roomie interior"
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-black/10" />

          {/* Logo */}
          <button
            type="button"
            onClick={onBack}
            className="
              absolute
              top-8
              left-8
              z-10
              flex
              items-center
              gap-2
              text-white
            "
          >
            <div
              className="
                w-10
                h-10
                rounded-xl
                bg-white/15
                backdrop-blur-xl
                border
                border-white/20
                flex
                items-center
                justify-center
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
                  strokeWidth={2}
                  d="M3 11.5L12 4l9 7.5M5 10v10h5v-6h4v6h5V10"
                />
              </svg>
            </div>

            <span className="text-xl font-bold">
              Roomie
            </span>
          </button>


          {/* Bottom Content */}
          <div
            className="
              absolute
              bottom-0
              left-0
              right-0
              z-10
              p-10
              xl:p-14
              text-white
            "
          >
            <span
              className="
                inline-flex
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
              Welcome to Roomie
            </span>

            <h2
              className="
                text-4xl
                xl:text-5xl
                font-bold
                leading-tight
                max-w-lg
              "
            >
              Your next space
              <span className="block">
                starts here.
              </span>
            </h2>

            <p
              className="
                text-white/75
                mt-5
                max-w-md
                leading-relaxed
              "
            >
              Create an account to discover rooms, explore immersive
              3D tours, manage bookings, or list your own space.
            </p>
          </div>

        </div>


        {/* ================= REGISTER SIDE ================= */}
        <div
          className="
            min-h-screen
            flex
            justify-center
            items-start
            lg:items-center
            px-5
            sm:px-8
            py-8
            lg:py-12
            overflow-y-auto
          "
        >
          <div className="w-full max-w-xl">

            {/* Mobile Header */}
            <div className="lg:hidden flex items-center justify-between mb-10">

              <button
                type="button"
                onClick={onBack}
                className="flex items-center gap-2"
              >
                <div
                  className="
                    w-9
                    h-9
                    rounded-lg
                    bg-gradient-to-br
                    from-violet-500
                    to-blue-600
                    flex
                    items-center
                    justify-center
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
                      d="M3 11.5L12 4l9 7.5M5 10v10h5v-6h4v6h5V10"
                    />
                  </svg>
                </div>

                <span className="text-xl font-bold text-indigo-500">
                  Roomie
                </span>
              </button>

            </div>


            {/* Back */}
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="
                  hidden
                  lg:flex
                  items-center
                  gap-2
                  text-sm
                  text-gray-500
                  hover:text-gray-900
                  mb-8
                  transition-colors
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

                Back to home
              </button>
            )}


            {/* Heading */}
            <div className="mb-8">

              <p
                className="
                  text-sm
                  font-semibold
                  text-blue-600
                  uppercase
                  tracking-wider
                  mb-3
                "
              >
                Create your account
              </p>

              <h1
                className="
                  text-3xl
                  sm:text-4xl
                  font-bold
                  text-gray-900
                  tracking-tight
                "
              >
                Join Roomie
              </h1>

              <p className="text-gray-500 mt-3">
                Tell us a little about yourself to get started.
              </p>

            </div>


            {/* GENERAL ERROR */}
            {errors.general && (
              <div
                className="
                  mb-6
                  p-4
                  bg-red-50
                  border
                  border-red-200
                  rounded-xl
                "
              >
                <p className="text-sm text-red-700 flex items-center gap-2">

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
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>

                  {errors.general}

                </p>
              </div>
            )}


            {/* ================= FORM ================= */}
            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >

              {/* NAME */}
              <div>

                <label
                  htmlFor="name"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Full Name
                </label>

                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className={`
                    w-full
                    px-4
                    py-3.5
                    bg-white
                    border
                    rounded-xl
                    outline-none
                    transition-all
                    focus:ring-4
                    ${
                      errors.name
                        ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                        : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100'
                    }
                  `}
                />

                {errors.name && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.name}
                  </p>
                )}

              </div>


              {/* EMAIL */}
              <div>

                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Email Address
                </label>

                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className={`
                    w-full
                    px-4
                    py-3.5
                    bg-white
                    border
                    rounded-xl
                    outline-none
                    transition-all
                    focus:ring-4
                    ${
                      errors.email
                        ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                        : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100'
                    }
                  `}
                />

                {errors.email && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.email}
                  </p>
                )}

              </div>


              {/* ================= ROLE ================= */}
              <div>

                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  I want to...
                </label>

                <div className="grid grid-cols-3 gap-3">

                  {/* RENTER */}
                  <button
                    type="button"
                    onClick={() =>
                      setFormData(prev => ({
                        ...prev,
                        role: 'renter'
                      }))
                    }
                    className={`
                      p-4
                      rounded-xl
                      border
                      transition-all
                      duration-200
                      ${
                        formData.role === 'renter'
                          ? 'border-blue-500 bg-blue-50 shadow-sm'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }
                    `}
                  >
                    <svg
                      className={`
                        w-6
                        h-6
                        mx-auto
                        mb-2
                        ${
                          formData.role === 'renter'
                            ? 'text-blue-600'
                            : 'text-gray-400'
                        }
                      `}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>

                    <span className="block text-sm font-semibold text-gray-800">
                      Find Room
                    </span>

                    <span className="text-[11px] text-gray-500">
                      Renter
                    </span>
                  </button>


                  {/* HOST */}
                  <button
                    type="button"
                    onClick={() =>
                      setFormData(prev => ({
                        ...prev,
                        role: 'host'
                      }))
                    }
                    className={`
                      p-4
                      rounded-xl
                      border
                      transition-all
                      duration-200
                      ${
                        formData.role === 'host'
                          ? 'border-purple-500 bg-purple-50 shadow-sm'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }
                    `}
                  >
                    <svg
                      className={`
                        w-6
                        h-6
                        mx-auto
                        mb-2
                        ${
                          formData.role === 'host'
                            ? 'text-purple-600'
                            : 'text-gray-400'
                        }
                      `}
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

                    <span className="block text-sm font-semibold text-gray-800">
                      List Room
                    </span>

                    <span className="text-[11px] text-gray-500">
                      Host
                    </span>
                  </button>


                  {/* ADMIN */}
                  <button
                    type="button"
                    onClick={() =>
                      setFormData(prev => ({
                        ...prev,
                        role: 'admin'
                      }))
                    }
                    className={`
                      p-4
                      rounded-xl
                      border
                      transition-all
                      duration-200
                      ${
                        formData.role === 'admin'
                          ? 'border-indigo-500 bg-indigo-50 shadow-sm'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }
                    `}
                  >
                    <svg
                      className={`
                        w-6
                        h-6
                        mx-auto
                        mb-2
                        ${
                          formData.role === 'admin'
                            ? 'text-indigo-600'
                            : 'text-gray-400'
                        }
                      `}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>

                    <span className="block text-sm font-semibold text-gray-800">
                      Manage
                    </span>

                    <span className="text-[11px] text-gray-500">
                      Admin
                    </span>
                  </button>

                </div>

              </div>


              {/* PASSWORD */}
              <div>

                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Password
                </label>

                <div className="relative">

                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a password"
                    className={`
                      w-full
                      px-4
                      py-3.5
                      pr-12
                      bg-white
                      border
                      rounded-xl
                      outline-none
                      transition-all
                      focus:ring-4
                      ${
                        errors.password
                          ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                          : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100'
                      }
                    `}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="
                      absolute
                      right-4
                      top-1/2
                      -translate-y-1/2
                      text-gray-400
                      hover:text-gray-700
                    "
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
                  <p className="mt-2 text-sm text-red-600">
                    {errors.password}
                  </p>
                )}

              </div>


              {/* CONFIRM PASSWORD */}
              <div>

                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Confirm Password
                </label>

                <input
                  type={showPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  className={`
                    w-full
                    px-4
                    py-3.5
                    bg-white
                    border
                    rounded-xl
                    outline-none
                    transition-all
                    focus:ring-4
                    ${
                      errors.confirmPassword
                        ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                        : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100'
                    }
                  `}
                />

                {errors.confirmPassword && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.confirmPassword}
                  </p>
                )}

              </div>


              {/* TERMS */}
              <div className="flex items-start">

                <input
                  id="terms"
                  type="checkbox"
                  required
                  className="
                    h-4
                    w-4
                    mt-1
                    text-blue-600
                    focus:ring-blue-500
                    border-gray-300
                    rounded
                  "
                />

                <label
                  htmlFor="terms"
                  className="ml-3 text-sm text-gray-500 leading-relaxed"
                >
                  I agree to the{' '}

                  <a
                    href="#"
                    className="text-blue-600 hover:text-blue-700 font-semibold"
                  >
                    Terms of Service
                  </a>

                  {' '}and{' '}

                  <a
                    href="#"
                    className="text-blue-600 hover:text-blue-700 font-semibold"
                  >
                    Privacy Policy
                  </a>
                </label>

              </div>


              {/* SUBMIT */}
              <button
                type="submit"
                disabled={isLoading}
                className={`
                  w-full
                  py-3.5
                  px-4
                  rounded-xl
                  font-semibold
                  text-white
                  transition-all
                  duration-300
                  ${
                    isLoading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 hover:-translate-y-0.5 hover:shadow-lg shadow-blue-600/20'
                  }
                `}
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

                    Creating account...

                  </span>
                ) : (
                  'Create Account'
                )}
              </button>

            </form>


            {/* LOGIN LINK */}
            <div className="mt-7 text-center">

              <p className="text-sm text-gray-500">
                Already have an account?{' '}

                <button
                  type="button"
                  onClick={onSwitchToLogin}
                  className="
                    font-semibold
                    text-blue-600
                    hover:text-blue-700
                  "
                >
                  Sign in
                </button>
              </p>

            </div>


            {/* Demo Note */}
            <p className="mt-6 text-center text-xs text-gray-400">
              🔒 Demo application — account information is stored locally.
            </p>

          </div>
        </div>

      </div>
    </div>
  )
}

export default RegisterPage