import type { ReturnObjectInfoDisplayProps } from '~/types/return-scanner'

export default function ReturnObjectInfoDisplay({
  objectInfo,
  loading,
}: ReturnObjectInfoDisplayProps) {
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
          返却する備品のバーコードをスキャンしてください
        </div>
      </div>
    )
  }

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-700 mb-3">スキャン結果</h3>
      {objectInfo.is_lent ? (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
          <h4 className="font-semibold text-yellow-800 mb-2">備品情報</h4>
          <p>
            <span className="text-gray-600">名前:</span>{' '}
            {objectInfo.object_name}
          </p>
          <p>
            <span className="text-gray-600">カテゴリ:</span>{' '}
            {objectInfo.category_name}
          </p>
          <p>
            <span className="text-gray-600">バーコード:</span>{' '}
            {objectInfo.code_value}
          </p>
          <p className="text-yellow-600 font-semibold">📋 貸し出し中</p>
          {objectInfo.lent_to_user && (
            <p>
              <span className="text-gray-600">貸し出し先:</span>{' '}
              {objectInfo.lent_to_user}
            </p>
          )}
          {objectInfo.lent_date && (
            <p>
              <span className="text-gray-600">貸し出し日:</span>{' '}
              {new Date(objectInfo.lent_date).toLocaleString('ja-JP')}
            </p>
          )}
          <p className="text-green-600 font-semibold mt-2">✓ 返却可能</p>
        </div>
      ) : (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded">
          <h4 className="font-semibold text-gray-800 mb-2">備品情報</h4>
          <p>
            <span className="text-gray-600">名前:</span>{' '}
            {objectInfo.object_name}
          </p>
          <p>
            <span className="text-gray-600">カテゴリ:</span>{' '}
            {objectInfo.category_name}
          </p>
          <p>
            <span className="text-gray-600">バーコード:</span>{' '}
            {objectInfo.code_value}
          </p>
          <p className="text-gray-600 font-semibold">
            📦 返却済み/貸し出し中ではありません
          </p>
        </div>
      )}
    </div>
  )
}
