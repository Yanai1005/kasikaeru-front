// app/components/lending-record-item.tsx

import React from "react";

// Propsの型を定義
type LendingRecordItemProps = {
  record: {
    lentId: string;
    objectId: string;
    objectName: string;
    name: string;
    discordId: string;
    lentState: boolean;
    lentDate: string;
  };
};

const LendingRecordItem: React.FC<LendingRecordItemProps> = ({ record }) => {
  return (
    <li className="p-4 border border-gray-200 rounded-lg shadow-sm flex flex-col sm:flex-row sm:justify-between sm:items-center">
      <div>
        <p className="font-semibold text-gray-900">
          <span className="text-sm text-gray-500 mr-2">貸出ID:</span>{record.lentId}
        </p>
        <p className="font-semibold text-lg text-indigo-600 mt-1 sm:mt-0">
          <span className="text-sm text-gray-500 mr-2">備品名:</span>{record.objectName}
        </p>
        <p className="font-semibold text-gray-900">
          <span className="text-sm text-gray-500 mr-2">備品ID:</span>{record.objectId}
        </p>
        <p className="font-semibold text-gray-900">
          <span className="text-sm text-gray-500 mr-2">Discord:</span>{record.name+"(@"+record.discordId+")"}
        </p>
      </div>
      <div className="mt-2 sm:mt-0 sm:text-right">
        <p className="text-sm text-gray-500">
          貸し出し日時: {new Date(record.lentDate).toLocaleString()}
        </p>
        <p className={`font-bold text-lg mt-1 ${record.lentState ? 'text-red-500' : 'text-green-500'}`}>
          {record.lentState ? '貸出中' : '返却済み'}
        </p>
      </div>
    </li>
  );
};

export default LendingRecordItem;