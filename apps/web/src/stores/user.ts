import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { AuthUser } from '@/api/auth'
import { clearAccessToken, setAccessToken } from '@/utils/auth'

const USER_INFO_KEY = 'userInfo'

/**
 * 从 localStorage 读取已缓存的用户信息。
 */
function readCachedUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_INFO_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as AuthUser
  } catch {
    localStorage.removeItem(USER_INFO_KEY)
    return null
  }
}

/**
 * 用户鉴权状态：accessToken 与用户信息。
 */
export const useUserStore = defineStore('user', () => {
  const userInfo = ref<AuthUser | null>(readCachedUser())

  const displayName = computed(() => userInfo.value?.username || '未登录')
  const avatarLetter = computed(() => displayName.value.slice(0, 1).toUpperCase())

  /**
   * 登录成功后写入 token 与用户信息。
   *
   * @param accessToken JWT
   * @param user 用户公开信息
   */
  function setSession(accessToken: string, user: AuthUser) {
    setAccessToken(accessToken)
    userInfo.value = user
    localStorage.setItem(USER_INFO_KEY, JSON.stringify(user))
  }

  /**
   * 更新本地用户信息缓存。
   *
   * @param user 用户公开信息
   */
  function setUserInfo(user: AuthUser) {
    userInfo.value = user
    localStorage.setItem(USER_INFO_KEY, JSON.stringify(user))
  }

  /**
   * 清除登录态。
   */
  function clearSession() {
    clearAccessToken()
    userInfo.value = null
    localStorage.removeItem(USER_INFO_KEY)
  }

  return {
    userInfo,
    displayName,
    avatarLetter,
    setSession,
    setUserInfo,
    clearSession,
  }
})
