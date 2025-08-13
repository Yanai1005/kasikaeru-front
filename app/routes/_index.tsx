import type { MetaFunction } from "@remix-run/cloudflare";
import { Link } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [{ title: "貸し借り管理システム" }];
};

export default function Index() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          貸し借り管理システム
        </h1>
      </header>

      <nav className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Link to="/lending-status">
          <h2 className="text-3xl font-bold text-gray-800"> 貸し出し状況</h2>
        </Link>

        <Link to="/lending">
          <h2 className="text-3xl font-bold text-gray-800"> 貸し出し</h2>
        </Link>
      </nav>
    </div>
  );
}
