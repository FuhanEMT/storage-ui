import './middleware/auth'

import express from 'express'
import http from 'http'
import mongoose from 'mongoose'
import { MONGO_DB_NAME, MONGO_URI, PORT } from './config/constants'
import { UPLOAD_DIR, ensureUploadDir } from './config/uploadPaths'
import { registerAllRoutes } from './routes'

ensureUploadDir()

const app = express()
app.use('/uploads', express.static(UPLOAD_DIR))
app.use(express.json({ limit: '10mb' }))

registerAllRoutes(app)

const server = http.createServer({ maxHeaderSize: 256 * 1024 }, app)
server.listen(PORT, () => {
  console.log(`[mongodb] api server running on http://localhost:${PORT}`)
  connectMongo()
})

async function connectMongo() {
  try {
    await mongoose.connect(MONGO_URI, { dbName: MONGO_DB_NAME })
    console.log('[mongodb] connected to', `${MONGO_URI} (db: ${MONGO_DB_NAME})`)
  } catch (err) {
    console.error('[mongodb] failed to connect mongo:', err)
  }
}
