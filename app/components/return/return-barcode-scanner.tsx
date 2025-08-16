import BarcodeScannerCamera from '../common/barcode-scanner-camera'
import ReturnObjectInfoDisplay from './return-object-info-display'
import ReturnForm from './return-form'
import { useReturn } from '~/hooks/useReturn'
import type { ReturnBarcodeScannerProps } from '~/types/return-scanner'

export default function ReturnBarcodeScanner({
  apiUrl,
  onReturnComplete,
}: ReturnBarcodeScannerProps) {
  const {
    objectInfo,
    loading,
    error,
    success,
    fetchObjectInfo,
    handleReturn,
    reset,
  } = useReturn({ apiUrl, onReturnComplete })

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          バーコードスキャン - 返却登録
        </h2>

        {/* カメラ映像とスキャン結果 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <BarcodeScannerCamera onScanSuccess={fetchObjectInfo} />
          <ReturnObjectInfoDisplay objectInfo={objectInfo} loading={loading} />
        </div>

        {/* 返却フォーム */}
        <ReturnForm
          objectInfo={objectInfo}
          onReturn={handleReturn}
          onReset={reset}
          loading={loading}
        />

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
