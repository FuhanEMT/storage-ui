import fs from 'fs'
import path from 'path'
import type express from 'express'
import mongoose from 'mongoose'
import { UPLOAD_DIR } from '../config/uploadPaths'
import { UserModelDoc } from '../db/models'
import { authMiddleware } from '../middleware/auth'
import { success, fail } from '../utils/http'
import { modelFolderUpload, modelUpload } from '../upload/multerSetup'

type ReqWithFolder = express.Request & { modelFolderRoot?: string }

function attachModelFolderRoot(req: express.Request, _res: express.Response, next: express.NextFunction) {
  const account = (req.user as Record<string, unknown> | undefined)?.user_account
  const safeAcc = String(account ?? 'anon').replace(/[^\w.-]/g, '_').slice(0, 32)
  ;(req as ReqWithFolder).modelFolderRoot = `${safeAcc}_fld_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
  next()
}

/**
 * 选取作为入口的 .model3.json。
 * 之前用「路径最浅」会在同时存在 `Nahida_1080.model3.json` 与 `Nahida_1080/Nahida_1080.model3.json`
 * 时误选浅层文件，纹理解析到 `批次/Nahida_1080.1024/...` 而实际在 `批次/Nahida_1080/Nahida_1080.1024/...`，导致 404。
 * 改为优先「最深」路径；同深度取更长相对路径（更具体）。
 */
function findEntryModel3Json(rootAbs: string): string | null {
  let best: { rel: string; depth: number } | null = null
  const walk = (absDir: string, relDir: string) => {
    let entries: fs.Dirent[]
    try {
      entries = fs.readdirSync(absDir, { withFileTypes: true })
    } catch {
      return
    }
    for (const e of entries) {
      const abs = path.join(absDir, e.name)
      const relPosix = relDir ? `${relDir}/${e.name}` : e.name
      if (e.isDirectory()) {
        walk(abs, relPosix)
      } else if (e.name.toLowerCase().endsWith('.model3.json')) {
        const depth = relPosix.split('/').length
        const better =
          !best ||
          depth > best.depth ||
          (depth === best.depth && relPosix.length > best.rel.length)
        if (better) best = { rel: relPosix, depth }
      }
    }
  }
  walk(rootAbs, '')
  return best?.rel ?? null
}

function tryRemoveUploadDir(root: string) {
  try {
    fs.rmSync(path.join(UPLOAD_DIR, root), { recursive: true, force: true })
  } catch {
    /* ignore */
  }
}

function buildUploadsUrl(root: string, entryRel: string): string {
  const segments = [root, ...entryRel.split('/').filter(Boolean)].map((s) => encodeURIComponent(s))
  return `/uploads/${segments.join('/')}`
}

export function registerModelRoutes(app: express.Application): void {
  app.get('/admin/model/list', authMiddleware, async (req, res) => {
    try {
      const account = (req.user as Record<string, unknown>)?.user_account
      if (!account) return fail(res, 401, '无法识别用户')
      const docs = await UserModelDoc.find({ user_account: account }).sort({ time: -1 }).lean()
      return res.json(success(docs))
    } catch (err) {
      return fail(res, 500, '获取模型列表失败', 'model/list', err)
    }
  })

  /** 新增与编辑同一接口：body 带 _id 或 id 则为更新当前用户下该条记录 */
  app.post('/admin/model', authMiddleware, async (req, res) => {
    try {
      const account = (req.user as Record<string, unknown>)?.user_account
      if (!account) return fail(res, 401, '无法识别用户')
      const body = req.body as Record<string, unknown>
      const modelName = typeof body.modelName === 'string' ? body.modelName.trim() : ''
      const modelUrl = typeof body.modelUrl === 'string' ? body.modelUrl.trim() : ''
      const modelType = typeof body.modelType === 'string' ? body.modelType.trim() : ''
      const modelDes = typeof body.modelDes === 'string' ? body.modelDes.trim() : ''
      if (!modelName || !modelUrl || !modelType) {
        return fail(res, 400, 'modelName、modelUrl、modelType 不能为空')
      }
      if (typeof body.isModelHttp !== 'boolean') {
        return fail(res, 400, 'isModelHttp 必须为布尔值')
      }
      if (typeof body.isPresen !== 'boolean') {
        return fail(res, 400, 'isPresen 必须为布尔值')
      }
      const idRaw = body._id ?? body.id
      const id = typeof idRaw === 'string' ? idRaw.trim() : ''

      const payload = {
        modelName,
        modelUrl,
        modelType,
        modelDes,
        isModelHttp: body.isModelHttp,
        isPresen: body.isPresen,
      }

      if (id) {
        const updated = await UserModelDoc.findOneAndUpdate(
          { _id: id, user_account: account },
          { $set: payload },
          { new: true },
        ).lean()
        if (!updated) return fail(res, 404, '记录不存在')
        return res.json(success(updated, '更新成功'))
      }

      const created = await UserModelDoc.create({
        time: new Date(),
        user_account: account,
        ...payload,
      })
      return res.json(success(created, '创建成功'))
    } catch (err) {
      return fail(res, 500, '保存模型失败', 'model/save', err)
    }
  })

  /** 仅切换展示标记：按 _id 查当前用户记录后只更新 isPresen */
  app.post('/admin/model/present', authMiddleware, async (req, res) => {
    try {
      const account = (req.user as Record<string, unknown>)?.user_account
      if (!account) return fail(res, 401, '无法识别用户')
      const body = req.body as { _id?: unknown; id?: unknown; isPresen?: unknown }
      const idRaw = body._id ?? body.id
      const id = typeof idRaw === 'string' ? idRaw.trim() : ''
      if (!id) return fail(res, 400, '缺少 _id')
      if (typeof body.isPresen !== 'boolean') {
        return fail(res, 400, 'isPresen 必须为布尔值')
      }
      const exists = await UserModelDoc.findOne({ _id: id, user_account: account }).lean()
      if (!exists) return fail(res, 404, '记录不存在')
      const updated = await UserModelDoc.findOneAndUpdate(
        { _id: id, user_account: account },
        { $set: { isPresen: body.isPresen } },
        { new: true },
      ).lean()
      return res.json(success(updated, body.isPresen ? '已设为展示' : '已取消展示'))
    } catch (err) {
      return fail(res, 500, '更新展示状态失败', 'model/present', err)
    }
  })

  /** 向指定主模型文档的 animation 数组追加一条（按 _id + user_account 校验归属） */
  app.post('/admin/model/animation', authMiddleware, async (req, res) => {
    try {
      const account = (req.user as Record<string, unknown>)?.user_account
      if (!account) return fail(res, 401, '无法识别用户')
      const body = req.body as { _id?: unknown; id?: unknown; name?: unknown; url?: unknown }
      const idRaw = body._id ?? body.id
      const modelId = typeof idRaw === 'string' ? idRaw.trim() : ''
      const name = typeof body.name === 'string' ? body.name.trim() : ''
      const url = typeof body.url === 'string' ? body.url.trim() : ''
      if (!modelId) return fail(res, 400, '缺少主模型 _id')
      if (!name || !url) return fail(res, 400, '动画名称 name、动画链接 url 不能为空')

      const exists = await UserModelDoc.findOne({ _id: modelId, user_account: account }).lean()
      if (!exists) return fail(res, 404, '主模型不存在')

      const item = {
        _id: new mongoose.Types.ObjectId(),
        name,
        url,
        time: new Date(),
      }

      const updated = await UserModelDoc.findOneAndUpdate(
        { _id: modelId, user_account: account },
        { $push: { animation: item } },
        { new: true },
      ).lean()
      if (!updated) return fail(res, 404, '更新失败')
      return res.json(success(updated, '动画已添加'))
    } catch (err) {
      return fail(res, 500, '添加动画失败', 'model/animation', err)
    }
  })

  app.post('/admin/model/delete', authMiddleware, async (req, res) => {
    try {
      const account = (req.user as Record<string, unknown>)?.user_account
      if (!account) return fail(res, 401, '无法识别用户')
      const body = req.body as { _id?: unknown }
      const id = typeof body._id === 'string' ? body._id.trim() : ''
      if (!id) return fail(res, 400, '缺少 _id')
      const result = await UserModelDoc.deleteOne({ _id: id, user_account: account })
      if (!result.deletedCount) return fail(res, 404, '记录不存在')
      return res.json(success({ deletedCount: result.deletedCount }, '删除成功'))
    } catch (err) {
      return fail(res, 500, '删除失败', 'model/delete', err)
    }
  })

  app.post('/admin/model/upload', authMiddleware, modelUpload.single('file'), (req, res) => {
    try {
      const file = req.file
      if (!file) {
        return fail(
          res,
          400,
          '请选择文件（支持 .json / .model3.json、.model3、.zip、.moc3 及常见贴图格式）',
        )
      }
      return res.json(success({ url: `/uploads/${file.filename}` }, '上传成功'))
    } catch (err) {
      return fail(res, 500, '上传失败', 'model-upload', err)
    }
  })

  /**
   * 模型整文件夹上传：multipart 字段名均为 `files`，浏览器需用 webkitRelativePath 作为文件名保留目录结构。
   * 成功后返回指向目录内最浅路径的某个 .model3.json 的 url，便于 Live2D 按相对路径加载同目录 moc3/贴图等。
   */
  app.post(
    '/admin/model/upload-folder',
    authMiddleware,
    attachModelFolderRoot,
    modelFolderUpload.array('files', 4000),
    (req, res) => {
      const root = (req as ReqWithFolder).modelFolderRoot
      try {
        if (!root) return fail(res, 500, '内部错误')
        const files = req.files as Express.Multer.File[] | undefined
        const rootAbs = path.join(UPLOAD_DIR, root)
        if (!files?.length) {
          tryRemoveUploadDir(root)
          return fail(res, 400, '请选择模型文件夹（需包含 .model3.json 及同目录资源）')
        }
        const entryRel = findEntryModel3Json(rootAbs)
        if (!entryRel) {
          tryRemoveUploadDir(root)
          return fail(res, 400, '文件夹内未找到 .model3.json，请确认已选择完整模型目录')
        }
        const url = buildUploadsUrl(root, entryRel)
        return res.json(success({ url, folder: root, entry: entryRel }, '文件夹上传成功'))
      } catch (err) {
        if (root) tryRemoveUploadDir(root)
        return fail(res, 500, '文件夹上传失败', 'model-upload-folder', err)
      }
    },
  )
}
