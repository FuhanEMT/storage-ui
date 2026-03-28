import type express from 'express'
import { UserDataModel, UserRoleModel, UserSystemModel } from '../db/models'
import { authMiddleware } from '../middleware/auth'
import { success, fail } from '../utils/http'
import { upload } from '../upload/multerSetup'

export function registerUserRoutes(app: express.Application): void {
  app.get('/admin/user/role', authMiddleware, async (_req, res) => {
    try {
      const docs = await UserRoleModel.find().sort({ time: -1 }).lean()
      return res.json(success(docs))
    } catch (err) {
      return fail(res, 500, '获取角色列表失败', 'user/role', err)
    }
  })

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

  app.post('/admin/user/upload-image', authMiddleware, upload.single('image'), (req, res) => {
    try {
      const file = req.file
      if (!file) return fail(res, 400, '请选择图片文件')
      return res.json(success({ url: `/uploads/${file.filename}` }))
    } catch (err) {
      return fail(res, 500, '上传失败', 'upload-image', err)
    }
  })

  app.get('/admin/user/system', authMiddleware, async (req, res) => {
    try {
      const account = (req.user as Record<string, unknown>)?.user_account
      const doc = await UserSystemModel.findOne({ user_account: account }).lean()
      return res.json(success(doc || null))
    } catch (err) {
      return fail(res, 500, '获取失败', 'user/system', err)
    }
  })

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
}
