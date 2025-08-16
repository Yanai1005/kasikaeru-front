import type {
  MetaFunction,
  LoaderFunctionArgs,
  ActionFunctionArgs,
} from '@remix-run/cloudflare'
import { useLoaderData, useFetcher } from '@remix-run/react'
import { json } from '@remix-run/cloudflare'
import Navbar from '~/components/common/navbar'
import LendingRecordItem from '~/components/lending-record-item'
import { LendingService } from '~/services/lendingService'
import { EnvironmentService } from '~/services/environmentService'
import type {
  LendingRecord,
  LendingStatusLoaderData,
  ReturnActionData,
} from '~/types/lending'

export async function loader({
  context,
}: LoaderFunctionArgs): Promise<LendingStatusLoaderData> {
  try {
    const apiUrl = EnvironmentService.getApiUrl(context.cloudflare.env)
    const lendingService = new LendingService(apiUrl)
    const lendingRecords = await lendingService.getAllLendingRecords()

    return { lendingRecords }
  } catch (error) {
    console.error('Error in lending-status loader:', error)

    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred'

    return {
      lendingRecords: [],
      error: errorMessage,
    }
  }
}

export async function action({ request, context }: ActionFunctionArgs) {
  try {
    const apiUrl = EnvironmentService.getApiUrl(context.cloudflare.env)
    const formData = await request.formData()
    const recordId = formData.get('recordId')

    if (!recordId || typeof recordId !== 'string') {
      return json({ error: 'Invalid record ID' }, { status: 400 })
    }

    const lendingService = new LendingService(apiUrl)
    await lendingService.returnItem(Number(recordId))

    return json({ success: true, message: '返却処理が完了しました' })
  } catch (error) {
    console.error('Error in return action:', error)
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred'
    return json({ error: errorMessage }, { status: 500 })
  }
}

export const meta: MetaFunction = () => {
  return [{ title: '貸し出し状況 | 貸し借り管理システム' }]
}

export default function LendingStatus() {
  const { lendingRecords, error } = useLoaderData<LendingStatusLoaderData>()
  const fetcher = useFetcher<ReturnActionData>()

  const handleReturn = (recordId: number) => {
    if (confirm('この備品を返却しますか？')) {
      fetcher.submit({ recordId: recordId.toString() }, { method: 'post' })
    }
  }

  const generateRecordKey = (record: LendingRecord): string => {
    return `${record.object_id}-${record.discord_id}-${record.lent_date}`
  }

  // アクティブな貸し出し記録のみフィルタリング
  const activeLendingRecords = lendingRecords.filter(
    (record) => record.lent_state === 1
  )
  const returnedLendingRecords = lendingRecords.filter(
    (record) => record.lent_state === 0
  )

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="mb-8 px-6 py-4">
          <h1 className="text-3xl font-bold text-gray-800">
            貸し出し状況 | 貸し借り管理システム
          </h1>
        </header>
        <Navbar />
        <div className="container mx-auto p-4 bg-white rounded-lg shadow-lg mt-8">
          <div className="text-center py-8">
            <p className="text-red-500 text-lg">エラーが発生しました</p>
            <p className="text-gray-600 mt-2">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="mb-8 px-6 py-4">
        <h1 className="text-3xl font-bold text-black">
          貸し出し状況 | 貸し借り管理システム
        </h1>
      </header>
      <Navbar />

      {/* 返却処理のフィードバック */}
      {fetcher.data?.success && (
        <div className="container mx-auto px-4 mt-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-black">{fetcher.data.message}</p>
          </div>
        </div>
      )}

      {fetcher.data?.error && (
        <div className="container mx-auto px-4 mt-4">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-black">{fetcher.data.error}</p>
          </div>
        </div>
      )}

      <div className="container mx-auto p-4 space-y-8">
        {/* 貸し出し中の備品 */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-black mb-4">
            🔴 貸し出し中の備品
          </h2>
          {activeLendingRecords.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-black text-lg">
                貸し出し中の備品はありません
              </p>
            </div>
          ) : (
            <>
              <div className="mb-4 text-sm text-black">
                件数: {activeLendingRecords.length}件
              </div>
              <ul className="space-y-4">
                {activeLendingRecords.map((record) => (
                  <LendingRecordItem
                    key={generateRecordKey(record)}
                    record={record}
                    onReturn={handleReturn}
                    showActions={true}
                  />
                ))}
              </ul>
            </>
          )}
        </div>

        {/* 返却済みの備品 */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-black mb-4">
            ✅ 返却済みの備品
          </h2>
          {returnedLendingRecords.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-black text-lg">
                返却済みの記録はありません
              </p>
            </div>
          ) : (
            <>
              <div className="mb-4 text-sm text-black">
                件数: {returnedLendingRecords.length}件
              </div>
              <ul className="space-y-4">
                {returnedLendingRecords.slice(0, 10).map((record) => (
                  <LendingRecordItem
                    key={generateRecordKey(record)}
                    record={record}
                  />
                ))}
              </ul>
              {returnedLendingRecords.length > 10 && (
                <div className="mt-4 text-center">
                  <p className="text-gray-500 text-sm">
                    最新10件を表示中（全{returnedLendingRecords.length}件）
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
