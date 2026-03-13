import express from 'express'
import mongoose from 'mongoose'

const app = express()
app.use(express.json())

const PORT = process.env.MONGO_API_PORT || 4000
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/?directConnection=true'
const MONGO_DB_NAME = process.env.MONGO_DB_NAME || 'admin'

let mongoConnected = false

const userDataSchema = new mongoose.Schema(
  {
    time: { type: Date, required: true }
  },
  {
    collection: 'user_data',
    strict: false
  }
)

const UserDataModel = mongoose.model('AdminUserData', userDataSchema)


app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    mongo: mongoConnected
  })
})

// 查询 admin.user_data 列表 (登录查询)
app.get('/admin/user-data', async (req, res) => {
  try {

    const docs = await UserDataModel.find()
      .sort({ time: -1 })
      .lean()

    res.json(success(docs))

  } catch (err) {
    console.error('[mongodb] failed to fetch admin.user_data:', err)
    res.status(500).json({ ok: false, message: 'Failed to fetch user_data' })
  }
})

// 成功统一数据处理（不含分页）
const success = (data: any, message: string = 'success') => {
  return {
    code: 200,
    data: data,
    message: message,
    success: true
  }
}

app.listen(PORT, () => {
  console.log(`[mongodb] api server running on http://localhost:${PORT}`)
  connectMongo()
})

async function connectMongo() {
  try {
    await mongoose.connect(MONGO_URI, {
      dbName: MONGO_DB_NAME
    })
    mongoConnected = true
    console.log('[mongodb] connected to', `${MONGO_URI} (db: ${MONGO_DB_NAME})`)
  } catch (err) {
    console.error('[mongodb] failed to connect mongo:', err)
  }
}

