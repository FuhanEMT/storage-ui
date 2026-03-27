import type { MessageApi } from 'naive-ui'

let messageApi: MessageApi | null = null

export function setMessageApi(api: MessageApi) {
  messageApi = api
}

export const msg = {
  success(content: string, options?: Parameters<MessageApi['success']>[1]) {
    return messageApi?.success(content, options)
  },
  error(content: string, options?: Parameters<MessageApi['error']>[1]) {
    return messageApi?.error(content, options)
  },
  info(content: string, options?: Parameters<MessageApi['info']>[1]) {
    return messageApi?.info(content, options)
  },
  warning(content: string, options?: Parameters<MessageApi['warning']>[1]) {
    return messageApi?.warning(content, options)
  },
  loading(content: string, options?: Parameters<MessageApi['loading']>[1]) {
    return messageApi?.loading(content, options)
  },
}
