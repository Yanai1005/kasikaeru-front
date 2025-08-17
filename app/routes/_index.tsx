import type { MetaFunction } from '@remix-run/cloudflare'
import Navbar from '~/components/common/navbar'

export const meta: MetaFunction = () => {
  return [{ title: '貸し借り管理システム' }]
}

export default function Index() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-black">貸し借り管理システム</h1>
      </header>
      <Navbar />
    </div>
  )
}
