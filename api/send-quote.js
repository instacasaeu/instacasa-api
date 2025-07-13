// api/send-quote.js
const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end()
  const { name, email, message } = req.body
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Missing name, email or message.' })
  }
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
    res.status(200).json({ success: true })
  } catch (err) {
    console.error('SendGrid Error:', err.response?.body || err.message)
    res.status(502).json({ error: 'Failed to send email.' })
  }
}
