import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import Navbar from "~/components/navbar";
import LendingRecordItem from "~/components/lending-record-item";
import { LendingService } from "~/services/lendingService";
import { EnvironmentService } from "~/services/environmentService";
import type { LendingRecord, LendingStatusLoaderData } from "~/types/lending";

export async function loader({ context }: LoaderFunctionArgs): Promise<LendingStatusLoaderData> {
  try {
    const apiUrl = EnvironmentService.getApiUrl(context.cloudflare.env);
    const lendingService = new LendingService(apiUrl);
    const lendingRecords = await lendingService.getAllLendingRecords();

    return { lendingRecords };
  } catch (error) {
    console.error("Error in lending-status loader:", error);
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : "Unknown error occurred";

    return { 
      lendingRecords: [], 
      error: errorMessage 
    };
  }
}

export const meta: MetaFunction = () => {
  return [{ title: "貸し出し状況 | 貸し借り管理システム" }];
};

export default function LendingStatus() {
  const { lendingRecords, error } = useLoaderData<LendingStatusLoaderData>();

  const generateRecordKey = (record: LendingRecord): string => {
    return `${record.object_id}-${record.discord_id}-${record.lent_date}`;
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="mb-8">
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
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          貸し出し状況 | 貸し借り管理システム
        </h1>
      </header>
      <Navbar />
      <div className="container mx-auto p-4 bg-white rounded-lg shadow-lg mt-8">
        {lendingRecords.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-lg">貸し出し記録がありません</p>
          </div>
        ) : (
          <>
            <div className="mb-4 text-sm text-gray-600">
              総件数: {lendingRecords.length}件
            </div>
            <ul className="space-y-4">
              {lendingRecords.map((record) => (
                <LendingRecordItem 
                  key={generateRecordKey(record)} 
                  record={record} 
                />
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
