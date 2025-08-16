import { useState } from 'react'
import type {
  ObjectInfo,
  UseReturnProps,
  UseReturnReturn,
} from '~/types/return-scanner'
import type { LendingRecord } from '~/types/lending'

export function useReturn({
  apiUrl,
  onReturnComplete,
}: UseReturnProps): UseReturnReturn {
  const [objectInfo, setObjectInfo] = useState<ObjectInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

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

      if (!objectData.is_lent) {
        setError('この備品は貸し出し中ではありません')
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : '不明なエラーが発生しました'
      )
      setObjectInfo(null)
    } finally {
      setLoading(false)
    }
  }

  // 返却処理
  const handleReturn = async () => {
    if (!objectInfo) {
      setError('備品情報が選択されていません')
      return
    }

    if (!objectInfo.is_lent) {
      setError('この備品は貸し出し中ではありません')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // 貸し出し記録を取得して返却処理を実行
      const lentRecordsResponse = await fetch(
        `${apiUrl}/api/lent-records?status=active`
      )

      if (!lentRecordsResponse.ok) {
        throw new Error('貸し出し記録の取得に失敗しました')
      }

      const lentRecords: LendingRecord[] = await lentRecordsResponse.json()
      const targetRecord = lentRecords.find(
        (record: LendingRecord) => record.object_id === objectInfo.object_id
      )

      if (!targetRecord) {
        throw new Error('対象の貸し出し記録が見つかりません')
      }

      // 返却処理を実行
      const returnResponse = await fetch(
        `${apiUrl}/api/lent-records/${targetRecord.id}/return`,
        {
          method: 'PUT',
        }
      )

      if (!returnResponse.ok) {
        if (returnResponse.status === 404) {
          throw new Error('貸し出し記録が見つからないか、既に返却済みです')
        }
        throw new Error('返却処理に失敗しました')
      }

      setSuccess(
        `${objectInfo.object_name} が正常に返却されました（${objectInfo.lent_to_user}さんから）`
      )

      // フォームをリセット
      reset()

      // 完了コールバックを実行
      if (onReturnComplete) {
        onReturnComplete()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '返却処理に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  // リセット処理
  const reset = () => {
    setObjectInfo(null)
    setError(null)
    setSuccess(null)
  }

  return {
    objectInfo,
    loading,
    error,
    success,
    fetchObjectInfo,
    handleReturn,
    reset,
  }
}
