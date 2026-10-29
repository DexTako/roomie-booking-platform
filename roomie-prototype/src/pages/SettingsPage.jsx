import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import Breadcrumb from '../components/Breadcrumb'
import ChangePasswordForm from '../components/ChangePasswordForm'

function SettingsPage({ onBack, onShowToast }) {
  const { user } = useAuth()
  const settingsKey = `roomie-settings:${user?.id || user?._id || 'guest'}`
  const defaultSettings = {
    emailNotifications: true,
    smsNotifications: false,
    bookingReminders: true,
    promotionalEmails: false,
    weeklyNewsletter: true
  }

  // Remember the toggles on this device (they used to reset every time you left the page)
  const [settings, setSettings] = useState(() => {
    try {
      return { ...defaultSettings, ...JSON.parse(localStorage.getItem(settingsKey)) }
    } catch {
      return defaultSettings
    }
  })

  const handleSettingToggle = (setting) => {
    const next = { ...settings, [setting]: !settings[setting] }
    setSettings(next)
    try {
      localStorage.setItem(settingsKey, JSON.stringify(next))
    } catch {
      // storage unavailable - the toggle still works for this visit
    }
    onShowToast('Setting updated', 'success')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 pt-24">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: 'Home', onClick: onBack },
            { label: 'Settings' }
          ]}
        />

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Manage your account preferences</p>
        </div>

        {/* Notifications Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            Notifications
          </h3>

          <div className="space-y-4">
            {[
              { id: 'emailNotifications', label: 'Email Notifications', description: 'Receive booking updates via email' },
              { id: 'smsNotifications', label: 'SMS Notifications', description: 'Get text messages for important updates' },
              { id: 'bookingReminders', label: 'Booking Reminders', description: 'Receive reminders before check-in' },
              { id: 'promotionalEmails', label: 'Promotional Emails', description: 'Receive special offers and discounts' },
              { id: 'weeklyNewsletter', label: 'Weekly Newsletter', description: 'Get weekly updates about new rooms' }
            ].map(setting => (
              <div key={setting.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{setting.label}</h4>
                  <p className="text-sm text-gray-600">{setting.description}</p>
                </div>
                <button
                  onClick={() => handleSettingToggle(setting.id)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings[setting.id] ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings[setting.id] ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Security Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Security
          </h3>

          <ChangePasswordForm onShowToast={onShowToast} />
        </div>
      </div>
    </div>
  )
}

export default SettingsPage
