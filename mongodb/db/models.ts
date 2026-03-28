import mongoose from 'mongoose'

const userDataSchema = new mongoose.Schema(
  { time: { type: Date, required: true } },
  { collection: 'user_data', strict: false },
)

const userRoleSchema = new mongoose.Schema(
  { time: { type: Date, required: true } },
  { collection: 'user_role', strict: false },
)

const menuSchema = new mongoose.Schema(
  { time: { type: Date, required: true } },
  { collection: 'menu', strict: false },
)

const userSystemSchema = new mongoose.Schema(
  { time: { type: Date, required: true } },
  { collection: 'user_system', strict: false },
)

const bookmarkDataSchema = new mongoose.Schema(
  { time: { type: Date, required: true } },
  { collection: 'bookmark_data', strict: false },
)

export const UserDataModel = mongoose.model('AdminUserData', userDataSchema)
export const UserRoleModel = mongoose.model('AdminUserRole', userRoleSchema)
export const MenuModel = mongoose.model('Menu', menuSchema)
export const UserSystemModel = mongoose.model('UserSystem', userSystemSchema)
export const BookmarkDataModel = mongoose.model('BookmarkData', bookmarkDataSchema)

export function ensureSubItemId(item: Record<string, unknown>): Record<string, unknown> {
  const next = { ...item }
  if (!next._id) next._id = new mongoose.Types.ObjectId().toString()
  return next
}

export function ensureUrlItemIds<T extends Record<string, unknown>>(items: T[]): Array<T & { _id: string }> {
  return items.map((x) => ensureSubItemId(x) as T & { _id: string })
}
