import { sendSMS } from './twilio.js'

export function scheduleSMS(to, body, delayMs) {
  const ms = Math.max(0, delayMs || 0)
  setTimeout(async () => {
    try {
      await sendSMS(to, body)
    } catch (err) {
      console.error('Scheduled SMS failed', err)
    }
  }, ms)
}
