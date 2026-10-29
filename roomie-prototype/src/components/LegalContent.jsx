// The text of the Terms of Service and the Privacy Policy, plus the component that shows it.
// Used by the full pages (footer links) and by the pop-up on the sign-up form.

const SUPPORT_EMAIL = 'support@roomie.com'
const LAST_UPDATED = 'October 23, 2026'

export const LEGAL_DOCS = {
  terms: {
    title: 'Terms of Service',
    intro:
      'Welcome to Roomie. By creating an account or using Roomie you agree to these terms. Please read them carefully.',
    sections: [
      {
        heading: '1. About Roomie',
        body: [
          'Roomie is a platform where guests can explore rooms in 3D and send booking requests to hosts. Roomie connects guests and hosts; the stay itself is an agreement between the guest and the host.'
        ]
      },
      {
        heading: '2. Your account',
        body: [
          'You must provide correct information when you sign up and keep your password private. You are responsible for everything that happens under your account.',
          'You can sign up as a customer (guest) or as a host. Please tell us right away if you think someone else is using your account.'
        ]
      },
      {
        heading: '3. Bookings',
        body: [
          'A booking is a request. It stays Pending until the host approves or declines it, and a booking is only confirmed once it is Approved.',
          'Dates that are already booked, or held by a pending request, cannot be booked by someone else. You can cancel a pending or upcoming booking from My Bookings, which makes the dates available again.',
          'Hosts must answer requests honestly and provide the room as described. Guests must follow the host\'s house rules and respect the property.'
        ]
      },
      {
        heading: '4. Prices and payments',
        body: [
          'The total shown at checkout includes the room price for the nights you chose and a service fee. Prices are set by hosts.',
          'The checkout in the current version of Roomie is a demonstration. No real money is charged and no real card details are saved.'
        ]
      },
      {
        heading: '5. Messages, reviews and other content',
        body: [
          'You may send messages to hosts or guests about a booking, and write one review for a room after your stay has ended. Profile pictures are added by link.',
          'You are responsible for what you post. Do not post content that is false, abusive, hateful, illegal, or that belongs to someone else. We may remove content that breaks these terms.'
        ]
      },
      {
        heading: '6. What you may not do',
        body: [
          'Do not misuse Roomie. That includes trying to break or overload the service, accessing other people\'s accounts or data, creating fake bookings or reviews, or using Roomie for anything illegal.'
        ]
      },
      {
        heading: '7. Suspending accounts',
        body: [
          'Administrators may suspend or ban an account that breaks these terms. When a customer account is banned, that customer\'s pending and upcoming bookings are cancelled.'
        ]
      },
      {
        heading: '8. Our responsibility',
        body: [
          'We work to keep Roomie accurate and available, but we cannot promise it will always be error-free or uninterrupted. Roomie is not responsible for what happens during a stay, or for disagreements between a guest and a host, to the extent the law allows.'
        ]
      },
      {
        heading: '9. Changes to these terms',
        body: [
          'We may update these terms from time to time. The date at the top shows when they last changed. If you keep using Roomie after a change, you accept the new terms.'
        ]
      },
      {
        heading: '10. Contact',
        body: [`Questions about these terms? Email us at ${SUPPORT_EMAIL} or use the Contact page.`]
      }
    ]
  },

  privacy: {
    title: 'Privacy Policy',
    intro:
      'This policy explains what information Roomie collects, why we collect it, and the choices you have.',
    sections: [
      {
        heading: '1. Information we collect',
        body: [
          'Account information: your name, email address, and your password (stored in scrambled form, never as plain text). If you add one, your profile picture link.',
          'Booking information: the room, dates, number of guests, and the contact details or special requests you enter when booking.',
          'Messages and reviews: messages you send to hosts or guests, reviews you write, and messages you send through the Contact page.',
          'Saved items: rooms you add to your wishlist or comparison list.'
        ]
      },
      {
        heading: '2. How we use it',
        body: [
          'To create and secure your account, process your booking requests, let hosts and guests message each other, show reviews, answer your questions, and keep Roomie safe and working properly.'
        ]
      },
      {
        heading: '3. Who can see it',
        body: [
          'Hosts can see the name, contact details and request of guests who book their rooms. Guests can see the name of the host and the reviews other guests have written.',
          'Messages about a booking can be read by the guest and the host involved. Administrators can see accounts, bookings, reviews and Contact page messages in order to run and protect the service.',
          'We do not sell your information.'
        ]
      },
      {
        heading: '4. Payments',
        body: [
          'The checkout in the current version is a demonstration, and Roomie does not save the card details typed into it.'
        ]
      },
      {
        heading: '5. Storage and security',
        body: [
          'Your information is stored in Roomie\'s database. Passwords are hashed, and you stay signed in using a secure login token. When you sign in without "Remember me", you are signed out when you close the browser.',
          'No system is perfectly secure, so please choose a strong password and do not share it.'
        ]
      },
      {
        heading: '6. Your browser storage',
        body: [
          'Roomie keeps a login token and some preferences (such as your wishlist) in your browser\'s local storage so the site works as expected. You can clear them at any time in your browser settings, or by signing out.'
        ]
      },
      {
        heading: '7. Your choices and rights',
        body: [
          'You can view and edit your name, email and profile picture on the My Profile page. You can ask us to correct or delete your information, or to tell you what we hold about you, by emailing us. These rights follow the Data Privacy Act of 2012 of the Philippines.',
          'Deleting an account may also remove the bookings and reviews linked to it.'
        ]
      },
      {
        heading: '8. Age',
        body: ['Roomie is meant for people who are 18 or older.']
      },
      {
        heading: '9. Changes to this policy',
        body: ['We may update this policy. The date at the top shows when it last changed.']
      },
      {
        heading: '10. Contact',
        body: [`For privacy questions or requests, email ${SUPPORT_EMAIL} or use the Contact page.`]
      }
    ]
  }
}

function LegalDocument({ type }) {
  const doc = LEGAL_DOCS[type] || LEGAL_DOCS.terms

  return (
    <article>
      <h1 className="text-3xl font-bold text-gray-900">{doc.title}</h1>
      <p className="text-sm text-gray-500 mt-1">Last updated: {LAST_UPDATED}</p>
      <p className="mt-4 text-gray-700 leading-relaxed">{doc.intro}</p>

      {doc.sections.map(section => (
        <section key={section.heading} className="mt-6">
          <h2 className="text-lg font-semibold text-gray-900">{section.heading}</h2>
          {section.body.map((paragraph, i) => (
            <p key={i} className="mt-2 text-gray-700 leading-relaxed">
              {paragraph}
            </p>
          ))}
        </section>
      ))}
    </article>
  )
}

export default LegalDocument
