import express from 'express'
import fs from 'fs'
import http from 'http'
import mongoose from 'mongoose'
import multer from 'multer'
import path from 'path'
import jwt from 'jsonwebtoken'
import { handleDecrypt } from './function'

const app = express()
const UPLOAD_DIR = path.join(process.cwd(), 'uploads')
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true })
app.use('/uploads', express.static(UPLOAD_DIR))

// 提高 body 限制，避免大 payload 报 request entity too large
app.use(express.json({ limit: '10mb' }))

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const account = (req as express.Request & { user?: Record<string, unknown> }).user?.user_account as string || 'anon'
    const ext = (file.mimetype === 'image/png') ? 'png' : 'jpg'
    cb(null, `${account}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}.${ext}`)
  },
})
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } }) // 单文件 5MB

const PORT = process.env.MONGO_API_PORT || 4000
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/?directConnection=true'
const MONGO_DB_NAME = process.env.MONGO_DB_NAME || 'admin'

let mongoConnected = false

const userDataSchema = new mongoose.Schema(
  {
    time: { type: Date, required: true },
  },
  {
    collection: 'user_data',
    strict: false,
  },
)

const userRoleSchema = new mongoose.Schema(
  {
    time: { type: Date, required: true },
  },
  {
    collection: 'user_role',
    strict: false,
  },
)

const menuSchema = new mongoose.Schema(
  { time: { type: Date, required: true } },
  { collection: 'menu', strict: false },
)

const userSystemSchema = new mongoose.Schema(
  { time: { type: Date, required: true } },
  { collection: 'user_system', strict: false },
)

const bookmarkDataSchema = new mongoose.Schema(
  { time: { type: Date, required: true } },
  { collection: 'bookmark_data', strict: false },
)

const UserDataModel = mongoose.model('AdminUserData', userDataSchema)
const UserRoleModel = mongoose.model('AdminUserRole', userRoleSchema)
const MenuModel = mongoose.model('Menu', menuSchema)
const UserSystemModel = mongoose.model('UserSystem', userSystemSchema)
const BookmarkDataModel = mongoose.model('BookmarkData', bookmarkDataSchema)

const JWT_SECRET = 'yuhi'
const DECRYPT_KEY = 'yuhi'

// 鉴权后可在路由里用 req.user 拿到解析结果
declare global {
  namespace Express {
    interface Request {
      user?: Record<string, unknown>
    }
  }
}

/** 从请求头解析 token，格式为 "yuhi <token>" */
function getTokenFromHeader(authHeader: string | undefined): string | null {
  if (!authHeader || typeof authHeader !== 'string') return null
  const parts = authHeader.trim().split(/\s+/)
  if (parts[0] !== 'yuhi' || !parts[1]) return null
  return parts[1]
}

/**
 * 鉴权中间件：从 Authorization 取 token 并解析，结果挂到 req.user，失败则 401
 * 需要鉴权的路由在路径后加 authMiddleware 即可，例如：app.get('/xxx', authMiddleware, handler)
 */
function authMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {
  const token = getTokenFromHeader(req.headers.authorization)
  if (!token) {
    return res.status(401).json({ code: 401, message: '未提供 token', success: false })
  }
  try {
    req.user = jwt.verify(token, JWT_SECRET) as Record<string, unknown>
    next()
  } catch {
    return res.status(401).json({ code: 401, message: 'token 无效或已过期', success: false })
  }
}

// 成功统一响应
const success = (data: any, message: string = 'success') => ({
  code: 200,
  data,
  message,
  success: true,
})

// 统一错误响应：打日志并返回 JSON
function fail(
  res: express.Response,
  code: number,
  message: string,
  logTag?: string,
  err?: unknown,
) {
  if (logTag && err !== undefined) console.error(`[mongodb] ${logTag}:`, err)
  return res.status(code).json({ code, message, success: false })
}

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    mongo: mongoConnected,
  })
})

// 登录（白名单）：token 只存 user_account，避免整份 user（含 base64 头像）导致请求头过大 431
app.post('/admin/user/login', async (req, res) => {
  const { username, password } = req.body
  const account = handleDecrypt(username, DECRYPT_KEY)
  const pwd = handleDecrypt(password, DECRYPT_KEY)
  const user = await UserDataModel.findOne({ user_account: account }).lean() as Record<string, unknown> | null
  if (!user) return fail(res, 500, '用户不存在')
  if (user.user_password !== pwd) return fail(res, 500, '密码错误')
  const token = jwt.sign({ user_account: account }, JWT_SECRET, { expiresIn: '1h' })
  return res.json(success({ ...user, token }, '登录成功'))
})

