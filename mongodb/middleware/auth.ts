import type express from 'express'
import jwt from 'jsonwebtoken'
import { JWT_SECRET } from '../config/constants'

declare global {
  namespace Express {
    interface Request {
      user?: Record<string, unknown>
    }
  }
}

/** 从请求头解析 token，格式为 "yuhi <token>" */
export function getTokenFromHeader(authHeader: string | undefined): string | null {
  if (!authHeader || typeof authHeader !== 'string') return null
  const parts = authHeader.trim().split(/\s+/)
  if (parts[0] !== 'yuhi' || !parts[1]) return null
  return parts[1]
}

export function authMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {
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
