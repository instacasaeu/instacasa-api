// api/send-quote.js

const sgMail = require('@sendgrid/mail')
const ALLOWED_ORIGIN = 'https://instacasa.eu'

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

module.exports = async (req, res) => {
  // 1) CORS headers on every request
  const origin = req.headers.origin
  if (origin === ALLOWED_ORIGIN) {
    res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN)
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  // 2) Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(204).end()
  }

  // 3) Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  // 4) Extract your form fields
  const {
    firstName,
    lastName,
    email,
    phone,       // optional
    location,    // optional project location
    homeSize,    // optional home size
    details      // the project details textarea
  } = req.body

  // Compose a full name and message
  const name = [firstName, lastName].filter(Boolean).join(' ')
  const message = details

  // 5) Validate required fields
  if (!name || !email || !message) {
    return res
      .status(400)
      .json({ error: 'Missing first name, last name, email or project details.' })
  }

  // 6) Send the email
  try {
    await sgMail.send({
      to:   'instacasaeu@gmail.com',
      from: 'no-reply@instacasa.eu',
      subject: `Quote request from ${name}`,
      text:
        `Name: ${name}
Email: ${email}
Phone: ${phone || 'N/A'}
Location: ${location || 'N/A'}
Home Size: ${homeSize || 'N/A'}

Details:
${message}`,
      html: `<p><strong>Name:</strong> ${name}</p>
             <p><strong>Email:</strong> ${email}</p>
             <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
             <p><strong>Location:</strong> ${location || 'N/A'}</p>
             <p><strong>Home Size:</strong> ${homeSize || 'N/A'}</p>
             <p><strong>Details:</strong><br/>${message}</p>`
    })

    return res.status(200).json({ success: true })
  } catch (err) {
    console.error('SendGrid Error:', err.response?.body || err.message)
    return res.status(502).json({ error: 'Failed to send email.' })
  }
}
