import type { AppEnvironment } from '~/types/environment'

export class EnvironmentService {
  /**
   * 環境変数を取得
   */
  static getEnvironment(env: unknown): AppEnvironment {
    const environment = env as Record<string, unknown>

    if (!environment.API_URL || typeof environment.API_URL !== 'string') {
      throw new Error(
        'API_URL environment variable is required and must be a string'
      )
    }

    return {
      API_URL: environment.API_URL,
      ALLOWED_IPS: typeof environment.ALLOWED_IPS === 'string' ? environment.ALLOWED_IPS : undefined,
      IP_RESTRICTION_ENABLED: typeof environment.IP_RESTRICTION_ENABLED === 'string' ? environment.IP_RESTRICTION_ENABLED : 'false',
    }
  }

  /**
   * API URLを取得
   */
  static getApiUrl(env: unknown): string {
    const { API_URL } = this.getEnvironment(env)
    return API_URL
  }

  /**
   * 許可されたIPアドレスのリストを取得
   */
  static getAllowedIPs(env: unknown): string[] {
    const { ALLOWED_IPS } = this.getEnvironment(env)
    if (!ALLOWED_IPS) {
      return []
    }
    return ALLOWED_IPS.split(',').map(ip => ip.trim()).filter(ip => ip.length > 0)
  }

  /**
   * IP制限が有効かどうかを確認
   */
  static isIPRestrictionEnabled(env: unknown): boolean {
    const { IP_RESTRICTION_ENABLED } = this.getEnvironment(env)
    return IP_RESTRICTION_ENABLED === 'true'
  }
}
