import fs from 'fs'
import path from 'path'
import type express from 'express'
import multer from 'multer'
import { UPLOAD_DIR } from '../config/uploadPaths'

/** 保留原始文件名（basename），去掉路径与危险字符；过长则截断主名 */
function safeUploadBasename(originalname: string): string {
  let base = path.basename(originalname || 'file').trim()
  if (!base || base === '.' || base === '..') base = 'file'
  base = base.replace(/[\x00-\x1f\x7f]/g, '')
  base = base.replace(/[^a-zA-Z0-9._\-\u4e00-\u9fff]+/g, '_')
  base = base.replace(/\.{2,}/g, '.')
  if (base.length > 200) {
    const ext = path.extname(base)
    const stem = path.basename(base, ext).slice(0, 160)
    base = (stem || 'file') + ext
  }
  return base || 'file'
}

/** 与 uploads 内已有文件重名时，在扩展名前加 _时间戳_序号 */
function pickUniqueFilenameInUploads(desiredBasename: string): string {
  const ext = path.extname(desiredBasename)
  const stem = path.basename(desiredBasename, ext) || 'file'
  let name = desiredBasename
  for (let i = 0; i < 80; i++) {
    if (!fs.existsSync(path.join(UPLOAD_DIR, name))) return name
    name = `${stem}_${Date.now()}_${i + 1}${ext}`
  }
  return `${stem}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}${ext}`
}

const imageStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const account =
      (req as express.Request & { user?: Record<string, unknown> }).user?.user_account as string || 'anon'
    const ext = file.mimetype === 'image/png' ? 'png' : 'jpg'
    cb(null, `${account}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}.${ext}`)
  },
})

export const upload = multer({ storage: imageStorage, limits: { fileSize: 5 * 1024 * 1024 } })

const modelFileStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    try {
      const safe = safeUploadBasename(file.originalname)
      cb(null, pickUniqueFilenameInUploads(safe))
    } catch (err) {
      cb(err as Error, '')
    }
  },
})

export const modelUpload = multer({
  storage: modelFileStorage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const name = file.originalname.toLowerCase()
    const ext = path.extname(name)
    const ok =
      ['.json', '.zip', '.moc3', '.model3', '.png', '.jpg', '.jpeg', '.webp'].includes(ext) ||
      name.endsWith('.model3.json')
    cb(null, ok)
  },
})
