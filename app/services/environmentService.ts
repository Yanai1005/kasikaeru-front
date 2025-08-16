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
    }
  }

  /**
   * API URLを取得
   */
  static getApiUrl(env: unknown): string {
    const { API_URL } = this.getEnvironment(env)
    return API_URL
  }
}
