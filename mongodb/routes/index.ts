import type express from 'express'
import { registerBookmarkRoutes } from './bookmark.routes'
import { registerMenuRoutes } from './menu.routes'
import { registerModelRoutes } from './model.routes'
import { registerPublicRoutes } from './public.routes'
import { registerUserRoutes } from './user.routes'

/** 挂载全部 HTTP 路由（路径与行为需与拆分前一致） */
export function registerAllRoutes(app: express.Application): void {
  registerPublicRoutes(app)
  registerUserRoutes(app)
  registerMenuRoutes(app)
  registerModelRoutes(app)
  registerBookmarkRoutes(app)
}
