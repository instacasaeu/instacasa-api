// api/send-quote.js

const sgMail = require('@sendgrid/mail')
const ALLOWED_ORIGIN = 'https://instacasa.eu'

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

module.exports = async (req, res) => {
  // 1) Always set CORS headers
  const origin = req.headers.origin
  if (origin === ALLOWED_ORIGIN) {
    res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN)
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  // 2) Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(204).end()
  }

  // 3) Only allow POST from here on
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  // 4) Validate payload
  const { name, email, message } = req.body
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Missing name, email or message.' })
  }

  // 5) Send the email via SendGrid
  try {
    await sgMail.send({
      to:   'instacasaeu@gmail.com',
      from: 'no-reply@instacasa.eu',
      subject: `Quote request from ${name}`,
      text:    `${message}\n—${name} <${email}>`,
      html:    `<p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Message:</strong><br/>${message}</p>`
    })
    return res.status(200).json({ success: true })
  } catch (err) {
    console.error('SendGrid Error:', err.response?.body || err.message)
    return res.status(502).json({ error: 'Failed to send email.' })
  }
}
