import type express from 'express'
import jwt from 'jsonwebtoken'
import { handleDecrypt } from '../function'
import { UserDataModel, UserSystemModel } from '../db/models'
import { JWT_SECRET, DECRYPT_KEY } from '../config/constants'
import { success, fail } from '../utils/http'

export function registerPublicRoutes(app: express.Application): void {
  app.post('/admin/user/login', async (req, res) => {
    const { username, password } = req.body
    const account = handleDecrypt(username, DECRYPT_KEY)
    const pwd = handleDecrypt(password, DECRYPT_KEY)
    const user = (await UserDataModel.findOne({ user_account: account }).lean()) as Record<string, unknown> | null
    if (!user) return fail(res, 500, '用户不存在')
    if (user.user_password !== pwd) return fail(res, 500, '密码错误')
    const token = jwt.sign({ user_account: account }, JWT_SECRET, { expiresIn: '1h' })
    return res.json(success({ ...user, token }, '登录成功'))
  })

  app.post('/admin/user/avatar', async (req, res) => {
    try {
      const doc = (await UserDataModel.findOne({ user_account: req.body.username }).lean()) as Record<
        string,
        unknown
      > | null
      if (!doc) return fail(res, 500, '用户不存在')
      return res.json(success({ avatar: doc.user_avatar, username: doc.user_name }))
    } catch (err) {
      return fail(res, 500, '获取头像失败', 'avatar', err)
    }
  })

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
}
