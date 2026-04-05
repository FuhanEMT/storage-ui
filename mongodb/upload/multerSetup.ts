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

/** 文件夹内相对路径：禁止 ..、绝对路径，统一为正斜杠 */
export function sanitizeModelRelativePath(originalname: string): string | null {
  let s = String(originalname || '').replace(/\\/g, '/').trim()
  if (!s) return null
  if (path.isAbsolute(s) || s.startsWith('/')) return null
  if (s.includes('..')) return null
  s = s.replace(/^\.\/+/, '')
  const parts = s.split('/').filter((p) => p && p !== '.' && p !== '..')
  if (!parts.length) return null
  return parts.join('/')
}

/**
 * 文件夹整包上传：必须保留子目录内「所有」资源（含 .tga/.bmp、无扩展名等），否则 Live2D 引用会 404。
 * 仅用小块黑名单拒绝明显可执行文件；其余一律放行（仍受单文件大小、总数量限制）。
 */
const MODEL_FOLDER_BLOCKED_EXT = new Set([
  '.exe',
  '.dll',
  '.com',
  '.cmd',
  '.bat',
  '.msi',
  '.scr',
  '.pif',
  '.ps1',
  '.vbs',
  '.app',
  '.deb',
  '.rpm',
  '.dmg',
])

function modelFolderFileBlocked(basenameLower: string): boolean {
  const ext = path.extname(basenameLower)
  return MODEL_FOLDER_BLOCKED_EXT.has(ext)
}

/** 整包上传：保留子目录结构，写入 uploads/<batchId>/...（需先挂 req.modelFolderRoot） */
const modelFolderStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      const root = (req as express.Request & { modelFolderRoot?: string }).modelFolderRoot
      if (!root) {
        cb(new Error('missing modelFolderRoot'), UPLOAD_DIR)
        return
      }
      const rel = sanitizeModelRelativePath(file.originalname)
      if (!rel) {
        cb(new Error('illegal path'), UPLOAD_DIR)
        return
      }
      const parent = path.posix.dirname(rel)
      const destDir =
        parent === '.' || parent === ''
          ? path.join(UPLOAD_DIR, root)
          : path.join(UPLOAD_DIR, root, ...parent.split('/'))
      fs.mkdirSync(destDir, { recursive: true })
      cb(null, destDir)
    } catch (err) {
      cb(err as Error, UPLOAD_DIR)
    }
  },
  filename: (_req, file, cb) => {
    try {
      const rel = sanitizeModelRelativePath(file.originalname)
      if (!rel) {
        cb(new Error('illegal path'), '')
        return
      }
      cb(null, path.posix.basename(rel))
    } catch (err) {
      cb(err as Error, '')
    }
  },
})

export const modelFolderUpload = multer({
  storage: modelFolderStorage,
  limits: { fileSize: 120 * 1024 * 1024, files: 4000 },
  fileFilter: (_req, file, cb) => {
    const rel = (file.originalname || '').replace(/\\/g, '/')
    const base = (rel.split('/').pop() || '').toLowerCase()
    cb(null, !modelFolderFileBlocked(base))
  },
})
