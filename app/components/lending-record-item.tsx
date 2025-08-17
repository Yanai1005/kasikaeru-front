import type { LendingRecordItemProps } from '~/types/lending'

const LendingRecordItem: React.FC<LendingRecordItemProps> = ({
  record,
  onReturn,
  showActions = false,
}) => {
  const handleReturn = () => {
    if (onReturn) {
      onReturn(record.id)
    }
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString('ja-JP')
  }

  const getStatusColor = (lentState: number): string => {
    return lentState === 1 ? 'text-black' : 'text-black'
  }

  const getStatusText = (lentState: number): string => {
    return lentState === 1 ? '貸出中' : '返却済み'
  }

  return (
    <li className="p-4 border border-gray-200 rounded-lg shadow-sm flex flex-col sm:flex-row sm:justify-between sm:items-center">
      <div className="flex-1">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div>
            <p className="font-semibold text-lg text-black mt-1">
              <span className="text-sm text-black mr-2">備品名:</span>
              {record.object_name}
            </p>
          </div>
          <div>
            <p className="font-semibold text-black">
              <span className="text-sm text-black mr-2">バーコード:</span>
              {record.code_value}
            </p>
            <p className="font-semibold text-black">
              <span className="text-sm text-black mr-2">カテゴリ:</span>
              {record.category_name}
            </p>
            <p className="font-semibold text-black">
              <span className="text-sm text-black mr-2">利用者:</span>
              {record.user_name}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 sm:mt-0 sm:ml-4 sm:text-right flex flex-col items-end">
        <p className="text-sm text-black mb-2">
          貸し出し日時: {formatDate(record.lent_date)}
        </p>
        <p
          className={`font-bold text-lg mb-2 ${getStatusColor(record.lent_state)}`}
        >
          {getStatusText(record.lent_state)}
        </p>

        {showActions && record.lent_state === 1 && onReturn && (
          <button
            onClick={handleReturn}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            返却処理
          </button>
        )}
      </div>
    </li>
  )
}

export default LendingRecordItem
