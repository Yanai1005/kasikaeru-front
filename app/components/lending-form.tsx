import type { LendingFormProps } from '~/types/barcode-scanner'

export default function LendingForm({
  objectInfo,
  users,
  selectedUserId,
  onUserSelect,
  onLending,
  onReset,
  loading,
}: LendingFormProps) {
  if (!objectInfo || objectInfo.is_lent) {
    return null
  }

  return (
    <div className="border-t pt-6">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">貸し出し登録</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            貸し出し先ユーザー
          </label>
          <select
            value={selectedUserId}
            onChange={(e) => onUserSelect(e.target.value)}
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
            onClick={onLending}
            disabled={!selectedUserId || loading}
            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? '処理中...' : '貸し出し登録'}
          </button>
          <button
            onClick={onReset}
            className="px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            リセット
          </button>
        </div>
      </div>
    </div>
  )
}
