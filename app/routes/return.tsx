import type { MetaFunction, LoaderFunctionArgs } from '@remix-run/cloudflare'
import { useLoaderData } from '@remix-run/react'
import Navbar from '~/components/common/navbar'
import ReturnBarcodeScanner from '~/components/return/return-barcode-scanner'
import { EnvironmentService } from '~/services/environmentService'

export async function loader({ context }: LoaderFunctionArgs) {
  try {
    const apiUrl = EnvironmentService.getApiUrl(context.cloudflare.env)
    return { apiUrl }
  } catch (error) {
    console.error('Error in return loader:', error)
    throw new Error('環境設定の取得に失敗しました')
  }
}

export const meta: MetaFunction = () => {
  return [{ title: '返却登録 | 貸し借り管理システム' }]
}

export default function Return() {
  const { apiUrl } = useLoaderData<{ apiUrl: string }>()

  const handleReturnComplete = () => {
    console.log('返却が完了しました')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="mb-8 px-6 py-4">
        <h1 className="text-3xl font-bold text-gray-800">
          返却 | 貸し借り管理システム
        </h1>
      </header>
      <Navbar />
      <div className="mt-8">
        <ReturnBarcodeScanner
          apiUrl={apiUrl}
          onReturnComplete={handleReturnComplete}
        />
      </div>
    </div>
  )
}
