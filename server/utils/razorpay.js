import https from 'https'
import crypto from 'crypto'

function getKeys() {
  const key_id = process.env.RAZORPAY_KEY_ID
  const key_secret = process.env.RAZORPAY_KEY_SECRET
  if (!key_id || !key_secret) {
    throw new Error('Razorpay keys not configured')
  }
  return { key_id, key_secret }
}

export function createRazorpayOrder({ amount, currency = 'INR', receipt, notes }) {
  const { key_id, key_secret } = getKeys()
  const data = JSON.stringify({ amount, currency, receipt, notes })
  const options = {
    hostname: 'api.razorpay.com',
    port: 443,
    path: '/v1/orders',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data),
      'Authorization': 'Basic ' + Buffer.from(`${key_id}:${key_secret}`).toString('base64')
    }
  }
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = ''
      res.on('data', (chunk) => { body += chunk })
      res.on('end', () => {
        try {
          const json = JSON.parse(body)
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(json)
          } else {
            reject(new Error(json?.error?.description || 'Razorpay order creation failed'))
          }
        } catch (e) {
          reject(e)
        }
      })
    })
    req.on('error', reject)
    req.write(data)
    req.end()
  })
}

export function verifyRazorpaySignature(orderId, paymentId, signature) {
  const { key_secret } = getKeys()
  const hmac = crypto.createHmac('sha256', key_secret)
  hmac.update(orderId + '|' + paymentId)
  const expectedSignature = hmac.digest('hex')
  return expectedSignature === signature
}
