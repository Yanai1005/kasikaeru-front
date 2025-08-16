import { ObjectInfo, User } from '../types/object'

export class ObjectService {
    private baseUrl: string

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl
    }

    /**
     * バーコードで備品を検索
     */
    async getObjectByCode(code: string): Promise<ObjectInfo> {
        const response = await fetch(`${this.baseUrl}/api/objects/by-code/${code}`)

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('指定されたバーコードの備品が見つかりません')
            }
            throw new Error(
                `備品の検索に失敗しました: ${response.status} ${response.statusText}`
            )
        }

        return response.json()
    }

    /**
     * ユーザー一覧を取得
     */
    async getUsers(): Promise<User[]> {
        const response = await fetch(`${this.baseUrl}/api/users`)

        if (!response.ok) {
            throw new Error(
                `ユーザー情報の取得に失敗しました: ${response.status} ${response.statusText}`
            )
        }

        return response.json()
    }

    /**
     * 貸し出し処理
     */
    async lendObject(objectId: number, discordId: string): Promise<void> {
        const lentId = `LENT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

        const response = await fetch(`${this.baseUrl}/api/lent-records`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                lent_id: lentId,
                object_id: objectId,
                discord_id: discordId,
            }),
        })

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            if (response.status === 400 && typeof errorData === 'object' && errorData !== null && 'error' in errorData && typeof errorData.error === 'string' && errorData.error.includes('already lent out')) {
                throw new Error('この備品は既に貸し出し中です')
            }
            throw new Error(
                `貸し出し処理に失敗しました: ${response.status} ${response.statusText}`
            )
        }
    }
}
