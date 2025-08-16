import { Link } from '@remix-run/react'

export default function Navbar() {
  return (
    <nav className="flex items-center py-4 px-0 bg-white shadow w-full">
      <Link
        to="/lending-status"
        className="flex-1 mx-2 text-center rounded-lg py-2 font-semibold border bg-gray-100 text-gray-800 border-gray-300 hover:bg-blue-100 hover:border-blue-400 hover:text-blue-600"
      >
        貸し出し状況
      </Link>
      <Link
        to="/"
        className="flex-1 mx-2 text-center rounded-lg py-2 font-semibold border bg-gray-100 text-gray-800 border-gray-300 hover:bg-blue-100 hover:border-blue-400 hover:text-blue-600"
      >
        ホーム
      </Link>
      <Link
        to="/lending"
        className="flex-1 mx-2 text-center rounded-lg py-2 font-semibold border bg-gray-100 text-gray-800 border-gray-300 hover:bg-blue-100 hover:border-blue-400 hover:text-blue-600"
      >
        貸し出し
      </Link>
      <Link
        to="/return"
        className="flex-1 mx-2 text-center rounded-lg py-2 font-semibold border bg-gray-100 text-gray-800 border-gray-300 hover:bg-blue-100 hover:border-blue-400 hover:text-blue-600"
      >
        返却
      </Link>
      <style>{`
        a[aria-current="page"] {
          background-color: #bfdbfe !important; /* 薄い青色 */
          color: #2563eb !important;
          border-color: #2563eb !important;
        }
      `}</style>
    </nav>
  )
}
