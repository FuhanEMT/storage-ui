// DB 数据库名称： storage-ui-db
// version 版本: 1
// 表一 用户账号表：user_account 表结构：{ id: string, username: string, password: string, create_time: string, update_time: string }

const DB_NAME = 'storage-ui-db'
const DB_VERSION = 1

export function openDB() {

    return new Promise((resolve, reject) => {
        // 初始化表，并生成链接对象
        const request = window.indexedDB.open(DB_NAME, DB_VERSION)

        // 失败返回
        request.onerror = (event) => {
            reject(`连接失败 ${event}`)
        }

        // 成功
        request.onsuccess = (event) => {

            // 初始化成功数据库后进行操作
            const db = request.result

            // console.log(addData())

            resolve(db)
        }

        // 建表
        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result

            // 有无用户账号表 没有的话就创建
            if (!db.objectStoreNames.contains('user_account')) {
                db.createObjectStore('user_account', { keyPath: 'id' })
            }
        }
    })

}