// 获取用户头像（白名单）
app.post('/admin/user/avatar', async (req, res) => {
  try {
    const doc = await UserDataModel.findOne({ user_account: req.body.username }).lean() as Record<string, unknown> | null
    if (!doc) return fail(res, 500, '用户不存在')
    return res.json(success({ avatar: doc.user_avatar, username: doc.user_name }))
  } catch (err) {
    return fail(res, 500, '获取头像失败', 'avatar', err)
  }
})

// 根据账号查 system（白名单，登录页用：输入账号后拉取该账号的 login_card_bg 等）
app.post('/admin/user/system-by-account', async (req, res) => {
  try {
    const account = req.body.username ?? req.body.account
    if (!account) return fail(res, 400, '缺少账号')
    const doc = await UserSystemModel.findOne({ user_account: account }).lean()
    return res.json(success(doc || null))
  } catch (err) {
    return fail(res, 500, '获取失败', 'system-by-account', err)
  }
})

// 用户角色列表（鉴权）
app.get('/admin/user/role', authMiddleware, async (_req, res) => {
  try {
    const docs = await UserRoleModel.find().sort({ time: -1 }).lean()
    return res.json(success(docs))
  } catch (err) {
    return fail(res, 500, '获取角色列表失败', 'user/role', err)
  }
})

// 菜单列表（鉴权），按 menu_order 排序
app.get('/admin/menu/list', authMiddleware, async (_req, res) => {
  try {
    const docs = await MenuModel.find().sort({ menu_order: 1 }).lean()
    return res.json(success(docs))
  } catch (err) {
    return fail(res, 500, '获取菜单失败', 'menu/list', err)
  }
})

// 更新当前用户：名称、密码、头像（鉴权）
app.post('/admin/user/profile', authMiddleware, async (req, res) => {
  try {
    const account = (req.user as Record<string, unknown>)?.user_account
    if (!account) return fail(res, 401, '无法识别用户')
    const body = req.body as Record<string, unknown>
    const allowKeys = ['user_name', 'user_avatar', 'user_password'] as const
    const update: Record<string, unknown> = {}
    for (const k of allowKeys) {
      const v = body[k]
      if (v !== undefined && (k !== 'user_password' || String(v).trim())) update[k] = v
    }
    if (Object.keys(update).length === 0) return res.json(success(null, '无变更'))
    const doc = await UserDataModel.findOneAndUpdate(
      { user_account: account },
      { $set: update },
      { new: true },
    ).lean()
    return res.json(success(doc as Record<string, unknown>, '保存成功'))
  } catch (err) {
    return fail(res, 500, '更新失败', 'user/profile', err)
  }
})

// 上传图片：multipart 二进制文件（JPEG 更小），不再用 base64
app.post('/admin/user/upload-image', authMiddleware, upload.single('image'), (req, res) => {
  try {
    const file = req.file
    if (!file) return fail(res, 400, '请选择图片文件')
    return res.json(success({ url: `/uploads/${file.filename}` }))
  } catch (err) {
    return fail(res, 500, '上传失败', 'upload-image', err)
  }
})

// 获取当前用户背景/简介（user_system 表，鉴权）
app.get('/admin/user/system', authMiddleware, async (req, res) => {
  try {
    const account = (req.user as Record<string, unknown>)?.user_account
    const doc = await UserSystemModel.findOne({ user_account: account }).lean()
    return res.json(success(doc || null))
  } catch (err) {
    return fail(res, 500, '获取失败', 'user/system', err)
  }
})

// 保存当前用户背景/简介：无则插入，有则覆盖（按 user_account）
app.post('/admin/user/system', authMiddleware, async (req, res) => {
  try {
    const account = (req.user as Record<string, unknown>)?.user_account
    const body = req.body as Record<string, unknown>
    const allowKeys = ['user_admin_bg', 'user_login_card_bg', 'user_login_bg', 'user_remark'] as const
    const payload: Record<string, unknown> = { user_account: account }
    for (const k of allowKeys) {
      if (body[k] !== undefined) payload[k] = body[k]
    }
    const doc = await UserSystemModel.findOneAndUpdate(
      { user_account: account },
      { $set: payload, $setOnInsert: { time: new Date() } },
      { new: true, upsert: true },
    ).lean()
    return res.json(success(doc as Record<string, unknown>, '保存成功'))
  } catch (err) {
    return fail(res, 500, '保存失败', 'user/system', err)
  }
})

