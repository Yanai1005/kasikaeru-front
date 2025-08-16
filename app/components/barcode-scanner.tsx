import { useRef, useEffect, useState } from 'react'
import {
  BrowserMultiFormatReader,
  NotFoundException,
  ChecksumException,
  FormatException,
  DecodeHintType,
  BarcodeFormat,
} from '@zxing/library'
import type { ObjectInfo, User } from '~/types/object'

interface EnhancedBarcodeScannerProps {
  apiUrl: string
  onLendingComplete?: () => void
}

export default function BarcodeScanner({ 
  apiUrl, 
  onLendingComplete 
}: EnhancedBarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const codeReader = useRef<BrowserMultiFormatReader | null>(null)
  const [scannedResult, setScannedResult] = useState<string | null>(null)
  const [objectInfo, setObjectInfo] = useState<ObjectInfo | null>(null)
  const [users, setUsers] = useState<User[]>([])
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

  // バーコードスキャナーの初期化
  useEffect(() => {
    const hints = new Map()
    const formats = [
      BarcodeFormat.EAN_13,
      BarcodeFormat.UPC_A,
      BarcodeFormat.EAN_8,
      BarcodeFormat.CODE_128,
      BarcodeFormat.QR_CODE,
    ]
    hints.set(DecodeHintType.POSSIBLE_FORMATS, formats)

    codeReader.current = new BrowserMultiFormatReader(hints)

    const videoElement = videoRef.current

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' } // 背面カメラを優先
        })
        if (videoElement) {
          videoElement.srcObject = stream
        }
        if (codeReader.current && videoElement) {
          codeReader.current.decodeFromVideoDevice(
            null,
            videoElement,
            (result, err) => {
              if (result) {
                const scannedCode = result.getText()
                console.log('バーコードが検出されました:', scannedCode)
                handleBarcodeScanned(scannedCode)
              }
              if (err) {
                if (
                  err instanceof NotFoundException ||
                  err instanceof ChecksumException ||
                  err instanceof FormatException
                ) {
                  return
                }
                console.error('スキャンエラー:', err)
              }
            }
          )
        }
      } catch (err) {
        console.error('カメラへのアクセスに失敗しました:', err)
        setError('カメラにアクセスできません。ブラウザの設定を確認してください。')
      }
    }

    startCamera()

    return () => {
      if (videoElement && videoElement.srcObject) {
        const stream = videoElement.srcObject as MediaStream
        stream.getTracks().forEach((track) => track.stop())
      }
      if (codeReader.current) {
        codeReader.current.reset()
      }
    }
  }, [])

  // バーコードスキャン後の処理
  const handleBarcodeScanned = async (code: string) => {
    if (scannedResult === code) return // 重複スキャン防止

    setScannedResult(code)
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
      setScannedResult(null)
      setObjectInfo(null)
      setSelectedUserId('')
      
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

  // スキャンリセット
  const handleReset = () => {
    setScannedResult(null)
    setObjectInfo(null)
    setSelectedUserId('')
    setError(null)
    setSuccess(null)
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">バーコードスキャン - 貸し出し登録</h2>
        
        {/* カメラ映像とスキャン結果 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-3">カメラ</h3>
            <p className="text-gray-600 mb-4">
              97から始まるバーコードをスキャンしてください
            </p>
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-64 object-cover border border-gray-300 rounded-lg"
              />
              <div className="absolute top-1/2 left-[10%] right-[10%] h-0.5 bg-red-500 transform -translate-y-1/2" />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-3">スキャン結果</h3>
            {loading && (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            )}
            
            {scannedResult && !loading && (
              <div className="space-y-4">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                  <p className="text-sm text-gray-600">読み取ったバーコード:</p>
                  <p className="font-mono text-lg">{scannedResult}</p>
                </div>
                
                {objectInfo && !objectInfo.is_lent && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded">
                    <h4 className="font-semibold text-green-800 mb-2">備品情報</h4>
                    <p><span className="text-gray-600">名前:</span> {objectInfo.object_name}</p>
                    <p><span className="text-gray-600">カテゴリ:</span> {objectInfo.category_name}</p>
                    <p className="text-green-600 font-semibold">✓ 貸し出し可能</p>
                  </div>
                )}
                
                {objectInfo && objectInfo.is_lent && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded">
                    <h4 className="font-semibold text-red-800 mb-2">備品情報</h4>
                    <p><span className="text-gray-600">名前:</span> {objectInfo.object_name}</p>
                    <p><span className="text-gray-600">カテゴリ:</span> {objectInfo.category_name}</p>
                    <p className="text-red-600 font-semibold">✗ 貸し出し中</p>
                    {objectInfo.lent_to_user && (
                      <p><span className="text-gray-600">貸し出し先:</span> {objectInfo.lent_to_user}</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 貸し出しフォーム */}
        {objectInfo && !objectInfo.is_lent && (
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">貸し出し登録</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  貸し出し先ユーザー
                </label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading}
                >
                  <option value="">ユーザーを選択してください</option>
                  {users.map((user) => (
                    <option key={user.discord_id} value={user.discord_id}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-end gap-2">
                <button
                  onClick={handleLending}
                  disabled={!selectedUserId || loading}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? '処理中...' : '貸し出し登録'}
                </button>
                <button
                  onClick={handleReset}
                  className="px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  リセット
                </button>
              </div>
            </div>
          </div>
        )}

        {/* メッセージ表示 */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}
        
        {success && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800">{success}</p>
          </div>
        )}
      </div>
    </div>
  )
}
