import type { MetaFunction } from '@remix-run/cloudflare'
import Navbar from '~/components/navbar'

export const meta: MetaFunction = () => {
  return [{ title: '貸し出し状況 | 貸し借り管理システム' }]
}

export default function LendingStatus() {
  return (
    <div className="min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold text-gray-800">
        貸し出し状況 | 貸し借り管理システム
      </h1>
      <Navbar />
    </div>
  )
}
