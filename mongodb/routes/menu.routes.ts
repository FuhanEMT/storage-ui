import type express from 'express'
import { MenuModel } from '../db/models'
import { authMiddleware } from '../middleware/auth'
import { success, fail } from '../utils/http'

export function registerMenuRoutes(app: express.Application): void {
  app.get('/admin/menu/list', authMiddleware, async (_req, res) => {
    try {
      const docs = await MenuModel.find().sort({ menu_order: 1 }).lean()
      return res.json(success(docs))
    } catch (err) {
      return fail(res, 500, '获取菜单失败', 'menu/list', err)
    }
  })
}
