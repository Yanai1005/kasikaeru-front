import { useState, useEffect } from 'react'
import type { ObjectInfo, User } from '~/types/object'

interface UseLendingProps {
    apiUrl: string
    onLendingComplete?: () => void
}

export function useLending({ apiUrl, onLendingComplete }: UseLendingProps) {
    const [users, setUsers] = useState<User[]>([])
    const [objectInfo, setObjectInfo] = useState<ObjectInfo | null>(null)
    const [selectedUserId, setSelectedUserId] = useState<string>('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)

    // ユーザー一覧を取得
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch(`${apiUrl}/api/users`)
                if (response.ok) {
                    const userData = await response.json() as User[]
                    setUsers(userData)
                }
            } catch (err) {
                console.error('ユーザー情報の取得に失敗:', err)
            }
        }
        fetchUsers()
    }, [apiUrl])

    // 備品情報を取得
    const fetchObjectInfo = async (code: string) => {
        setError(null)
        setSuccess(null)
        setLoading(true)

        try {
            const response = await fetch(`${apiUrl}/api/objects/by-code/${code}`)

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('指定されたバーコードの備品が見つかりません')
                }
                throw new Error('備品情報の取得に失敗しました')
            }

            const objectData: ObjectInfo = await response.json()
            setObjectInfo(objectData)

            if (objectData.is_lent) {
                setError(`この備品は既に ${objectData.lent_to_user} さんに貸し出し中です`)
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : '不明なエラーが発生しました')
            setObjectInfo(null)
        } finally {
            setLoading(false)
        }
    }

    // 貸し出し処理
    const handleLending = async () => {
        if (!objectInfo || !selectedUserId) {
            setError('備品情報またはユーザーが選択されていません')
            return
        }

        if (objectInfo.is_lent) {
            setError('この備品は既に貸し出し中です')
            return
        }

        setLoading(true)
        setError(null)

        try {
            const lentId = `LENT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

            const response = await fetch(`${apiUrl}/api/lent-records`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    lent_id: lentId,
                    object_id: objectInfo.object_id,
                    discord_id: selectedUserId,
                }),
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({})) as { error?: string }
                if (response.status === 400 && errorData.error?.includes('already lent out')) {
                    throw new Error('この備品は既に貸し出し中です')
                }
                throw new Error('貸し出し処理に失敗しました')
            }

            const selectedUser = users.find(u => u.discord_id === selectedUserId)
            setSuccess(`${objectInfo.object_name} を ${selectedUser?.name} さんに貸し出しました`)

            // フォームをリセット
            reset()

            // 完了コールバックを実行
            if (onLendingComplete) {
                onLendingComplete()
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : '貸し出し処理に失敗しました')
        } finally {
            setLoading(false)
        }
    }

    // リセット処理
    const reset = () => {
        setObjectInfo(null)
        setSelectedUserId('')
        setError(null)
        setSuccess(null)
    }

    return {
        users,
        objectInfo,
        selectedUserId,
        setSelectedUserId,
        loading,
        error,
        success,
        fetchObjectInfo,
        handleLending,
        reset,
    }
}
