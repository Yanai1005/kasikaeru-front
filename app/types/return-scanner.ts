import type { ObjectInfo } from '~/types/object'

export interface ReturnBarcodeScannerProps {
  apiUrl: string
  onReturnComplete?: () => void
}

export interface ReturnObjectInfoDisplayProps {
  objectInfo: ObjectInfo | null
  loading: boolean
}

export interface ReturnFormProps {
  objectInfo: ObjectInfo | null
  onReturn: () => void
  onReset: () => void
  loading: boolean
}

export interface UseReturnProps {
  apiUrl: string
  onReturnComplete?: () => void
}

export interface UseReturnReturn {
  objectInfo: ObjectInfo | null
  loading: boolean
  error: string | null
  success: string | null
  fetchObjectInfo: (code: string) => Promise<void>
  handleReturn: () => Promise<void>
  reset: () => void
}

export type { ObjectInfo }
