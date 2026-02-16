import Twilio from 'twilio'

let client = null
function getClient() {
  if (client) return client
  const sid = process.env.TWILIO_ACCOUNT_SID
  const token = process.env.TWILIO_AUTH_TOKEN
  if (sid && token) {
    client = new Twilio(sid, token)
  }
  return client
}

export async function sendSMS(to, body) {
  const from = process.env.TWILIO_FROM_NUMBER
  const c = getClient()
  if (!c || !from) {
    console.log('Twilio not configured; SMS skipped:', { to, body })
    return { skipped: true }
  }
  try {
    return await c.messages.create({ to, from, body })
  } catch (err) {
    console.error('Twilio SMS error', err)
    return { error: true, detail: String(err) }
  }
}
