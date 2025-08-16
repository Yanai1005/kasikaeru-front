export interface ObjectInfo {
  object_id: number
  code_value: string
  object_name: string
  category_id: number
  category_name: string
  is_lent: boolean
  lent_id?: string
  lent_date?: string
  lent_to_user?: string
}

export interface User {
  discord_id: string
  name: string
}

export interface LendingFormData {
  objectInfo: ObjectInfo
  selectedUserId: string
}
