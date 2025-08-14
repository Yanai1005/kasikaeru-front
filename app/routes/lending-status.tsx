import type { MetaFunction,LoaderFunctionArgs } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import Navbar from "~/components/navbar";
import fs from "fs/promises";
import LendingRecordItem from "~/components/lending-record-item";
// JSONファイルのデータを扱うための型定義
type LendingRecord = {
  lentId: string;
  objectId: string;
  objectName: string;
  name: string;
  discordId: string;
  lentState: boolean;
  lentDate: string;
};

type ObjectRecord = {
  objectId: string;
  objectName: string;
};

type UserRecord = {
  discordId: string;
  name: string;
};

export async function loader({ params }: LoaderFunctionArgs) {
  // lent.jsonから貸出記録を読み込む
  const lentDataPath = "./data/lent.json";
  const lentData = await fs.readFile(lentDataPath, "utf-8");
  const lentRecords: LendingRecord[] = JSON.parse(lentData);

  // objects.jsonから備品情報を読み込む
  const objectsDataPath = "./data/master/objects.json";
  const objectsData = await fs.readFile(objectsDataPath, "utf-8");
  const objectRecords: ObjectRecord[] = JSON.parse(objectsData);

  const usersDataPath = "./data/master/users.json";
  const usersData = await fs.readFile(usersDataPath, "utf-8");
  const usersRecords: UserRecord[] = JSON.parse(usersData);

  // 貸出記録に備品名を結合する
  const recordsWithNames = lentRecords.map(record => {
    const object = objectRecords.find(obj => obj.objectId === record.objectId);
    const user = usersRecords.find(user => user.discordId === record.discordId);
    return {
      ...record,
      objectName: object ? object.objectName : "不明な備品",
      name: user ? user.name : "不明なユーザー"
    };
  });

  return { lendingRecords: recordsWithNames };
}

export const meta: MetaFunction = () => {
  return [{ title: "貸し出し状況 | 貸し借り管理システム" }];
};

export default function LendingStatus() {
  const { lendingRecords } = useLoaderData<{ lendingRecords: LendingRecord[] }>();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          貸し出し状況 | 貸し借り管理システム
        </h1>
      </header>
      <Navbar />
      <div className="container mx-auto p-4 bg-white rounded-lg shadow-lg mt-8">
        <ul className="space-y-4">
          {lendingRecords.map((record) => (
            // 切り出したコンポーネントを呼び出す
            <LendingRecordItem key={record.objectId + record.discordId} record={record} />
          ))}
        </ul>
      </div>
    </div>
  );
}