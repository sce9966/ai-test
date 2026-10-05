import { http, unwrap } from './http'

/**
 * 上传结果。
 */
export interface UploadFileResult {
  url: string
  name: string
  type: string
  size?: number
}

/**
 * 上传单个文件。
 *
 * @param file 本地文件
 */
export function uploadFile(file: File) {
  const form = new FormData()
  form.append('file', file)
  return unwrap<UploadFileResult>(
    http.post('/upload/file', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  )
}
