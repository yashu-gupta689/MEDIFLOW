import multer from 'multer'
import path from 'path'
import fs from 'fs'

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

const root = path.resolve(process.cwd(), 'uploads')
ensureDir(root)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const type = req.uploadType || 'reports'
    const dir = path.join(root, type)
    ensureDir(dir)
    cb(null, dir)
  },
  filename: (req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_')
    cb(null, `${Date.now()}_${safe}`)
  }
})

export const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const ok = /pdf|image\//.test(file.mimetype)
    if (!ok) return cb(null, false)
    cb(null, true)
  },
  limits: { fileSize: 10 * 1024 * 1024 }
})
