import type express from 'express'
import { BookmarkDataModel, ensureSubItemId, ensureUrlItemIds } from '../db/models'
import { authMiddleware } from '../middleware/auth'
import { success, fail } from '../utils/http'

export function registerBookmarkRoutes(app: express.Application): void {
  app.post('/admin/bookmark/group', authMiddleware, async (req, res) => {
    try {
      const account = (req.user as Record<string, unknown>)?.user_account
      if (!account) return fail(res, 401, '无法识别用户')
      const body = req.body as {
        id?: unknown
        name?: unknown
        tags?: unknown
        bgImages?: unknown
        description?: unknown
      }
      const name = typeof body.name === 'string' ? body.name.trim() : ''
      if (!name) return fail(res, 400, 'name 不能为空')
      const tags = Array.isArray(body.tags) ? body.tags.map((t) => String(t)) : []
      const bgImages = body.bgImages != null ? String(body.bgImages) : ''
      const description = body.description != null ? String(body.description) : ''
      const id = typeof body.id === 'string' ? body.id.trim() : ''

      if (id) {
        const doc = await BookmarkDataModel.findOneAndUpdate(
          { _id: id, user_account: account },
          { $set: { name, tags, bgImages, description } },
          { new: true },
        ).lean()
        if (!doc) return fail(res, 404, '分组不存在')
        return res.json(success(doc, '更新成功'))
      }

      const created = await BookmarkDataModel.create({
        time: new Date(),
        user_account: account,
        name,
        tags,
        bgImages,
        description,
      })
      return res.json(success(created, '创建成功'))
    } catch (err) {
      return fail(res, 500, '创建失败', 'bookmark/group', err)
    }
  })

  app.get('/admin/bookmark/group', authMiddleware, async (req, res) => {
    try {
      const account = (req.user as Record<string, unknown>)?.user_account
      if (!account) return fail(res, 401, '无法识别用户')
      const docs = (await BookmarkDataModel.find({ user_account: account }).sort({ time: -1 }).lean()) as Array<
        Record<string, unknown>
      >

      const writeOps: Array<Promise<unknown>> = []
      const normalized = docs.map((doc) => {
        const list = Array.isArray(doc.addreamUrl) ? (doc.addreamUrl as Array<Record<string, unknown>>) : []
        const nextList = ensureUrlItemIds(list)
        const changed = list.some((x, i) => String((x as { _id?: unknown })?._id ?? '') !== String(nextList[i]?._id ?? ''))
        if (changed && doc._id) {
          writeOps.push(
            BookmarkDataModel.updateOne(
              { _id: doc._id, user_account: account },
              { $set: { addreamUrl: nextList } },
            ),
          )
        }
        return { ...doc, addreamUrl: nextList }
      })
      if (writeOps.length) await Promise.all(writeOps)

      return res.json(success(normalized))
    } catch (err) {
      return fail(res, 500, '获取失败', 'bookmark/group/get', err)
    }
  })

  app.post('/admin/bookmark/group/:id/url', authMiddleware, async (req, res) => {
    try {
      const account = (req.user as Record<string, unknown>)?.user_account
      if (!account) return fail(res, 401, '无法识别用户')
      const { id } = req.params
      const body = req.body as { title?: unknown; link?: unknown; icon?: unknown }
      const title = typeof body.title === 'string' ? body.title.trim() : ''
      const link = typeof body.link === 'string' ? body.link.trim() : ''
      if (!title || !link) return fail(res, 400, 'title 和 link 不能为空')
      const icon = body.icon != null ? String(body.icon) : ''

      const urlItem = ensureSubItemId({ title, link, icon, time: new Date() })
      const doc = await BookmarkDataModel.findOneAndUpdate(
        { _id: id, user_account: account },
        { $push: { addreamUrl: urlItem } },
        { new: true },
      ).lean()
      if (!doc) return fail(res, 404, '分组不存在')
      return res.json(success(doc, '添加成功'))
    } catch (err) {
      return fail(res, 500, '添加失败', 'bookmark/group/add-url', err)
    }
  })

  app.post('/admin/bookmark/group/:id/url/batch-delete', authMiddleware, async (req, res) => {
    try {
      const account = (req.user as Record<string, unknown>)?.user_account
      if (!account) return fail(res, 401, '无法识别用户')
      const { id } = req.params
      const body = req.body as { _id?: unknown }
      const ids = Array.isArray(body._id) ? body._id.map((x) => String(x).trim()).filter(Boolean) : []
      if (!ids.length) return fail(res, 400, '_id 数组不能为空')

      const doc = (await BookmarkDataModel.findOne({ _id: id, user_account: account }).lean()) as Record<
        string,
        unknown
      > | null
      if (!doc) return fail(res, 404, '分组不存在')
      const urls = Array.isArray(doc.addreamUrl) ? (doc.addreamUrl as Array<Record<string, unknown>>) : []
      const idSet = new Set(ids)
      const nextUrls = urls.filter((url) => !idSet.has(String(url?._id ?? '')))

      const updated = await BookmarkDataModel.findOneAndUpdate(
        { _id: id, user_account: account },
        { $set: { addreamUrl: nextUrls } },
        { new: true },
      ).lean()
      return res.json(success(updated, '删除成功'))
    } catch (err) {
      return fail(res, 500, '删除失败', 'bookmark/group/url/batch-delete', err)
    }
  })

  app.post('/admin/bookmark/group/batch-import', authMiddleware, async (req, res) => {
    try {
      const account = (req.user as Record<string, unknown>)?.user_account
      if (!account) return fail(res, 401, '无法识别用户')

      const groups = Array.isArray((req.body as { groups?: unknown })?.groups)
        ? (req.body as { groups: unknown[] }).groups
        : []
      if (!groups.length) return fail(res, 400, 'groups 不能为空')

      const docsToInsert: Record<string, unknown>[] = []
      for (const raw of groups) {
        const r = raw as Record<string, unknown>
        const name = typeof r?.name === 'string' ? r.name.trim() : ''
        if (!name) continue

        const tags = Array.isArray(r?.tags) ? r.tags.map((t: unknown) => String(t)) : []
        const bgImages = r?.bgImages != null ? String(r.bgImages) : ''
        const description = r?.description != null ? String(r.description) : ''
        const addreamUrlRaw = Array.isArray(r?.addreamUrl)
          ? (r.addreamUrl as unknown[])
              .map((u) => {
                const item = u as Record<string, unknown>
                const title = typeof item?.title === 'string' ? item.title.trim() : ''
                const link = typeof item?.link === 'string' ? item.link.trim() : ''
                if (!title || !link) return null
                return {
                  _id: item?._id ? String(item._id) : undefined,
                  title,
                  link,
                  icon: item?.icon != null ? String(item.icon) : '',
                  time: new Date(),
                }
              })
              .filter(Boolean)
          : []

        const addreamUrl = ensureUrlItemIds(addreamUrlRaw as Array<Record<string, unknown>>)

        if (!addreamUrl.length) continue

        docsToInsert.push({
          time: new Date(),
          user_account: account,
          name,
          tags,
          bgImages,
          description,
          addreamUrl,
        })
      }

      if (!docsToInsert.length) return fail(res, 400, '无有效导入数据')

      const createdDocs = await BookmarkDataModel.insertMany(docsToInsert, { ordered: false })
      return res.json(
        success(
          {
            createdCount: createdDocs.length,
            createdIds: createdDocs.map((d) => String((d as { _id?: unknown })?._id ?? '')),
          },
          '批量导入成功',
        ),
      )
    } catch (err) {
      return fail(res, 500, '批量导入失败', 'bookmark/group/batch-import', err)
    }
  })

  app.post('/admin/bookmark/group/delete', authMiddleware, async (req, res) => {
    try {
      const account = (req.user as Record<string, unknown>)?.user_account
      if (!account) return fail(res, 401, '无法识别用户')
      const body = req.body as { _id?: unknown; ids?: unknown }
      const idArrRaw = body._id ?? body.ids
      const ids = Array.isArray(idArrRaw) ? idArrRaw.map((x) => String(x).trim()).filter(Boolean) : []
      if (!ids.length) return fail(res, 400, '_id 数组不能为空')

      const result = await BookmarkDataModel.deleteMany({
        _id: { $in: ids },
        user_account: account,
      })
      return res.json(success({ deletedCount: result.deletedCount ?? 0 }, '删除成功'))
    } catch (err) {
      return fail(res, 500, '删除失败', 'bookmark/group/delete', err)
    }
  })
}
