import express from 'express'
import mongoose from 'mongoose'
import { handleDecrypt } from './function'

const app = express()
app.use(express.json())

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

const UserDataModel = mongoose.model('AdminUserData', userDataSchema)

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    mongo: mongoConnected,
  })
})

// 查询 admin.user_data 列表 (登录)
app.post('/admin/user/login', async (req, res) => {
  const { username, password } = req.body
  // 优先解密用户信息
  console.log(handleDecrypt(username, 'yuhi'), handleDecrypt(password, 'yuhi'))
  try {
    const docs = await UserDataModel.find().sort({ time: -1 }).lean()

    res.json(success(docs))
  } catch (err) {
    console.error('[mongodb] failed to fetch admin.user_data:', err)
    res.status(500).json({ ok: false, message: 'Failed to fetch user_data' })
  }
})

// 根据用户名查找对应的用户头像图片数据
app.post('/admin/user/avatar', async (req, res) => {
  const { username } = req.body

  try {
    // 在 user_data 表里查一条 username 匹配的记录
    const doc = await UserDataModel.findOne({ user_account: username }).lean()
    console.log(doc)
    if (!doc) {
      return res.status(500).json({
        code: 500,
        message: '用户不存在',
        success: false,
      })
    }

    return res.json({
      code: 200,
      data: { avatar: doc.user_avatar , username: doc.user_name },
      message: 'success',
      success: true,
    })
  } catch (err) {
    console.error('[mongodb] failed to fetch avatar:', err)
    return res.status(500).json({
      code: 500,
      message: 'Failed to fetch avatar',
      success: false,
    })
  }
})

// 成功统一数据处理（不含分页）
const success = (data: any, message: string = 'success') => {
  return {
    code: 200,
    data: data,
    message: message,
    success: true,
  }
}

app.listen(PORT, () => {
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
