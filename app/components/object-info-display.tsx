import type { ObjectInfoDisplayProps } from '~/types/barcode-scanner'

export default function ObjectInfoDisplay({
  objectInfo,
  loading,
}: ObjectInfoDisplayProps) {
  if (loading) {
    return (
      <div>
        <h3 className="text-lg font-semibold text-gray-700 mb-3">
          スキャン結果
        </h3>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  if (!objectInfo) {
    return (
      <div>
        <h3 className="text-lg font-semibold text-gray-700 mb-3">
          スキャン結果
        </h3>
        <div className="flex items-center justify-center h-64 text-gray-500">
          バーコードをスキャンしてください
        </div>
      </div>
    )
  }

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-700 mb-3">スキャン結果</h3>
      {!objectInfo.is_lent ? (
        <div className="p-4 bg-green-50 border border-green-200 rounded">
          <h4 className="font-semibold text-green-800 mb-2">備品情報</h4>
          <p>
            <span className="text-gray-600">名前:</span>{' '}
            {objectInfo.object_name}
          </p>
          <p>
            <span className="text-gray-600">カテゴリ:</span>{' '}
            {objectInfo.category_name}
          </p>
          <p className="text-green-600 font-semibold">✓ 貸し出し可能</p>
        </div>
      ) : (
        <div className="p-4 bg-red-50 border border-red-200 rounded">
          <h4 className="font-semibold text-red-800 mb-2">備品情報</h4>
          <p>
            <span className="text-gray-600">名前:</span>{' '}
            {objectInfo.object_name}
          </p>
          <p>
            <span className="text-gray-600">カテゴリ:</span>{' '}
            {objectInfo.category_name}
          </p>
          <p className="text-red-600 font-semibold">✗ 貸し出し中</p>
          {objectInfo.lent_to_user && (
            <p>
              <span className="text-gray-600">貸し出し先:</span>{' '}
              {objectInfo.lent_to_user}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
