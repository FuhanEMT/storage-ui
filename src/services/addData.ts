import { openDB } from './indexedDb'

const db = await openDB()

const requestleCallback = (request: any) => {
    return new Promise((resolve, reject) => {
        request.onsuccess = () => {
            resolve(request.result)
        }
        request.onerror = () => {
            reject(request.error)
        }
    })
}

// 新增对应传入的表名称 和 数据
export default async function put(databaseName: string, data: any) {
    const USER_TRANSACTION = (db as IDBDatabase).transaction(databaseName, 'readwrite')
    const USER_STORE = USER_TRANSACTION.objectStore(databaseName)

    return requestleCallback(USER_STORE.put(data))
}

// 查询ID对应表中的数据
export async function get(databaseName: string, id: string) {
    const USER_TRANSACTION = (db as IDBDatabase).transaction(databaseName, 'readonly')
    const USER_STORE = USER_TRANSACTION.objectStore(databaseName)
    const request = USER_STORE.get(id)

    return requestleCallback(request)

}

// 查询ID对应表中的数据
export async function getAll(databaseName: string) {
    const USER_TRANSACTION = (db as IDBDatabase).transaction(databaseName, 'readonly')
    const USER_STORE = USER_TRANSACTION.objectStore(databaseName)
    const request = USER_STORE.getAll()

    return requestleCallback(request)

}

