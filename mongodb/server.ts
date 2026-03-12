import express from 'express'
import mongoose from 'mongoose'

const app = express()
app.use(express.json())
const PORT = process.env.MONGO_API_PORT || 4000
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/?directConnection=true'
let mongoConnected = false

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    mongo: mongoConnected
  })
})

app.listen(PORT, () => {
  console.log(`[mongodb] api server running on http://localhost:${PORT}`)
  connectMongo()
})

async function connectMongo() {
  try {
    await mongoose.connect(MONGO_URI)
    mongoConnected = true
    console.log('[mongodb] connected to', MONGO_URI)
  } catch (err) {
    console.error('[mongodb] failed to connect mongo:', err)
  }
}

