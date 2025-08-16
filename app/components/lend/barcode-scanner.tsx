import BarcodeScannerCamera from '../common/barcode-scanner-camera'
import ObjectInfoDisplay from './object-info-display'
import LendingForm from './lending-form'
import { useLending } from '~/hooks/useLending'
import type { BarcodeScannerProps } from '~/types/barcode-scanner'
import MessageDisplay from '../common/message-display'
export default function BarcodeScanner({
  apiUrl,
  onLendingComplete,
}: BarcodeScannerProps) {
  const {
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
  } = useLending({ apiUrl, onLendingComplete })

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-black mb-6">
          バーコードスキャン - 貸し出し登録
        </h2>

        {/* カメラ映像とスキャン結果 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <BarcodeScannerCamera onScanSuccess={fetchObjectInfo} />
          <ObjectInfoDisplay objectInfo={objectInfo} loading={loading} />
        </div>

        {/* 貸し出しフォーム */}
        <LendingForm
          objectInfo={objectInfo}
          users={users}
          selectedUserId={selectedUserId}
          onUserSelect={setSelectedUserId}
          onLending={handleLending}
          onReset={reset}
          loading={loading}
        />

        {/* メッセージ表示 */}
        <MessageDisplay error={error} success={success} />
      </div>
    </div>
  )
}
