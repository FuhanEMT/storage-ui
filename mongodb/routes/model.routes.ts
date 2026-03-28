import type express from 'express'
import { authMiddleware } from '../middleware/auth'
import { success, fail } from '../utils/http'
import { modelUpload } from '../upload/multerSetup'

export function registerModelRoutes(app: express.Application): void {
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
}