// 创建收藏分组（鉴权）：写入 bookmark_data，并通过 user_account 区分用户数据
app.post('/admin/bookmark/group', authMiddleware, async (req, res) => {
  try {
    const account = (req.user as Record<string, unknown>)?.user_account
    if (!account) return fail(res, 401, '无法识别用户')
    const body = req.body as {
      name?: unknown
      tags?: unknown
      bgImages?: unknown
      description?: unknown
    }
    const name = typeof body.name === 'string' ? body.name.trim() : ''
    if (!name) return fail(res, 400, 'name 不能为空')
    const tags = Array.isArray(body.tags) ? body.tags.map((t) => String(t)) : []
    const bgImages = body.bgImages != null ? String(body.bgImages) : ''
    const description = body.description != null ? String(body.description) : ''

    const doc = await BookmarkDataModel.create({
      time: new Date(),
      user_account: account,
      name,
      tags,
      bgImages,
      description,
    })
    return res.json(success(doc, '创建成功'))
  } catch (err) {
    return fail(res, 500, '创建失败', 'bookmark/group', err)
  }
})

// 获取当前用户的收藏分组（鉴权）
app.get('/admin/bookmark/group', authMiddleware, async (req, res) => {
  try {
    const account = (req.user as Record<string, unknown>)?.user_account
    if (!account) return fail(res, 401, '无法识别用户')
    const docs = await BookmarkDataModel.find({ user_account: account }).sort({ time: -1 }).lean()
    return res.json(success(docs))
  } catch (err) {
    return fail(res, 500, '获取失败', 'bookmark/group/get', err)
  }
})

// 向分组新增网址（鉴权）：写入 addreamUrl 数组
app.post('/admin/bookmark/group/:id/url', authMiddleware, async (req, res) => {
  try {
    const account = (req.user as Record<string, unknown>)?.user_account
    if (!account) return fail(res, 401, '无法识别用户')
    const { id } = req.params
    const body = req.body as { title?: unknown; link?: unknown; icon?: unknown }
    const title = typeof body.title === 'string' ? body.title.trim() : ''
    const link = typeof body.link === 'string' ? body.link.trim() : ''
    if (!title || !link) return fail(res, 400, 'title 和 link 不能为空')
    const icon = body.icon != null ? String(body.icon) : ''

    const doc = await BookmarkDataModel.findOneAndUpdate(
      { _id: id, user_account: account },
      { $push: { addreamUrl: { title, link, icon, time: new Date() } } },
      { new: true },
    ).lean()
    if (!doc) return fail(res, 404, '分组不存在')
    return res.json(success(doc, '添加成功'))
  } catch (err) {
    return fail(res, 500, '添加失败', 'bookmark/group/add-url', err)
  }
})

// 删除分组（鉴权）
app.delete('/admin/bookmark/group/:id', authMiddleware, async (req, res) => {
  try {
    const account = (req.user as Record<string, unknown>)?.user_account
    if (!account) return fail(res, 401, '无法识别用户')
    const { id } = req.params
    const doc = await BookmarkDataModel.findOneAndDelete({ _id: id, user_account: account }).lean()
    if (!doc) return fail(res, 404, '分组不存在')
    return res.json(success(null, '删除成功'))
  } catch (err) {
    return fail(res, 500, '删除失败', 'bookmark/group/delete', err)
  }
})

// 提高请求头限制，避免大 token 导致 431 Request Header Fields Too Large
const server = http.createServer({ maxHeaderSize: 256 * 1024 }, app)
server.listen(PORT, () => {
  console.log(`[mongodb] api server running on http://localhost:${PORT}`)
  connectMongo()
})

async function connectMongo() {
  try {
    await mongoose.connect(MONGO_URI, {
      dbName: MONGO_DB_NAME,
    })
    mongoConnected = true
    console.log('[mongodb] connected to', `${MONGO_URI} (db: ${MONGO_DB_NAME})`)
  } catch (err) {
    console.error('[mongodb] failed to connect mongo:', err)
  }
}
