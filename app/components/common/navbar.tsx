import { Link } from '@remix-run/react'

export default function Navbar() {
  return (
    <nav className="flex gap-6 items-center py-4 px-6 bg-white shadow">
      <Link
        to="/lending-status"
        className="text-gray-800 font-semibold hover:text-blue-600"
      >
        貸し出し状況
      </Link>
      <Link to="/" className="text-gray-800 font-semibold hover:text-blue-600">
        ホーム
      </Link>
      <Link
        to="/lending"
        className="text-gray-800 font-semibold hover:text-blue-600"
      >
        貸し出し
      </Link>
      <Link
        to="/return"
        className="text-gray-800 font-semibold hover:text-blue-600"
      >
        返却
      </Link>
    </nav>
  )
}
