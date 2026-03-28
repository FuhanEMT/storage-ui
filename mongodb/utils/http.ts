import type express from 'express'

export function success(data: unknown, message: string = 'success') {
  return {
    code: 200,
    data,
    message,
    success: true,
  }
}

export function fail(
  res: express.Response,
  code: number,
  message: string,
  logTag?: string,
  err?: unknown,
) {
  if (logTag && err !== undefined) console.error(`[mongodb] ${logTag}:`, err)
  return res.status(code).json({ code, message, success: false })
}
