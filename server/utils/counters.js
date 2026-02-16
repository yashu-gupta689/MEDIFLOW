export const COUNTERS = {
  opd: { label: 'OPD Counter', avgServiceTime: 5, prefix: 'OPD' },
  billing: { label: 'Billing Counter', avgServiceTime: 3, prefix: 'BILL' },
  ayushman: { label: 'Ayushman Card Counter', avgServiceTime: 7, prefix: 'AYUSH' },
  surgery: { label: 'Surgery Consultation Counter', avgServiceTime: 10, prefix: 'SURG' },
  emergency: { label: 'Emergency Counter', avgServiceTime: 2, prefix: 'EMERG' },
}

export function getCounter(key) {
  return COUNTERS[key] || null
}
