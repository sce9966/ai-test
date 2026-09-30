const ACCESS_TOKEN_KEY = 'accessToken'

/**
 * 读取本地 accessToken。
 */
export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

/**
 * 写入本地 accessToken。
 */
export function setAccessToken(token: string) {
  localStorage.setItem(ACCESS_TOKEN_KEY, token)
}

/**
 * 清除本地 accessToken。
 */
export function clearAccessToken() {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
}

/**
 * 是否已持有 accessToken。
 */
export function hasAccessToken(): boolean {
  return Boolean(getAccessToken())
}
