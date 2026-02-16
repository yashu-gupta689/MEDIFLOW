export function generateInvoicePDF(bill) {
  const textLines = [
    `Invoice`,
    `Invoice ID: ${bill._id}`,
    `Date: ${new Date(bill.createdAt || Date.now()).toLocaleString()}`,
    `Hospital: ${bill.hospital?.name || 'Hospital'}`,
    `Patient: ${bill.patient?.name || bill.patient}`,
    ``,
    `Items:`
  ]
  for (const it of bill.items || []) {
    textLines.push(` - ${it.description}: Rs ${Number(it.amount).toFixed(2)}`)
  }
  textLines.push(``)
  textLines.push(`Subtotal: Rs ${Number(bill.subtotal).toFixed(2)}`)
  textLines.push(`Insurance (${bill.insurance?.type || 'none'} ${bill.insurance?.coveragePercent || 0}%): -Rs ${Number(bill.insuranceAmount).toFixed(2)}`)
  textLines.push(`Total Payable: Rs ${Number(bill.totalPayable).toFixed(2)} ${bill.currency || 'INR'}`)
  textLines.push(`Payment Status: ${bill.paymentStatus}`)
  const content = textLines.join('\n')
  const objects = []
  const addObject = (str) => {
    const offset = objects.reduce((acc, o) => acc + o.length, 0)
    const buf = Buffer.from(str, 'binary')
    objects.push(buf)
    return offset
  }
  const header = '%PDF-1.4\n'
  addObject(header)
  const fontObjNum = 1
  addObject(`${fontObjNum} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n`)
  const pageObjNum = 2
  const contentsObjNum = 3
  const pagesObjNum = 4
  const catalogObjNum = 5
  const lines = content.split('\n')
  const yStart = 800
  const lineHeight = 18
  const streamLines = []
  let y = yStart
  for (const line of lines) {
    streamLines.push(`BT /F1 12 Tf 72 ${y} Td (${escapePDFText(line)}) Tj ET`)
    y -= lineHeight
  }
  const stream = streamLines.join('\n')
  const contents = `${contentsObjNum} 0 obj\n<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}\nendstream\nendobj\n`
  addObject(contents)
  const page = `${pageObjNum} 0 obj\n<< /Type /Page /Parent ${pagesObjNum} 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 ${fontObjNum} 0 R >> >> /Contents ${contentsObjNum} 0 R >>\nendobj\n`
  addObject(page)
  const pages = `${pagesObjNum} 0 obj\n<< /Type /Pages /Kids [ ${pageObjNum} 0 R ] /Count 1 >>\nendobj\n`
  addObject(pages)
  const catalog = `${catalogObjNum} 0 obj\n<< /Type /Catalog /Pages ${pagesObjNum} 0 R >>\nendobj\n`
  addObject(catalog)
  const xrefStart = objects.reduce((acc, o) => acc + o.length, 0)
  const xrefEntries = []
  let offset = 0
  for (const obj of objects) {
    xrefEntries.push(offset)
    offset += obj.length
  }
  const xrefTable = buildXref(xrefEntries.length, xrefEntries)
  const trailer = `trailer\n<< /Size ${xrefEntries.length} /Root ${catalogObjNum} 0 R >>\nstartxref\n${xrefStart}\n%%EOF`
  const pdfBuffer = Buffer.concat([...objects, Buffer.from(xrefTable), Buffer.from(trailer)])
  return pdfBuffer
}

function escapePDFText(text) {
  return String(text).replace(/([\\()])/g, '\\$1')
}

function buildXref(count, offsets) {
  let s = 'xref\n0 ' + count + '\n'
  for (let i = 0; i < count; i++) {
    const off = offsets[i]
    s += `${String(off).padStart(10, '0')} 00000 n \n`
  }
  return s
}
