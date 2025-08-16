export interface LendingRecord {
  id: number
  lent_id: string
  object_id: number
  discord_id: string
  lent_state: number
  lent_date: string
  user_name: string
  object_name: string
  code_value: string
  category_name: string
}

export interface LendingRecordItemProps {
  record: LendingRecord
  onReturn?: (recordId: number) => void
  showActions?: boolean
}
export interface LendingStatusLoaderData {
  lendingRecords: LendingRecord[]
  error?: string
}

export interface LendingResponse {
  success: boolean
  message?: string
  data?: LendingRecord[]
}

export interface ReturnLendingRequest {
  id: number
  return_date: string
}
