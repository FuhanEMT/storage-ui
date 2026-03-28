export const PORT = process.env.MONGO_API_PORT || 4000
export const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/?directConnection=true'
export const MONGO_DB_NAME = process.env.MONGO_DB_NAME || 'admin'

export const JWT_SECRET = 'yuhi'
export const DECRYPT_KEY = 'yuhi'
