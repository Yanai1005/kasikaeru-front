import type { ReturnFormProps } from '~/types/return-scanner'

export default function ReturnForm({
  objectInfo,
  onReturn,
  onReset,
  loading,
}: ReturnFormProps) {
  if (!objectInfo || !objectInfo.is_lent) {
    return null
  }

  return (
    <div className="border-t pt-6">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">返却登録</h3>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <h4 className="font-semibold text-blue-800 mb-2">返却確認</h4>
        <p className="text-blue-700">
          「{objectInfo.object_name}」を{objectInfo.lent_to_user}
          さんから返却しますか？
        </p>
      </div>

      <div className="flex gap-4">
        <button
          onClick={onReturn}
          disabled={loading}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? '処理中...' : '返却登録'}
        </button>
        <button
          onClick={onReset}
          disabled={loading}
          className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-400 transition-colors"
        >
          リセット
        </button>
      </div>
    </div>
  )
}
